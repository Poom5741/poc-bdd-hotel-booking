# Migration Exploration: BDD to Standard Playwright E2E

## Current Architecture Analysis

### 1. **Key Components & Structure**

#### Current BDD Structure:
```
tests/e2e/
├── features/          # Gherkin .feature files (business scenarios)
│   ├── admin/
│   │   ├── auth_login.feature
│   │   ├── booking_overview.feature
│   │   └── room_manage.feature
│   └── guest/
│       ├── auth_login.feature
│       ├── booking_create.feature
│       ├── my_bookings.feature
│       └── room_search.feature
├── steps/             # Step definitions (Given/When/Then)
│   ├── admin/         # Mirrors features/ structure
│   └── guest/
├── pages/             # Page Object Model classes
│   ├── admin/         # Well-structured, reusable
│   └── guest/
├── fixtures.ts        # BDD fixtures with createBdd()
├── playwright.config.ts  # Uses defineBddConfig()
└── package.json       # Includes playwright-bdd dependencies
```

### 2. **Data Flow & Architecture**

**BDD Flow:**
1. Feature files (`.feature`) define scenarios in Gherkin syntax
2. `bddgen` generates Playwright test files from features
3. Step definitions (`.ts`) map Gherkin steps to executable code
4. Step definitions call page object methods
5. Page objects encapsulate UI interactions
6. Fixtures provide dependency injection for page objects

**Key Dependencies:**
- `playwright-bdd`: Converts Gherkin to Playwright tests
- `@cucumber/cucumber`: Gherkin parsing (peer dependency)
- Custom fixtures with `createBdd()` export `Given`, `When`, `Then`, `Before`

**Page Objects:**
- Well-structured, reusable classes
- Encapsulate locators and actions
- No assertions (good practice)
- Organized by domain (admin/, guest/)

### 3. **Core Invariants & Patterns**

**Reusable Components:**
- ✅ **Page Objects**: Fully reusable, well-designed
- ✅ **Fixture System**: Page object instantiation can be preserved
- ✅ **Test Organization**: Domain-based structure (admin/, guest/) is maintainable

**BDD-Specific Components:**
- ❌ **Feature Files**: Gherkin syntax, need conversion
- ❌ **Step Definitions**: BDD-specific, need conversion
- ❌ **BDD Fixtures**: `createBdd()` exports, need replacement
- ❌ **BDD Config**: `defineBddConfig()`, need standard config

**Test Scenarios Identified:**
- **Guest**: Authentication (login), Room search, Booking creation, My bookings
- **Admin**: Authentication (login), Booking overview, Room management

### 4. **Migration Requirements**

#### What Must Change:

1. **Test Files**:
   - Convert 7 feature files → 7 `.spec.ts` test files
   - Transform Gherkin scenarios → Playwright `test()` functions
   - Merge step definitions into test code
   - Maintain test coverage and assertions

2. **Configuration**:
   - Remove `defineBddConfig()` from playwright.config.ts
   - Use standard `testDir` pointing to test files
   - Remove Cucumber reporter, keep Playwright HTML reporter
   - Update baseURL and other settings as needed

3. **Fixtures**:
   - Remove `createBdd()` and BDD exports
   - Keep page object fixtures using standard Playwright `test.extend()`
   - Maintain same fixture structure for page objects

4. **Dependencies**:
   - Remove `playwright-bdd` from package.json
   - Remove `@cucumber/cucumber` from package.json
   - Remove `bddgen` script
   - Keep `@playwright/test`, TypeScript, other dependencies

5. **File Structure**:
   - Create new folder: `tests/e2e-standard/` (or similar)
   - Migrate page objects (reusable as-is)
   - Create test files in organized structure
   - Keep same domain organization (admin/, guest/)

#### What Can Be Preserved:

1. **Page Objects**: 100% reusable, no changes needed
2. **Domain Organization**: Keep admin/ and guest/ separation
3. **Test Scenarios**: All test cases should be preserved
4. **TypeScript Configuration**: Keep tsconfig.json as-is
5. **Base Configuration**: BaseURL, timeouts, reporters (with modifications)

### 5. **Best Practices for Standard Playwright E2E**

Based on Playwright documentation and best practices:

**Structure:**
- Tests organized by feature/domain in folders
- Test files named `*.spec.ts` or `*.test.ts`
- Page Object Model pattern (already implemented)
- Fixtures for reusable setup and page objects

