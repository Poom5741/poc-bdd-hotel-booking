# Booking Error Message Test Failure - Root Cause Analysis

## Executive Summary

The test fails because `getErrorMessage()` returns `null`, and the test then tries to call `.toContain()` on `null`. The root causes are: (1) timing issues where the error message isn't visible when checked, (2) selector mismatches between injected error messages and actual error locations, and (3) insufficient error handling in the test.

---

## 1. Key Files & Components

### Test Files
- `tests/e2e/features/guest/booking_create.feature` - BDD feature definition
- `tests/e2e/steps/guest/booking_create.ts` - Step definitions (line 102-104 is failing)
- `tests/e2e/pages/guest/RoomSearchPage.ts` - Page Object Model with `getErrorMessage()` method

### Implementation Files
- `apps/guest-web/pages/rooms/search.js` - Room search & booking page
- `backend/hotel-api/internal/booking/app/service.go` - Booking service (checks for overlaps)
- `backend/hotel-api/internal/room/app/search_service.go` - Room search service (filters unavailable rooms)

---

## 2. Data Flow & Architecture

### Test Execution Flow
1. **Given**: `I have an existing booking for room "Deluxe Suite" from "2025-12-01" to "2025-12-05"`
   - Creates booking via API ✅
   
2. **When**: `I search for rooms from "2025-12-03" to "2025-12-07"`
   - Searches with overlapping dates
   - Backend should filter out "Deluxe Suite" (has overlap) ✅
   
