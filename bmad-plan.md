# BMAD Plan: Update e2e-standard to use test decorators like resource repo

## Goal
Update the e2e-standard test folder to use the `@step` test decorator pattern from the playwright-ts-automation-framework resource repo, which wraps page object methods with `test.step()` for improved test reporting and traceability.

## Implementation Tasks

### Task 1: Copy step-decorator utility to e2e-standard
- Create `tests/e2e-standard/utilities/` directory
- Copy `step-decorator.ts` from `resources/playwright-ts-automation-framework/utilities/step-decorator.ts` to `tests/e2e-standard/utilities/step-decorator.ts`
- Verify the decorator imports and exports are correct
- **Files to touch:**
  - `tests/e2e-standard/utilities/step-decorator.ts` (new file)

### Task 2: Add @step decorator to guest page objects
- Update all guest page object classes to import and use the `@step` decorator on their async methods
- Add descriptive step names with placeholders for parameters (e.g., `@step("Navigate to login page")`, `@step("Fill email: {email}")`)
- Apply decorator to methods in: LoginPage, DashboardPage, RoomSearchPage, ConfirmationPage, MyBookingsPage
- **Files to touch:**
  - `tests/e2e-standard/pages/guest/LoginPage.ts`
  - `tests/e2e-standard/pages/guest/DashboardPage.ts`
  - `tests/e2e-standard/pages/guest/RoomSearchPage.ts`
  - `tests/e2e-standard/pages/guest/ConfirmationPage.ts`
  - `tests/e2e-standard/pages/guest/MyBookingsPage.ts`

### Task 3: Add @step decorator to admin page objects
- Update all admin page object classes to import and use the `@step` decorator on their async methods
- Add descriptive step names with placeholders for parameters
- Apply decorator to methods in: AdminLoginPage, AdminDashboardPage, BookingOverviewPage, RoomManagementPage
- **Files to touch:**
  - `tests/e2e-standard/pages/admin/AdminLoginPage.ts`
  - `tests/e2e-standard/pages/admin/AdminDashboardPage.ts`
  - `tests/e2e-standard/pages/admin/BookingOverviewPage.ts`
  - `tests/e2e-standard/pages/admin/RoomManagementPage.ts`

### Task 4: Verify test execution and reporting
- Run a sample test to verify the decorator works correctly
- Check that test steps appear in Playwright test reports with proper names
- Ensure no TypeScript compilation errors
- Verify that all existing tests still pass with the new decorators
- **Files to touch:**
  - (No code changes, verification only)

---

**Ready to run /bmad-run for Task 1.**
