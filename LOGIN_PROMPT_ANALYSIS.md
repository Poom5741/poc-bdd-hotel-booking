# Login Prompt Test Failure - Root Cause Analysis

## Executive Summary

The test fails because it searches for text matching `/login/i` (case-insensitive "login"), but the actual login page HTML **does not contain the word "login" anywhere**. The page displays "Welcome Back" and "Sign in" instead.

---

## 1. Key Files & Components

### Test Files
- `tests/e2e/features/guest/auth_login.feature` - BDD feature definition
- `tests/e2e/steps/guest/auth_login.ts` - Step definitions (line 70-72 is failing)
- `tests/e2e/pages/guest/LoginPage.ts` - Page Object Model

### Implementation Files
- `apps/guest-web/pages/login.js` - Actual login page component
- `apps/guest-web/middleware.js` - Authentication middleware (redirects to /login)
- `apps/guest-web/pages/dashboard.js` - Protected page that redirects when unauthenticated

---

## 2. Data Flow & Architecture

### Test Execution Flow
1. **Given**: `I am not authenticated` → Clears cookies and permissions
2. **When**: `I navigate to "/dashboard"` → Attempts to access protected route
3. **Then**: `I should be redirected to "/login"` → Middleware redirects (this likely passes)
4. **And**: `I should see a login prompt` → **FAILS HERE** - Looks for text `/login/i` but can't find it

### Authentication Flow
```
User navigates to /dashboard
  ↓
Middleware checks for auth_token cookie
  ↓
No token found → Redirect to /login
  ↓
Login page renders with "Welcome Back" heading
  ↓
Test expects to find "login" text → NOT FOUND ❌
```

---

## 3. Core Issue Identified

### Issue: Text Content Mismatch

**Test Expectation** (`auth_login.ts:71-72`):
```typescript
Then('I should see a login prompt', async ({ page }) => {
  const loginHeader = page.getByText(/login/i);  // Looking for "login" (case-insensitive)
  await expect(loginHeader).toBeVisible();
});
```

**Actual Login Page Content** (`login.js:42-50`):
```javascript
return (
  <main className="page">
    <section className="card">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Sign in to access your bookings and manage your stay
        </p>
      </div>
      <form onSubmit={handleSubmit} className="form">
        ...
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
```

**Text Content Analysis**:
- ✅ "Welcome Back" (h1)
- ✅ "Sign in to access your bookings and manage your stay" (paragraph)
- ✅ "Sign in" (button text)
- ❌ **NO text containing "login"**

### Why It Fails

The regex `/login/i` searches for the literal word "login" (case-insensitive) anywhere in the page text, but:
- The heading says "Welcome Back" (not "Login")
- The button says "Sign in" (not "Login")
- The paragraph says "Sign in to access..." (not "Login to...")
- The only place "login" appears is in:
  - The component name: `export default function Login()`
  - The API endpoint: `/api/auth/login`
  - Error message: `'Login failed'` (but only shown on error)

**None of these are visible text content that Playwright can find with `getByText()`.**

---

## 4. Core Invariants & Patterns

### Pattern 1: UI Text vs Test Expectations
- **Test expects**: Generic "login" text
- **UI displays**: Branded "Welcome Back" and "Sign in"
- **Mismatch**: Test is too generic and doesn't match actual UI copy

### Pattern 2: Redirect Flow
- Middleware redirects unauthenticated users to `/login` ✅
- Dashboard page also has client-side redirect to `/login` ✅
- Both redirects work correctly
- **Issue**: Test verifies redirect but then fails on content verification

### Pattern 3: Page Object Model Usage
- `LoginPage.ts` exists but is **not used** in this step
- Step uses raw `page.getByText()` instead of POM methods
- POM has proper selectors but test doesn't leverage them

---

## 5. What Must Be Modified

### Option 1: Update Test to Match Actual UI (Recommended)

**Change the step to look for text that actually exists:**

```typescript
Then('I should see a login prompt', async ({ page }) => {
  // Option 1a: Look for "Welcome Back" heading
  const welcomeHeader = page.getByText(/welcome back/i);
  await expect(welcomeHeader).toBeVisible();
  
  // OR Option 1b: Look for "Sign in" button
  const signInButton = page.getByRole('button', { name: /sign in/i });
  await expect(signInButton).toBeVisible();
  
  // OR Option 1c: Look for email input (more reliable)
  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeVisible();
});
```

**Pros**: 
- Matches actual UI content
- More reliable (checks for actual form elements)
- Doesn't require UI changes

**Cons**: 
- Test becomes more specific to current UI copy

---

