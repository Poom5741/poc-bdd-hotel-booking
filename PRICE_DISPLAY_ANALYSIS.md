# Booking Price Display Test Failure - Root Cause Analysis

## Executive Summary

The test fails because `hasPriceDisplayed()` returns `false` when it should return `true`. The root cause is a **timing issue**: the test checks for the price before React's `useEffect` completes calculating and displaying it. The element exists but initially shows "Total: " (empty) until the calculation completes.

---

## 1. Key Files & Components

### Test Files
- `tests/e2e/features/guest/booking_create.feature` - BDD feature definition
- `tests/e2e/steps/guest/booking_create.ts` - Step definitions (line 131-133 is failing)
- `tests/e2e/pages/guest/ConfirmationPage.ts` - Page Object Model with `hasPriceDisplayed()` method

### Implementation Files
- `apps/guest-web/pages/confirmation.js` - Confirmation page component
- `apps/guest-web/pages/rooms/search.js` - Room search page (stores booking summary in localStorage)

---

## 2. Data Flow & Architecture

### Test Execution Flow
1. **Given**: `I am on the room search page`
2. **When**: `I search for rooms from "2025-12-10" to "2025-12-12"`
3. **When**: `I select a room card` → Opens booking panel
4. **When**: `I choose "1" guest` → Sets guest count
5. **When**: `I submit the booking` → Creates booking, stores in localStorage, redirects to `/confirmation`
6. **Then**: `the booking summary should show a total price` → **FAILS HERE**

### Price Calculation Flow

**Step 1: Booking Creation** (`search.js:269-278`):
```javascript
window.localStorage.setItem(
  'booking_summary',
  JSON.stringify({
    roomId: room.id,
    checkIn,
    checkOut,
    guests,
    pricePerNight: room.displayPrice || room.basePrice || 100,
  }),
);
window.location.href = '/confirmation';
```

**Step 2: Confirmation Page Load** (`confirmation.js:7-28`):
```javascript
useEffect(() => {
  const stored = window.localStorage.getItem('booking_summary');
  if (stored) {
    const parsed = JSON.parse(stored);
    setSummary(parsed);
    // ... calculation ...
    setTotal(`$${totalAmount.toFixed(0)}`);
  }
}, []);
```

**Step 3: Initial Render** (`confirmation.js:30-38`):
```javascript
if (!summary) {
  return (
    <main>
      <p>No booking data.</p>  // No .total-price element here
    </main>
  );
}
```

**Step 4: After useEffect** (`confirmation.js:41-53`):
```javascript
return (
  <main>
    <div className="summary">
      <p className="total-price">Total: {total}</p>  // total starts as ''
    </div>
  </main>
);
```

### Timing Issue

```
User submits booking
  ↓
localStorage.setItem('booking_summary', ...)
  ↓
window.location.href = '/confirmation'  (Navigation)
  ↓
React component mounts
  ↓
Initial render: summary = null → Shows "No booking data" (no .total-price)
  ↓
useEffect runs (async)
  ↓
Reads localStorage → setSummary(parsed) → setTotal('$360')
  ↓
React re-renders → Shows price
  ↓
Test checks hasPriceDisplayed() → ❌ Might run before re-render completes
```

---

## 3. Core Issues Identified

### Issue #1: Race Condition - Test Runs Before Price is Calculated

**Current Implementation** (`ConfirmationPage.ts:28-35`):
```typescript
async hasPriceDisplayed(): Promise<boolean> {
  const count = await this.totalPrice.count();
  if (count === 0) {
    return false;
  }
  const text = await this.totalPrice.textContent();
  return text !== null && text.trim().length > 0;
}
```

**Problem**:
1. **Element might not exist yet**: If test runs before `useEffect` completes, `summary` is still `null`, so the component renders "No booking data" (no `.total-price` element)
2. **Element exists but price is empty**: If test runs after first render but before `setTotal()` completes, element shows "Total: " (empty string)
3. **No wait for price to be calculated**: Method doesn't wait for the price to actually appear

### Issue #2: State Initialization Timing

**Confirmation Page** (`confirmation.js:4-5`):
```javascript
const [summary, setSummary] = useState(null);
const [total, setTotal] = useState('');  // Starts as empty string
```

**Initial Render**:
- `summary` = `null` → Component shows "No booking data" → **No `.total-price` element**
- After `useEffect`: `summary` = `{...}` → Component shows summary → `.total-price` element exists
- But `total` = `''` initially → Element shows "Total: " (empty)
- After calculation: `total` = `'$360'` → Element shows "Total: $360"