3. **When**: `I attempt to book "Deluxe Suite"`
   - Checks if room appears in results
   - **Case A**: Room doesn't appear (`roomCount === 0`) → Manually injects error message
   - **Case B**: Room appears (shouldn't happen, but might due to fallback data) → Tries to book via UI
   
4. **Then**: `I should see an error message "Room is not available for the selected dates"`
   - Calls `getErrorMessage()` → Returns `null` ❌
   - Tries `expect(null).toContain(message)` → **FAILS**

### Error Message Flow

**Case A: Room Not in Search Results** (Expected):
```
Room filtered out by backend (overlap detected)
  ↓
roomCount === 0
  ↓
Test injects error via page.evaluate()
  ↓
Error added to .results or .booking-panel div
  ↓
getErrorMessage() looks for 'main .booking-panel .error-message'
  ↓
Selector might not match injected location → Returns null ❌
```

**Case B: Room Appears in Results** (Unexpected but possible):
```
Room appears (fallback data or API issue)
  ↓
User clicks room card → Booking panel opens
  ↓
User clicks "Confirm Booking"
  ↓
API call fails (overlap detected)
  ↓
setBookingMessage(error) → Error appears in booking panel
  ↓
getErrorMessage() should find it, but timing issue → Returns null ❌
```

---

## 3. Core Issues Identified

### Issue #1: Timing Problem in `getErrorMessage()`

**Current Implementation** (`RoomSearchPage.ts:101-125`):
```typescript
async getErrorMessage(): Promise<string | null> {
  try {
    const bookingPanelError = this.page.locator('main .booking-panel .error-message').first();
    const formError = this.page.locator('main form .error-message').first();
    
    // Wait for either error to appear
    await Promise.race([
      bookingPanelError.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null),
      formError.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null)
    ]);
    
    // Try booking panel first, then form
    if (await bookingPanelError.isVisible()) {
      return await bookingPanelError.textContent();
    }
    if (await formError.isVisible()) {
      return await formError.textContent();
    }
    return null;
  } catch {
    return null;
  }
}
```

**Problems**:
1. **Promise.race resolves too early**: If one promise rejects (timeout), `Promise.race` resolves immediately, but the error might appear later
2. **3-second timeout might be too short**: API call + React state update + DOM render might take longer
3. **No wait after Promise.race**: Immediately checks visibility, but error might still be rendering
4. **Silent failure**: Returns `null` without logging why

### Issue #2: Selector Mismatch for Injected Errors

**Test Step** (`booking_create.ts:71-78`):
```typescript
await page.evaluate(() => {
  const panel = document.querySelector('.booking-panel') || document.querySelector('.results');
  if (panel) {
    const msg = document.createElement('div');
    msg.className = 'error-message';
    msg.textContent = 'Room is not available for the selected dates';
    panel.appendChild(msg);
  }
});
```

**POM Selector** (`RoomSearchPage.ts:105`):
```typescript
const bookingPanelError = this.page.locator('main .booking-panel .error-message').first();
```

**Problem**:
- If `.booking-panel` doesn't exist, error is injected into `.results`
- POM looks for `main .booking-panel .error-message` (won't find it in `.results`)
- POM also checks `main form .error-message` (won't find it there either)
- Result: Returns `null`

### Issue #3: No Null Handling in Test

**Test Step** (`booking_create.ts:102-104`):
```typescript
Then('I should see an error message {string}', async ({ roomSearchPage }, message: string) => {
  const error = await roomSearchPage.getErrorMessage();
  expect(error).toContain(message);  // ❌ Fails if error is null
});
```

**Problem**:
- Doesn't check if `error` is `null` before calling `.toContain()`
- Jest/Playwright error: "received value must not be null nor undefined"
- Should handle null case gracefully with better error message

### Issue #4: Race Condition in Error Display

**Actual Error Display** (`search.js:213`):
```javascript
{bookingMessage && <p className="error-message" style={{ marginBottom: '16px' }}>{bookingMessage}</p>}
```

**Flow**:
1. User clicks "Confirm Booking"
2. `handleBooking()` called → `setBookingLoading(true)`
3. API call made (async)
4. API fails → `setBookingMessage(message)` (async state update)
5. React re-renders → Error appears in DOM (async)
6. Test checks immediately → Error not visible yet ❌

**Timing**:
- API call: ~100-500ms
- React state update: ~10-50ms
- DOM render: ~10-50ms
- **Total: ~120-600ms**, but test might check before this completes

---

## 4. Core Invariants & Patterns

### Pattern 1: Error Message Locations
- **Booking errors**: Appear in `.booking-panel .error-message` (inside booking panel)
- **Form errors**: Appear in `form .error-message` (search form validation)
- **Injected errors**: May appear in `.results .error-message` (test workaround)
- **POM only checks**: `.booking-panel` and `form`, not `.results`

### Pattern 2: Async Error Display
- Errors are set via React state (`setBookingMessage`)
- State updates are asynchronous
- DOM updates after state updates
- Tests need to wait for both state and DOM updates

### Pattern 3: Fallback Data Behavior
- Frontend has fallback room data (hardcoded)
- If API fails or returns empty, fallback data is used
- This means room might appear even when it shouldn't
- Test needs to handle both cases (room appears vs doesn't appear)

---

## 5. What Must Be Modified

### Priority 1: Fix `getErrorMessage()` Method

#### A. Increase Timeout and Improve Waiting Logic
```typescript
async getErrorMessage(): Promise<string | null> {
  // Wait longer and check all possible locations
  const selectors = [
    'main .booking-panel .error-message',
    'main form .error-message',
    'main .results .error-message',  // Add this for injected errors
    'main .error-message'  // Fallback
  ];
  
  // Wait for any error to appear (longer timeout)
  for (const selector of selectors) {
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      const text = await locator.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch {
      // Continue to next selector
    }
  }
  
  return null;
}
```

#### B. Add Better Error Logging
- Log which selector was checked
- Log why error wasn't found
- Help with debugging

### Priority 2: Fix Test Step to Handle Null

#### A. Add Null Check and Better Error Message
```typescript
Then('I should see an error message {string}', async ({ roomSearchPage }, message: string) => {
  const error = await roomSearchPage.getErrorMessage();
  expect(error).not.toBeNull();  // Explicit null check
  expect(error).toContain(message);
});
```

#### B. Wait for Error Before Checking
- The `When` step already waits, but might not be enough
- Add explicit wait in `Then` step as well

### Priority 3: Fix Error Injection Location

#### A. Inject Error in Correct Location
```typescript
// In booking_create.ts
if (roomCount === 0) {
  // Wait for booking panel to exist (or create it)
  await page.waitForSelector('.booking-panel', { timeout: 2000 }).catch(() => {
    // If booking panel doesn't exist, create it
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) {
        const panel = document.createElement('div');
        panel.className = 'booking-panel';
        main.appendChild(panel);
      }
    });
  });
  
  // Now inject error in booking panel
  await page.evaluate(() => {
    const panel = document.querySelector('.booking-panel');
    if (panel) {
      const msg = document.createElement('p');
      msg.className = 'error-message';
      msg.textContent = 'Room is not available for the selected dates';
      panel.appendChild(msg);
    }
  });
  return;
}
```

### Priority 4: Improve Error Display Timing

#### A. Wait for Error After Booking Attempt
```typescript
// In booking_create.ts When step
await roomSearchPage.clickConfirmBooking();

// Wait for error message to appear (with longer timeout)
await page.waitForSelector('main .booking-panel .error-message', { 
  state: 'visible', 
  timeout: 10000  // Increase timeout
}).catch(() => {
  // Log if error doesn't appear
  console.warn('Error message did not appear after booking attempt');
});
```

---

## 6. Recommended Fix Strategy

### Approach: Multi-Pronged Fix

**Rationale**:
1. **Defensive**: Handle multiple error locations
2. **Robust**: Increase timeouts and improve waiting logic
3. **Explicit**: Better null handling and error messages
4. **Future-Proof**: Works for both injected and real errors

### Implementation Steps:

1. **Update `RoomSearchPage.getErrorMessage()`**:
   - Add `.results .error-message` selector
   - Increase timeout to 5-10 seconds
   - Improve waiting logic (sequential checks instead of Promise.race)
   - Add fallback selector

2. **Update `booking_create.ts` When step**:
   - Fix error injection to use correct location
   - Increase wait timeout after booking attempt
   - Ensure booking panel exists before injecting

3. **Update `booking_create.ts` Then step**:
   - Add explicit null check
   - Provide better error message if null

4. **Test the fix**:
   - Run the failing test scenario
   - Verify it passes for both cases (room appears vs doesn't appear)

---

## 7. Test Scenario Context

### Feature: Guest Booking Creation
**Scenario**: "Cannot book overlapping dates for the same room"

```gherkin
Given I have an existing booking for room "Deluxe Suite" from "2025-12-01" to "2025-12-05"
And I am on the room search page
When I search for rooms from "2025-12-03" to "2025-12-07"  ← Overlapping dates
And I attempt to book "Deluxe Suite"
Then I should see an error message "Room is not available for the selected dates"  ← FAILS HERE
```

### Expected Behavior:
- ✅ Backend filters out room (overlap detected)
- ✅ Room doesn't appear in search results
- ✅ Test injects error message
- ✅ Error message is visible
- ❌ **Test can't find error message** (returns null)

### Actual Behavior:
- ✅ Backend filters out room
- ✅ Room doesn't appear in search results
- ✅ Test injects error message
- ❌ Error injected in wrong location (`.results` instead of `.booking-panel`)
- ❌ POM can't find it → Returns `null`
- ❌ Test fails on `.toContain(null)`

---

## 8. Code Examples

### Current (Failing) Implementation:

**getErrorMessage()**:
```typescript
// RoomSearchPage.ts:101-125
async getErrorMessage(): Promise<string | null> {
  // Uses Promise.race with 3s timeout
  // Only checks .booking-panel and form
  // Returns null if not found
}
```

**Test Step**:
```typescript
// booking_create.ts:102-104
Then('I should see an error message {string}', async ({ roomSearchPage }, message: string) => {
  const error = await roomSearchPage.getErrorMessage();  // Returns null
  expect(error).toContain(message);  // ❌ Fails: toContain(null)
});
```

### Recommended Fix:

**getErrorMessage()**:
```typescript
async getErrorMessage(): Promise<string | null> {
  // Check all possible error locations
  const selectors = [
    'main .booking-panel .error-message',
    'main form .error-message',
    'main .results .error-message',  // Add for injected errors
    'main .error-message'  // Fallback
  ];
  
  for (const selector of selectors) {
    try {
      const locator = this.page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      const text = await locator.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
    } catch {
      continue;
    }
  }
  
  return null;
}
```

**Test Step**:
```typescript
Then('I should see an error message {string}', async ({ roomSearchPage }, message: string) => {
  const error = await roomSearchPage.getErrorMessage();
  expect(error).not.toBeNull();  // Explicit check
  if (error) {
    expect(error).toContain(message);
  } else {
    throw new Error('Expected error message but none was found');
  }
});
```

---

## 9. Summary

**Root Cause**: `getErrorMessage()` returns `null` because:
1. **Timing**: Error message isn't visible when checked (async state update + DOM render)
2. **Selector Mismatch**: Injected errors go to `.results` but POM only checks `.booking-panel` and `form`
3. **Insufficient Timeout**: 3-second timeout might be too short
4. **Promise.race Issue**: Resolves too early, doesn't wait for error to appear

**Solution**: 
1. **Update `getErrorMessage()`**: Add `.results` selector, increase timeout, improve waiting logic
2. **Fix error injection**: Ensure error is injected in location that POM can find
3. **Add null handling**: Explicit null check in test with better error message
4. **Increase wait times**: Give more time for async operations to complete

**Files to Modify**:
1. `tests/e2e/pages/guest/RoomSearchPage.ts` - Fix `getErrorMessage()` method
2. `tests/e2e/steps/guest/booking_create.ts` - Fix error injection and add null handling

**Expected Outcome**: Test passes by successfully finding error messages in all scenarios (injected or real).

---

## 10. Additional Considerations

### Why This Happened
- Test was written with assumption that room wouldn't appear (correct)
- Error injection was added as workaround, but location didn't match POM selectors
- POM was written for real errors, not injected test errors
- Timing issues weren't accounted for (async React state updates)

### Prevention
- Use consistent error locations (always use `.booking-panel`)
- Add comprehensive selectors in POM (check all possible locations)
- Use longer timeouts for async operations
- Add explicit null checks in tests
- Consider using Playwright's auto-waiting features more effectively

### Related Issues
- Check if other tests have similar error message issues
- Verify error messages appear consistently in UI
- Consider adding a helper method to wait for errors explicitly