### Option 2: Use Page Object Model (Better Practice)

**Update step to use LoginPage POM:**

```typescript
Then('I should see a login prompt', async ({ loginPage }) => {
  // Verify we're on the login page by checking for email input
  await loginPage.emailInput.waitFor({ state: 'visible' });
  // Or check for the submit button
  await loginPage.submitButton.waitFor({ state: 'visible' });
});
```

**Pros**:
- Uses existing POM (better maintainability)
- Checks for actual functional elements (not just text)
- More robust (won't break if UI copy changes)

**Cons**:
- Requires updating the step to use POM fixture

---

### Option 3: Add "Login" Text to UI (Not Recommended)

**Update login page to include "login" text:**

```javascript
<h1 className="title">Login</h1>
// or
<h2>Please login to continue</h2>
```

**Pros**:
- Test passes without changes

**Cons**:
- Changes UI copy unnecessarily
- "Welcome Back" is better UX than "Login"
- Would need to update other tests that might rely on "Welcome Back"

---

## 6. Recommended Fix Strategy

### Approach: Use Page Object Model (Option 2)

**Rationale**:
1. **Best Practice**: Tests should use POMs for maintainability
2. **More Reliable**: Checking for form elements is more stable than text content
3. **Already Available**: `LoginPage` POM exists and has the right selectors
4. **Future-Proof**: Won't break if UI copy changes

### Implementation Steps:

1. **Update `auth_login.ts` step definition**:
   - Change from `page.getByText(/login/i)` 
   - To using `loginPage` fixture and checking for email input or submit button

2. **Verify redirect happened**:
   - Optionally check URL is `/login` first
   - Then verify login form elements are visible

3. **Test the fix**:
   - Run the failing test scenario
   - Verify it passes

---

## 7. Test Scenario Context

### Feature: Guest Authentication
**Scenario**: "Accessing dashboard without authentication redirects to login"

```gherkin
Given I am not authenticated
When I navigate to "/dashboard"
Then I should be redirected to "/login"  ← This likely passes
And I should see a login prompt          ← This FAILS
```

### Current Behavior:
- ✅ Redirect works (middleware + client-side both redirect)
- ✅ User lands on `/login` page
- ❌ Test can't find "login" text (because it doesn't exist)

### Expected Behavior After Fix:
- ✅ Redirect works
- ✅ User lands on `/login` page
- ✅ Test verifies login form is visible (using POM or actual UI text)

---

## 8. Code Examples

### Current (Failing) Implementation:
```typescript
// tests/e2e/steps/guest/auth_login.ts:70-72
Then('I should see a login prompt', async ({ page }) => {
  const loginHeader = page.getByText(/login/i);
  await expect(loginHeader).toBeVisible();  // ❌ Fails: "login" text not found
});
```

### Recommended Fix (Option 2 - POM):
```typescript
// tests/e2e/steps/guest/auth_login.ts:70-72
Then('I should see a login prompt', async ({ loginPage }) => {
  // Verify login form is visible by checking for email input
  await expect(loginPage.emailInput).toBeVisible();
  // Or verify submit button is visible
  await expect(loginPage.submitButton).toBeVisible();
});
```

### Alternative Fix (Option 1 - Match UI Text):
```typescript
// tests/e2e/steps/guest/auth_login.ts:70-72
Then('I should see a login prompt', async ({ page }) => {
  // Look for "Welcome Back" heading or "Sign in" button
  const welcomeText = page.getByText(/welcome back/i);
  await expect(welcomeText).toBeVisible();
});
```

---

## 9. Summary

**Root Cause**: Test searches for text "login" that doesn't exist in the UI. The login page displays "Welcome Back" and "Sign in" instead.

**Solution**: Update the test step to either:
1. **Use LoginPage POM** (recommended) - Check for `emailInput` or `submitButton` visibility
2. **Match actual UI text** - Look for "Welcome Back" or "Sign in" instead of "login"

**Files to Modify**:
- `tests/e2e/steps/guest/auth_login.ts` (line 70-72)

**Expected Outcome**: Test passes by verifying login form elements are visible, confirming the user was redirected to the login page.

---

## 10. Additional Considerations

### Why This Happened
- UI was designed with user-friendly copy ("Welcome Back" vs "Login")
- Test was written with generic expectations
- No validation that test expectations match actual UI

### Prevention
- Use Page Object Models consistently
- Verify test selectors match actual UI during test development
- Consider using visual regression testing or screenshot comparisons

### Related Issues
- Check if other tests have similar text-matching issues
- Verify admin login tests don't have the same problem
- Consider adding a helper method to LoginPage POM for "is visible" checks