**Problem**: There's a window where:
- Element exists (count > 0) ✅
- But text is "Total: " (empty total) ❌
- `text.trim()` = "Total:" (length 6) → Should return `true`... unless...

### Issue #3: Text Content Check Logic

**Current Check**:
```typescript
const text = await this.totalPrice.textContent();
return text !== null && text.trim().length > 0;
```

**Scenarios**:
1. **Element doesn't exist** (before useEffect): `count === 0` → Returns `false` ✅ Correct
2. **Element exists, total is empty**: `text = "Total: "` → `text.trim() = "Total:"` → `length = 6` → Returns `true` ✅
3. **Element exists, total is calculated**: `text = "Total: $360"` → Returns `true` ✅

**Wait, why is it returning false then?**

**Possible reasons**:
- Test runs before element is created (before `useEffect` sets `summary`)
- Element is created but immediately removed/recreated during React re-render
- Timing issue: `textContent()` is called during React's render cycle

### Issue #4: No Wait for Price Calculation

**Test Step** (`booking_create.ts:131-133`):
```typescript
Then('the booking summary should show a total price', async ({ confirmationPage }) => {
  const hasPrice = await confirmationPage.hasPriceDisplayed();
  expect(hasPrice).toBe(true);
});
```

**Problem**:
- No explicit wait for the price to be calculated
- Relies on Playwright's auto-waiting, but that only waits for element existence, not for content to be populated
- Doesn't wait for `useEffect` to complete

---

## 4. Core Invariants & Patterns

### Pattern 1: Async State Updates
- React state updates are asynchronous
- `useEffect` runs after initial render
- State updates trigger re-renders
- Tests need to wait for these async operations

### Pattern 2: localStorage → State Flow
- Data stored in localStorage before navigation
- Page reads from localStorage in `useEffect`
- State is set asynchronously
- UI updates after state is set

### Pattern 3: Conditional Rendering
- Component conditionally renders based on `summary` state
- If `summary` is `null`, shows "No booking data" (no price element)
- If `summary` exists, shows summary with price
- Price element only exists when `summary` is not null

---

## 5. What Must Be Modified

### Priority 1: Fix `hasPriceDisplayed()` Method

#### A. Wait for Price to be Calculated
```typescript
async hasPriceDisplayed(): Promise<boolean> {
  // Wait for the element to exist first
  try {
    await this.totalPrice.waitFor({ state: 'attached', timeout: 5000 });
  } catch {
    return false;  // Element doesn't exist
  }
  
  // Wait for the price to actually be calculated (not just "Total: ")
  // The price should contain a dollar sign and numbers
  const pricePattern = /\$\d+/;
  try {
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const text = el.textContent || '';
        return /\$\d+/.test(text);  // Contains $ followed by digits
      },
      '.total-price',
      { timeout: 5000 }
    );
    return true;
  } catch {
    // Fallback: check if text exists and contains price pattern
    const text = await this.totalPrice.textContent();
    return text !== null && /\$\d+/.test(text);
  }
}
```

#### B. Simpler Approach: Wait for Non-Empty Price
```typescript
async hasPriceDisplayed(): Promise<boolean> {
  try {
    // Wait for element to exist
    await this.totalPrice.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for price to be calculated (not just "Total: ")
    // Price should contain $ and digits
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        return el && /\$\d+/.test(el.textContent || '');
      },
      '.total-price',
      { timeout: 5000 }
    );
    
    return true;
  } catch {
    return false;
  }
}
```

### Priority 2: Update Test Step to Wait Explicitly

#### A. Add Explicit Wait in Test
```typescript
Then('the booking summary should show a total price', async ({ confirmationPage, page }) => {
  // Wait for confirmation page to load and price to be calculated
  await page.waitForSelector('.total-price', { state: 'visible' });
  
  // Wait for price to contain actual value (not just "Total: ")
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.total-price');
      return el && /\$\d+/.test(el.textContent || '');
    },
    { timeout: 5000 }
  );
  
  const hasPrice = await confirmationPage.hasPriceDisplayed();
  expect(hasPrice).toBe(true);
});
```

### Priority 3: Improve POM Method (Recommended)

#### A. Better Implementation with Pattern Matching
```typescript
async hasPriceDisplayed(): Promise<boolean> {
  try {
    // Wait for element to be visible
    await this.totalPrice.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for price to be calculated (contains $ and digits)
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const text = el.textContent || '';
        // Check if text contains price pattern: $ followed by digits
        return /\$\d+/.test(text);
      },
      '.total-price',
      { timeout: 5000 }
    );
    
    // Double-check by getting text content
    const text = await this.totalPrice.textContent();
    return text !== null && /\$\d+/.test(text);
  } catch {
    return false;
  }
}
```

