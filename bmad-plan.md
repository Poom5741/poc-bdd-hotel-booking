# BMAD Plan: Implement fixtures like resources folder and refactor all e2e from JS to TS

## Goal
Refactor all e2e tests from JavaScript to TypeScript, implementing fixtures following the pattern from the resources/playwright-bdd-example folder where fixtures.ts exports Given/When/Then using createBdd from playwright-bdd.

## Implementation Tasks

### Task 1: Add TypeScript configuration and dependencies
- Create `tests/e2e/tsconfig.json` based on the example in resources folder
- Update `tests/e2e/package.json` to add TypeScript dependencies (@types/node, typescript)
- Ensure TypeScript is configured for ES modules and strict mode
- **Files to touch:**
  - `tests/e2e/tsconfig.json` (new file)
  - `tests/e2e/package.json`

### Task 2: Convert fixtures.js to fixtures.ts following resources pattern
- Convert `tests/e2e/fixtures.js` to `tests/e2e/fixtures.ts`
- Import `createBdd` from 'playwright-bdd' (not just test)
- Export `Given, When, Then` from fixtures.ts using `createBdd(test)`
- Add TypeScript types for fixtures
- Convert page object imports to ES module syntax
- **Files to touch:**
  - `tests/e2e/fixtures.ts` (rename from .js)

### Task 3: Convert playwright.config.js to playwright.config.ts
- Convert `tests/e2e/playwright.config.js` to `tests/e2e/playwright.config.ts`
- Remove the `createRequire` workaround (no longer needed with TypeScript)
- Remove `test` parameter from `defineBddConfig` (fixtures handle it via createBdd)
- Update steps path to `steps/**/*.ts`
- **Files to touch:**
  - `tests/e2e/playwright.config.ts` (rename from .js)

### Task 4: Convert all step files from .js to .ts
- Convert all 7 step files in `tests/e2e/steps/` from .js to .ts
- Update imports to use ES module syntax
- Import `Given, When, Then` from `../../fixtures` instead of calling `createBdd()`
- Add TypeScript types for step parameters
- **Files to touch:**
  - `tests/e2e/steps/guest/room_search.ts`
  - `tests/e2e/steps/guest/booking_create.ts`
  - `tests/e2e/steps/guest/auth_login.ts`
  - `tests/e2e/steps/guest/my_bookings.ts`
  - `tests/e2e/steps/admin/auth_login.ts`
  - `tests/e2e/steps/admin/booking_overview.ts`
  - `tests/e2e/steps/admin/room_manage.ts`

### Task 5: Convert page objects from .js to .ts
- Convert all 9 page object files from .js to .ts
- Add TypeScript types (Page type from @playwright/test, return types for methods)
- Convert to ES module syntax (export default class)
- **Files to touch:**
  - `tests/e2e/pages/guest/RoomSearchPage.ts`
  - `tests/e2e/pages/guest/ConfirmationPage.ts`
  - `tests/e2e/pages/guest/LoginPage.ts`
  - `tests/e2e/pages/guest/DashboardPage.ts`
  - `tests/e2e/pages/guest/MyBookingsPage.ts`
  - `tests/e2e/pages/admin/AdminLoginPage.ts`
  - `tests/e2e/pages/admin/AdminDashboardPage.ts`
  - `tests/e2e/pages/admin/BookingOverviewPage.ts`
  - `tests/e2e/pages/admin/RoomManagementPage.ts`

### Task 6: Update fixtures.ts to import TypeScript page objects
- Update fixtures.ts to use ES module imports for page objects
- Ensure all imports use .ts extensions or no extensions (depending on tsconfig)
- Verify fixture types are properly defined
- **Files to touch:**
  - `tests/e2e/fixtures.ts`

---

**Ready to run /bmad-run for Task 1.**