**Test Organization:**
```
tests/e2e-standard/
├── admin/
│   ├── auth-login.spec.ts
│   ├── booking-overview.spec.ts
│   └── room-manage.spec.ts
├── guest/
│   ├── auth-login.spec.ts
│   ├── booking-create.spec.ts
│   ├── my-bookings.spec.ts
│   └── room-search.spec.ts
├── pages/              # Reuse existing page objects
│   ├── admin/
│   └── guest/
├── fixtures.ts         # Standard Playwright fixtures
├── playwright.config.ts # Standard Playwright config
└── package.json
```

**Key Patterns:**
- Use `test()` from `@playwright/test`
- Use `test.describe()` for grouping
- Use `test.beforeEach()` for setup (authentication, etc.)
- Keep assertions in test files (not page objects)
- Use fixtures for dependency injection
- Maintain test isolation

### 6. **Migration Strategy**

**Step 1**: Create new folder structure
- Create `tests/e2e-standard/` directory
- Copy page objects (reusable)
- Create fixtures.ts (standard Playwright)

**Step 2**: Convert configuration
- Create playwright.config.ts (standard, no BDD)
- Create package.json (remove BDD dependencies)
- Copy tsconfig.json (reusable)

**Step 3**: Convert tests
- For each feature file:
  - Read scenario(s)
  - Identify step definitions
  - Create `.spec.ts` file
  - Convert Gherkin → Playwright test code
  - Merge step logic into test

**Step 4**: Verify and test
- Ensure all test scenarios are covered
- Verify page objects work correctly
- Test execution in new structure

### 7. **Files to Migrate**

**Feature Files (7 total):**
1. `features/admin/auth_login.feature` → `admin/auth-login.spec.ts`
2. `features/admin/booking_overview.feature` → `admin/booking-overview.spec.ts`
3. `features/admin/room_manage.feature` → `admin/room-manage.spec.ts`
4. `features/guest/auth_login.feature` → `guest/auth-login.spec.ts`
5. `features/guest/booking_create.feature` → `guest/booking-create.spec.ts`
6. `features/guest/my_bookings.feature` → `guest/my-bookings.spec.ts`
7. `features/guest/room_search.feature` → `guest/room-search.spec.ts`

**Page Objects (9 total - copy as-is):**
- All files in `pages/admin/` (4 files)
- All files in `pages/guest/` (5 files)

**Supporting Files:**
- `fixtures.ts` → Convert to standard Playwright fixtures
- `playwright.config.ts` → Standard Playwright config
- `package.json` → Remove BDD dependencies
- `tsconfig.json` → Copy as-is

### 8. **Conversion Examples**

**BDD Scenario:**
```gherkin
Scenario: Successful login redirects to dashboard
  Given I am on the login page
  When I submit valid credentials "guest1@stayflex.test" and "password123"
  Then I should be redirected to "/dashboard"
  And I should see a welcome message
```

**Standard Playwright Test:**
```typescript
test('Successful login redirects to dashboard', async ({ loginPage, dashboardPage, page }) => {
  await loginPage.goto();
  await loginPage.fillEmail('guest1@stayflex.test');
  await loginPage.fillPassword('password123');
  await loginPage.submit();
  await expect(page).toHaveURL(/\/dashboard$/);
  const welcomeText = await dashboardPage.getWelcomeText();
  expect(welcomeText).toBeTruthy();
});
```

### 9. **Challenges & Considerations**

1. **Test Data**: Ensure test data (credentials, dates) are preserved
2. **API Calls**: Some step definitions use API calls for setup - need to preserve
3. **Conditional Logic**: Some steps have complex logic (e.g., `resolveLoginPage`) - need to handle
4. **Shared Steps**: Some step definitions are reused - extract to helper functions
5. **Tags**: BDD tags (`@smoke`, `@regression`) - can use test.describe or annotations

### 10. **Success Criteria**

✅ All 7 feature files converted to standard Playwright tests
✅ All test scenarios preserved with same coverage
✅ Page objects reused without modification
✅ Standard Playwright configuration working
✅ No BDD dependencies in new structure
✅ Tests executable with `playwright test`
✅ Organized, maintainable structure following best practices

---

## Summary

**Current State**: BDD structure with Gherkin features, step definitions, and playwright-bdd integration.

**Target State**: Standard Playwright E2E tests with Page Object Model, organized by domain, using standard fixtures and configuration.

**Migration Complexity**: Medium - requires converting 7 feature files and their step definitions, but page objects are fully reusable.

**Key Advantage**: Page objects are well-designed and can be migrated without changes, significantly reducing migration effort.