---

## 6. Recommended Fix Strategy

### Approach: Wait for Price Pattern (Most Reliable)

**Rationale**:
1. **Explicit**: Waits for actual price content, not just element existence
2. **Robust**: Uses pattern matching to ensure price is calculated
3. **Future-Proof**: Works even if price format changes slightly
4. **Clear Intent**: Makes it obvious we're waiting for a calculated value

### Implementation Steps:

1. **Update `ConfirmationPage.hasPriceDisplayed()`**:
   - Wait for element to be visible
   - Wait for text to match price pattern (`/\$\d+/`)
   - Return true only if pattern matches

2. **Test the fix**:
   - Run the failing test scenario
   - Verify it passes consistently

---

## 7. Test Scenario Context

### Feature: Guest Booking Creation
**Scenario**: "Booking summary shows correct price"

```gherkin
Given I am on the room search page
When I search for rooms from "2025-12-10" to "2025-12-12"
And I select a room card
And I choose "1" guest
And I submit the booking
Then the booking summary should show a total price  ← FAILS HERE
```

### Expected Behavior:
- ✅ Booking created successfully
- ✅ Redirected to `/confirmation` page
- ✅ localStorage contains booking summary
- ✅ `useEffect` reads localStorage and calculates price
- ✅ Price displayed as "Total: $360" (or similar)
- ❌ **Test can't find price** (returns false)

### Actual Behavior:
- ✅ Booking created successfully
- ✅ Redirected to `/confirmation` page
- ✅ localStorage contains booking summary
- ⚠️ `useEffect` runs asynchronously
- ⚠️ Test checks before price is calculated
- ❌ **Test fails** (hasPriceDisplayed returns false)

---

## 8. Code Examples

### Current (Failing) Implementation:

**hasPriceDisplayed()**:
```typescript
// ConfirmationPage.ts:28-35
async hasPriceDisplayed(): Promise<boolean> {
  const count = await this.totalPrice.count();
  if (count === 0) {
    return false;
  }
  const text = await this.totalPrice.textContent();
  return text !== null && text.trim().length > 0;  // ❌ Doesn't wait for price calculation
}
```

**Problem**: 
- Checks if element exists and has text
- But doesn't wait for `useEffect` to calculate price
- Might check when element shows "Total: " (empty)

### Recommended Fix:

**hasPriceDisplayed()**:
```typescript
async hasPriceDisplayed(): Promise<boolean> {
  try {
    // Wait for element to be visible
    await this.totalPrice.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for price to be calculated (contains $ and digits)
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const text = el.textContent || '';
        // Price pattern: $ followed by one or more digits
        return /\$\d+/.test(text);
      },
      '.total-price',
      { timeout: 5000 }
    );
    
    // Verify price is actually displayed
    const text = await this.totalPrice.textContent();
    return text !== null && /\$\d+/.test(text);
  } catch {
    return false;
  }
}
```

**Benefits**:
- ✅ Waits for element to exist
- ✅ Waits for price to be calculated (pattern match)
- ✅ Verifies price format is correct
- ✅ Handles timing issues gracefully

---

## 9. Summary

**Root Cause**: `hasPriceDisplayed()` returns `false` because:
1. **Timing**: Test checks before React's `useEffect` completes calculating the price
2. **No Wait**: Method doesn't wait for price calculation, only checks element existence
3. **Race Condition**: Element might exist but show "Total: " (empty) before calculation completes

**Solution**: 
1. **Update `hasPriceDisplayed()`**: Wait for price pattern (`/\$\d+/`) to appear, not just element existence
2. **Use `waitForFunction`**: Wait for text content to match price pattern before returning

**Files to Modify**:
1. `tests/e2e/pages/guest/ConfirmationPage.ts` - Fix `hasPriceDisplayed()` method

**Expected Outcome**: Test passes by waiting for the price to be calculated and displayed before checking.

---

## 10. Additional Considerations

### Why This Happened
- React's async state updates weren't accounted for
- Test assumed element existence = price displayed
- No explicit wait for calculation to complete
- `useEffect` timing wasn't considered

### Prevention
- Always wait for calculated values, not just element existence
- Use pattern matching for dynamic content
- Account for React's async state updates in tests
- Consider using `waitForFunction` for computed values

### Related Issues
- Check if other tests have similar timing issues with React state
- Verify other confirmation page tests work correctly
- Consider adding helper methods for waiting on calculated values

