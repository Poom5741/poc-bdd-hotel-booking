# E2E Test Button Location & Clickability Analysis

## Executive Summary

This analysis identifies button selector mismatches between the Page Object Model (POM) and the actual HTML implementation, causing test failures. The issues stem from class name discrepancies and selector scoping problems.

---

## 1. Key Files & Components

### Page Object Models (POMs)
- `tests/e2e/pages/admin/RoomManagementPage.ts` - Admin room management
- `tests/e2e/pages/admin/BookingOverviewPage.ts` - Admin booking overview
- `tests/e2e/pages/guest/RoomSearchPage.ts` - Guest room search & booking

### Actual Page Implementations
- `apps/admin-web/pages/admin/rooms.js` - Room management UI
- `apps/admin-web/pages/admin/bookings.js` - Booking overview UI
- `apps/guest-web/pages/rooms/search.js` - Room search & booking UI

---

## 2. Data Flow & Architecture

### Test Execution Flow
1. **Feature Files** (`.feature`) → Define BDD scenarios
2. **Step Definitions** (`steps/**/*.ts`) → Map steps to actions
3. **Page Object Models** → Encapsulate page interactions
4. **Actual Pages** → Render HTML with buttons

### Current Problem
**Selector Mismatch**: POMs use class selectors that don't match the actual HTML classes, causing:
- `Locator.click()` to fail (element not found)
- Timeout errors
- Test failures

---

## 3. Core Issues Identified

### Issue #1: Room Management - "Mark Out of Order" Button

**POM Selector** (`RoomManagementPage.ts:22`):
```typescript
this.outOfOrderButton = page.locator('.out-of-order-button');
```

**Actual HTML** (`rooms.js:249`):
```javascript
<button className="check-in-button" ...>
  {room.status === 'out_of_order' ? 'Mark Available' : 'Mark Out of Order'}
</button>
```

**Problem**: POM expects `.out-of-order-button`, but HTML uses `.check-in-button`

**Impact**: 
- `markOutOfOrder()` method fails
- Test: "Mark a room OUT_OF_ORDER and it should not appear in guest search"

---

### Issue #2: Room Management - "Delete" Button Scoping

**POM Selector** (`RoomManagementPage.ts:23`):
```typescript
this.deleteButton = page.locator('.delete-button');
```

**POM Method** (`RoomManagementPage.ts:46-48`):
```typescript
async deleteRoom(roomId: string): Promise<void> {
  const button = this.page.locator(`.room-item[data-id="${roomId}"] .delete-button`);
  await button.click();
}
```

**Actual HTML** (`rooms.js:255-260`):
```javascript
<article className="booking-item" data-id={room.displayId} ...>
  <button className="delete-button cancel-button" ...>Delete</button>
</article>
```

**Problem**: 
- POM method looks for `.room-item[data-id="..."]` but HTML uses `.booking-item`
- `data-id` uses `displayId` (e.g., "102") not full ID (e.g., "room-102")

**Impact**:
- Test: "Attempt to delete room with future bookings results in error"

---

### Issue #3: Booking Overview - "Apply Filter" Button

**POM Selector** (`BookingOverviewPage.ts:29`):
```typescript
this.applyFilterButton = page.locator('.apply-filter-button');
```

**Actual HTML** (`bookings.js:181-188`):
```javascript
<button className="submit-button" type="button" onClick={handleFilter} ...>
  {loading ? 'Filtering…' : 'Apply Filter'}
</button>
```

**Problem**: POM expects `.apply-filter-button`, but HTML uses `.submit-button`

**Impact**:
- `filterBookings()` method fails
- Test: "View bookings list filtered by date range"

---

### Issue #4: Booking Overview - "Check In/Out" Button Scoping

**POM Selector** (`BookingOverviewPage.ts:31-32`):
```typescript
this.checkInButton = page.locator('.check-in-button');
this.checkOutButton = page.locator('.check-out-button');
```

**POM Method** (`BookingOverviewPage.ts:55-57`):
```typescript
async markCheckedIn(bookingId: string): Promise<void> {
  const button = this.page.locator(`.booking-item[data-id="${bookingId}"] .check-in-button`);
  await button.click();
}
```

**Actual HTML** (`bookings.js:206-253`):
```javascript
<article className="booking-item" data-id={b.id} ...>
  <button className="check-in-button" ...>Check In</button>
  <button className="check-out-button" ...>Check Out</button>
</article>
```

**Status**: ✅ **This one is CORRECT** - selector matches HTML

---

### Issue #5: Room Search - "Confirm Booking" Button

**POM Selector** (`RoomSearchPage.ts:27`):
```typescript
this.confirmBookingButton = page.locator('.confirm-booking-button');
```

**Actual HTML** (`search.js:225-243`):
```javascript
<button type="button" className="submit-button" ...>
  {bookingLoading ? 'Processing…' : 'Confirm Booking'}
</button>
```

**Problem**: POM expects `.confirm-booking-button`, but HTML uses `.submit-button`

**Impact**:
- `clickConfirmBooking()` method fails
- Tests: 
  - "Create booking from search results"
  - "Booking summary shows correct price"
  - "Cannot book overlapping dates for the same room"

---

### Issue #6: Room Search - "Book Now" Button Click Interception

**POM Method** (`RoomSearchPage.ts:59-66`):
```typescript
async clickFirstRoomCard(): Promise<void> {
  const roomCards = await this.getRoomCards();
  if (roomCards.length === 0) {
    throw new Error('No room cards found');
  }
  await roomCards[0].click();
  await this.waitForBookingPanel();
}
```

