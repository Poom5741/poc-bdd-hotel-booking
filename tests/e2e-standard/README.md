# Standard Playwright E2E Tests

This directory contains standard Playwright end-to-end tests migrated from the BDD structure. All tests use the Page Object Model pattern and are organized by feature domain.

## Structure

```
tests/e2e-standard/
├── admin/                    # Admin user tests
│   ├── auth-login.spec.ts
│   ├── booking-overview.spec.ts
│   └── room-manage.spec.ts
├── guest/                    # Guest user tests
│   ├── auth-login.spec.ts
│   ├── booking-create.spec.ts
│   ├── my-bookings.spec.ts
│   └── room-search.spec.ts
├── pages/                    # Page Object Model classes
│   ├── admin/
│   │   ├── AdminDashboardPage.ts
│   │   ├── AdminLoginPage.ts
│   │   ├── BookingOverviewPage.ts
│   │   └── RoomManagementPage.ts
│   └── guest/
│       ├── ConfirmationPage.ts
│       ├── DashboardPage.ts
│       ├── LoginPage.ts
│       ├── MyBookingsPage.ts
│       └── RoomSearchPage.ts
├── fixtures.ts               # Custom fixtures with page objects
├── playwright.config.ts      # Playwright configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript configuration
```

## Installation

1. Install dependencies:
```bash
cd tests/e2e-standard
npm install
```

2. Install Playwright browsers:
```bash
npm run install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in headed mode (visible browser):
```bash
npm run test:headed
```

Run specific test file:
```bash
npx playwright test guest/auth-login.spec.ts
```

Run tests matching a pattern:
```bash
npx playwright test --grep "auth"
```

## Key Features

- **Standard Playwright**: Uses native Playwright test syntax (no BDD)
- **Page Object Model**: All UI interactions encapsulated in page objects
- **Fixtures**: Custom fixtures provide page objects via dependency injection
- **TypeScript**: Full type safety with strict mode
- **Organized by Domain**: Tests grouped by admin/guest for easy navigation

## Migration Notes

This test suite was migrated from a BDD structure (`tests/e2e/`) to standard Playwright tests. The migration:

- ✅ Preserved all test scenarios and coverage
- ✅ Reused all page objects without modification
- ✅ Converted Gherkin scenarios to standard Playwright `test()` functions
- ✅ Removed BDD dependencies (playwright-bdd, @cucumber/cucumber)
- ✅ Maintained same domain organization (admin/, guest/)

## Test Organization

Tests are organized by user type and feature:

- **admin/**: Admin portal tests (authentication, booking management, room management)
- **guest/**: Guest portal tests (authentication, room search, booking creation, my bookings)

Each test file follows the pattern: `{feature}.spec.ts`

## Page Objects

Page objects are located in `pages/` and mirror the test structure:
- One page object per page/component
- Methods perform actions (no assertions)
- Locators are defined as readonly properties

## Configuration

- **Base URL**: Configured via `BASE_URL` environment variable (defaults to `http://localhost:3000`)
- **Browser**: Chromium by default
- **Retries**: 2 retries in CI, 0 locally
- **Artifacts**: Screenshots, videos, and traces on failure only

## Environment Variables

- `BASE_URL`: Target application URL (default: `http://localhost:3000`)
- `CI`: Automatically set in CI environments

## Best Practices

1. **Test Isolation**: Each test is independent and can run in parallel
2. **Page Objects**: All UI interactions go through page objects
3. **Assertions**: All assertions in test files (not in page objects)
4. **Stable Locators**: Use data-testid or semantic selectors
5. **No Hard Waits**: Use Playwright's built-in waiting mechanisms

## Differences from BDD Structure

- **No Feature Files**: Tests written directly in TypeScript
- **No Step Definitions**: Logic directly in test functions
- **Standard Syntax**: Uses `test()` and `test.describe()` instead of Given/When/Then
- **Simpler Setup**: No need to run `bddgen` before tests
- **Standard Reports**: Only Playwright HTML reports (no Cucumber reports)