**Actual HTML** (`search.js:143-191`):
```javascript
<article className="room-card" ... onClick={() => { setSelectedRoom(room); ... }}>
  <button type="button" className="submit-button" ... onClick={async (e) => {
    e.stopPropagation();
    ...
  }}>
    Book Now
  </button>
</article>
```

**Problem**: 
- Room card is clickable (`onClick` on `<article>`)
- "Book Now" button has `e.stopPropagation()` but POM clicks the card, not the button
- This may work, but clicking the button directly is more reliable

**Impact**: Potential flakiness in booking flow

---

### Issue #7: Room Management - "Save Room" Button

**POM Selector** (`RoomManagementPage.ts:20`):
```typescript
this.saveButton = page.locator('form button[type="submit"]').filter({ hasText: 'Save Room' });
```

**Actual HTML** (`rooms.js:199-201`):
```javascript
<button type="submit" className="submit-button" disabled={loading} ...>
  {loading ? 'Saving…' : 'Save Room'}
</button>
```

**Status**: ✅ **This one is CORRECT** - selector should work

**Potential Issue**: If button is disabled during loading, test might fail. Need to wait for button to be enabled.

---

## 4. Core Invariants & Patterns

### Pattern 1: Class Name Inconsistency
- **POMs use semantic class names** (e.g., `.confirm-booking-button`, `.apply-filter-button`)
- **HTML uses generic class names** (e.g., `.submit-button`, `.check-in-button`)
- **Solution**: Either update POMs to match HTML, or update HTML to match POMs (prefer updating POMs for less code change)

### Pattern 2: Data Attribute Scoping
- **POMs expect specific data attributes** (e.g., `data-id` on `.room-item`)
- **HTML uses different structures** (e.g., `.booking-item` with `data-id`)
- **Solution**: Update POM selectors to match actual HTML structure

### Pattern 3: Button Text vs Class
- Some buttons are identified by text content (e.g., "Save Room", "Apply Filter")
- Some buttons are identified by class (e.g., `.check-in-button`)
- **Solution**: Use more specific selectors combining class + text or scoped selectors

---

## 5. What Must Be Modified

### Priority 1: Critical Button Selectors

#### A. `RoomManagementPage.ts`
1. **Fix "Mark Out of Order" button**:
   - Change `.out-of-order-button` → `.check-in-button` scoped to room item
   - Update `markOutOfOrder()` to use correct selector

2. **Fix "Delete" button scoping**:
   - Change `.room-item` → `.booking-item` in `deleteRoom()`
   - Ensure `roomId` normalization matches `displayId` format

#### B. `BookingOverviewPage.ts`
1. **Fix "Apply Filter" button**:
   - Change `.apply-filter-button` → `.submit-button` with text filter or scoped selector

#### C. `RoomSearchPage.ts`
1. **Fix "Confirm Booking" button**:
   - Change `.confirm-booking-button` → `.submit-button` scoped to `.booking-panel`
   - Or use: `page.locator('.booking-panel button[type="button"]').filter({ hasText: 'Confirm Booking' })`

### Priority 2: Robustness Improvements

#### D. `RoomSearchPage.ts`
1. **Improve room card clicking**:
   - Consider clicking "Book Now" button directly instead of card
   - Or ensure card click doesn't interfere with button clicks

#### E. `RoomManagementPage.ts`
1. **Add wait for button enabled state**:
   - Wait for "Save Room" button to be enabled before clicking
   - Handle loading states

---

## 6. Recommended Fix Strategy

### Approach: Update POMs to Match HTML (Less Invasive)

**Rationale**:
- HTML classes are already in use
- Changing HTML would require more files
- POMs are test infrastructure, easier to update

### Implementation Steps:

1. **Update `RoomManagementPage.ts`**:
   - Fix `outOfOrderButton` selector
   - Fix `deleteRoom()` method scoping
   - Add wait for button enabled states

2. **Update `BookingOverviewPage.ts`**:
   - Fix `applyFilterButton` selector

3. **Update `RoomSearchPage.ts`**:
   - Fix `confirmBookingButton` selector
   - Improve room card interaction

4. **Test all scenarios**:
   - Run e2e tests to verify fixes
   - Check for any remaining button click issues

---

## 7. Test Cases Affected

### Failing Tests (Based on test-results/):
1. ✅ `features-admin-room_manage-af2a1-ment-Create-a-new-room-type-chromium` - Save Room button
2. ✅ `features-admin-room_manage-6890e-e-bookings-results-in-error-chromium` - Delete button
3. ✅ `features-admin-booking_ove-8bf72-list-filtered-by-date-range-chromium` - Apply Filter button
4. ✅ `features-guest-booking_cre-66eab-booking-from-search-results-chromium` - Confirm Booking button
5. ✅ `features-guest-booking_cre-47495-summary-shows-correct-price-chromium` - Confirm Booking button
6. ✅ `features-guest-booking_cre-7bb6f-ing-dates-for-the-same-room-chromium` - Confirm Booking button

---

## 8. Summary

**Root Cause**: Class name mismatches between POM selectors and actual HTML implementation.

**Solution**: Update POM selectors to match actual HTML classes and structure.

**Files to Modify**:
1. `tests/e2e/pages/admin/RoomManagementPage.ts`
2. `tests/e2e/pages/admin/BookingOverviewPage.ts`
3. `tests/e2e/pages/guest/RoomSearchPage.ts`

**Expected Outcome**: All button-related test failures should be resolved after updating selectors.

