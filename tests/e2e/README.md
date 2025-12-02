# Playwright bdd
## Introduction

This is a template and guideline for structuring Playwright end-to-end test projects using Behavior-Driven Development (BDD) with Gherkin syntax. It provides a standardized approach to organizing features, step definitions, page objects, and fixtures that scales with your application.

The architecture emphasizes separation of concerns: business-readable feature files describe what to test, step definitions map scenarios to code, page objects encapsulate UI interactions, and fixtures provide dependency injection. This structure makes tests maintainable, reviewable by non-developers, and resilient to application changes.

Whether you're starting a new test suite or refactoring an existing one, this template offers conventions and patterns that have proven effective in production environments. Follow it as a starting point, then adapt it to your team's specific needs.

## Objective

- **Standardized Playwright BDD structure:** Provides a clear folder hierarchy (`features/`, `steps/`, `pages/`, `fixtures.ts`) that separates business scenarios from technical implementation, making it easy for new team members to navigate and contribute.

- **Facilitate test quality:** Includes TypeScript strict mode, ESLint-ready configuration, comprehensive reporting (Cucumber HTML + Playwright HTML), automatic retries, and CI/CD integration patterns that catch issues early.

- **Enhance reliability:** Uses Playwright's fixture system for automatic resource cleanup, stable locator strategies (data-testid, role-based), proper waiting mechanisms, and test isolation to prevent flaky tests.

- **Support best practices:** Enforces Page Object Model (POM) pattern, reusable step definitions, scenario tagging (`@smoke`, `@regression`), parallel execution configuration, and environment-based test data management.

- **Be extensible:** Easy to add new feature domains (e.g., `features/billing/`), new page objects, custom fixtures for authentication or API setup, and additional reporters without restructuring the entire project.

- **Enable collaboration:** Feature files written in Gherkin serve as living documentation that product owners, QA engineers, and developers can all read, review, and validate together.

**NOTE:** This template includes example features, steps, and page objects for demonstration. Delete or replace them with your own test scenarios. The structure and conventions are what matter—the specific test content should reflect your application's behavior.

## Table of Contents

- [Pre-requisite: before getting started or git clone this repository](#pre-requisite-before-getting-started-or-git-clone-this-repository)
- [How to copy this template](#how-to-copy-this-template)
- [Project structural components](#project-structural-components)
- [Guideline How To Code](#guideline-how-to-code)
- [Available Commands in Makefile](#available-commands-in-makefile)
- [Conventions](#conventions)
- [When to use hard failures](#when-to-use-hard-failures)
- [Gracefully shutting down](#gracefully-shutting-down)
- [Libraies suggestion](#libraies-suggestion)
- [Bad Practices](#bad-practices)
- [Contribution-Guide](#contribution-guide)
- [Reference](#reference)
- [Cross Functional Requirements](#cross-functional-requirements)
- [Technical Requirement Guidelines](#technical-requirement-guidelines)

## Pre-requisite: before getting started or git clone this repository

<details>
<summary>see contents</summary>

Before cloning or using this template, ensure you have the following tools installed:

**Required:**

- **Node.js 18+**: JavaScript runtime for running Playwright and TypeScript compilation. Check with `node --version`.
- **npm, yarn, or pnpm**: Package manager for installing dependencies. npm comes with Node.js.
- **Playwright CLI**: Installed via `npx playwright install` after `npm install`. Downloads browser binaries (Chromium, Firefox, WebKit) needed for test execution.
- **playwright-bdd**: Included as a dev dependency. Converts Gherkin `.feature` files into Playwright test code via `bddgen` command.

**Recommended:**

- **TypeScript**: Included as dev dependency. Enables type safety for page objects, step definitions, and fixtures.
- **ESLint & Prettier**: For code quality and formatting (add to your project if not included).
- **Git**: Version control for managing test code and collaborating with your team.

**Installation commands:**

```bash
# Verify Node.js version
node --version  # Should be 18 or higher

# Install dependencies (this installs playwright-bdd, @playwright/test, TypeScript)
npm install

# Install Playwright browsers (required for test execution)
npx playwright install

# Verify playwright-bdd is available
npx bddgen --version
```

**Why each tool:**

- **Playwright**: Provides fast, reliable browser automation with built-in waiting, network interception, and multi-browser support.
- **playwright-bdd**: Bridges Gherkin syntax with Playwright's test runner, allowing you to write business-readable scenarios that generate executable Playwright tests.
- **TypeScript**: Catches type errors at compile time, provides autocomplete in IDEs, and makes refactoring safer.

</details>

## How to copy this template

<details>
<summary>see contents</summary>

Follow these steps to set up your own Playwright BDD test project from this template:

1. **Clone or use template**: Clone this repository or use the "Use this template" button on GitHub/GitLab to create a new repository based on this template.

2. **Install dependencies**: Run `npm install` (or `yarn install` / `pnpm install`) in the project root. This installs `@playwright/test`, `playwright-bdd`, TypeScript, and other dev dependencies listed in `package.json`.

3. **Install Playwright browsers**: Execute `npx playwright install` to download Chromium, Firefox, and WebKit browser binaries. This is required before running any tests.

4. **Update project metadata**: Edit `package.json` to change the `name` field to your project name (e.g., `"name": "my-app-e2e-tests"`). Update any repository URLs or descriptions as needed.

5. **Configure environment variables**: Create a `.env` file (or `.env.test`) if your tests require environment-specific configuration. Common variables include `BASE_URL` (target application URL), API endpoints, test user credentials, etc. See `playwright.config.ts` for how `BASE_URL` is used.

6. **Generate initial test files**: Run `npm run pretest` (which executes `bddgen`) to generate Playwright test files from your `.feature` files. This step is required before running tests—Playwright BDD converts Gherkin into executable test code.

7. **Verify setup**: Run `npm test` to execute the test suite. If everything is configured correctly, you should see test results in the terminal and generated reports in `playwright-report/` and `cucumber-report/`.

8. **Remove example tests**: Delete the example feature files in `features/admin/` and `features/guest/` (or replace them with your own scenarios). Remove corresponding step definitions in `steps/` and page objects in `pages/` that you don't need.

9. **Update fixtures**: Modify `fixtures.ts` to include only the page objects relevant to your application. Remove unused page object imports and fixture definitions.

10. **Configure Git remote**: If you cloned to a new repository, add your remote origin: `git remote add origin <your-repo-url>`, then push: `git push -u origin main`.

11. **Set up CI/CD** (optional): If you have a `.github/workflows/` directory with CI configuration, update it with your repository settings, environment variables, and test execution commands.

</details>

## Project structural components

```
./
├── package.json                 # Project metadata, scripts, dependencies
├── playwright.config.ts         # Playwright + BDD configuration
├── tsconfig.json                # TypeScript compiler options
├── fixtures.ts                  # Custom fixtures and BDD exports (Given/When/Then)
├── features/                    # Gherkin feature files organized by domain
│   ├── admin/                   # Admin user scenarios
│   │   ├── auth_login.feature
│   │   ├── booking_overview.feature
│   │   └── room_manage.feature
│   └── guest/                   # Guest user scenarios
│       ├── auth_login.feature
│       ├── booking_create.feature
│       ├── my_bookings.feature
│       └── room_search.feature
├── steps/                       # Step definition files (one per feature domain)
│   ├── admin/
│   │   ├── auth_login.ts
│   │   ├── booking_overview.ts
│   │   └── room_manage.ts
│   └── guest/
│       ├── auth_login.ts
│       ├── booking_create.ts
│       ├── my_bookings.ts
│       └── room_search.ts
├── pages/                       # Page Object Model classes
│   ├── admin/
│   │   ├── AdminLoginPage.ts
│   │   ├── AdminDashboardPage.ts
│   │   ├── BookingOverviewPage.ts
│   │   └── RoomManagementPage.ts
│   └── guest/
│       ├── LoginPage.ts
│       ├── DashboardPage.ts
│       ├── RoomSearchPage.ts
│       ├── ConfirmationPage.ts
│       └── MyBookingsPage.ts
├── playwright-report/           # Playwright HTML test reports (generated)
├── cucumber-report/             # Cucumber HTML BDD reports (generated)
├── test-results/                # Screenshots, videos, traces (on failure)
└── .github/workflows/           # CI/CD pipeline definitions (optional)
```

**Path explanations:**

- `features/`: Gherkin `.feature` files describing behavior in business language. Organized by domain (e.g., `admin/`, `guest/`, `billing/`) to group related scenarios. Each file contains one or more scenarios with Given/When/Then steps.

- `steps/`: Step definition files (`.ts`) that bind Gherkin steps to Playwright code. Mirror the `features/` structure—each feature domain has a corresponding step file. Import `Given`, `When`, `Then` from `fixtures.ts` and delegate UI interactions to page objects.

- `pages/`: Page Object Model (POM) classes that encapsulate UI locators and interactions. One class per page or major UI component. Methods perform actions (e.g., `login()`, `searchRooms()`); assertions stay in step definitions, not page objects.

- `fixtures.ts`: Central fixture file that extends Playwright's base test with custom fixtures (page objects, API clients, test data). Exports `Given`, `When`, `Then`, `Before` via `createBdd()` from `playwright-bdd`. All step definitions import these exports.

- `playwright.config.ts`: Playwright configuration merged with BDD settings. Uses `defineBddConfig()` to specify feature and step paths. Configures reporters, base URL, timeouts, retries, and browser projects.

- `cucumber-report/` and `playwright-report/`: Generated HTML reports after test execution. Cucumber report shows BDD scenarios; Playwright report shows detailed test execution with screenshots and traces.

- `test-results/`: Artifacts generated on test failures: screenshots, videos, and Playwright traces. Used for debugging flaky or failing tests.

## Guideline How To Code

### `features/`

**What belongs here:**

- Gherkin `.feature` files written in business language.
- Feature descriptions, scenarios, and step definitions using Given/When/Then syntax.
- Tags (`@smoke`, `@regression`, `@wip`) for organizing and filtering test execution.

**What must NOT be placed here:**

- No TypeScript or JavaScript code.
- No implementation details or technical selectors.
- No assertions or test logic—only behavior descriptions.

**File naming examples:**

- GOOD: `auth_login.feature`, `booking_create.feature`, `room_search.feature`
- BAD: `test1.feature`, `login_spec.feature`, `auth-login.feature` (use underscores, not hyphens)

**Structure example:**

```gherkin
# language: en
@guest @auth
Feature: Guest authentication

  As a guest user
  I want to log in
  So that I can access my account

  @guest @auth @positive
  Scenario: Successful login redirects to dashboard
    Given I am on the login page
    When I submit valid credentials "user@example.com" and "password123"
    Then I should be redirected to "/dashboard"
```

### `steps/`

**What belongs here:**

- Step definition functions that map Gherkin steps to code.
- Thin orchestration layer that calls page object methods and performs assertions.
- Reusable step definitions that can be shared across multiple scenarios.

**What must NOT be placed here:**

- No direct DOM manipulation or raw Playwright locators (use page objects).
- No complex business logic or API calls (extract to helpers or fixtures if needed).
- No hardcoded test data (use parameters from Gherkin or environment variables).

**File naming examples:**

- GOOD: `auth_login.ts`, `booking_create.ts`, `room_search.ts` (matches feature file names)
- BAD: `steps.ts`, `login.test.ts`, `authLogin.ts` (use snake_case to match features)

**Code structure:**

```typescript
import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I submit valid credentials {string} and {string}',
  async ({ loginPage }, email: string, password: string) => {
    await loginPage.login(email, password);
  }
);

Then('I should be redirected to {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(path));
});
```

### `pages/`

**What belongs here:**

- Page Object Model classes that encapsulate UI elements and interactions.
- Locator definitions as `readonly` properties.
- Methods that perform user actions (click, fill, navigate) but no assertions.

**What must NOT be placed here:**

- No assertions or `expect()` calls (assertions belong in step definitions).
- No test scenario logic or step definitions.
- No direct use of `page` outside of the class constructor (use `this.page`).

**File naming examples:**

- GOOD: `LoginPage.ts`, `RoomSearchPage.ts`, `AdminDashboardPage.ts` (PascalCase, ends with `Page`)
- BAD: `login.ts`, `roomSearch.ts`, `admin-dashboard.ts`

**Code structure:**

```typescript
import type { Page, Locator } from '@playwright/test';

export default class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### `fixtures.ts`

**What belongs here:**

- Custom fixture definitions that extend Playwright's base test.
- Page object instantiation and injection into step definitions.
- Shared setup/teardown logic (authentication, test data preparation) via `Before` hooks.
- Export of `Given`, `When`, `Then`, `Before` using `createBdd()`.

**What must NOT be placed here:**

- No step definitions (those belong in `steps/`).
- No page object implementations (those belong in `pages/`).
- No feature files or Gherkin syntax.

**Structure:**

```typescript
import { test as base, createBdd } from 'playwright-bdd';
import LoginPage from './pages/LoginPage.js';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export const { Given, When, Then, Before } = createBdd(test);
```

### `playwright.config.ts`

**What belongs here:**

- Playwright configuration merged with BDD settings.
- `defineBddConfig()` to specify feature and step file paths.
- Reporter configuration (Cucumber HTML, Playwright HTML).
- Base URL, timeouts, retries, browser projects, and test execution settings.

**What must NOT be placed here:**

- No step definitions or page objects.
- No feature file content.

**Key configuration:**

```typescript
import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['fixtures.ts', 'steps/**/*.ts'],
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', { outputFile: 'cucumber-report/index.html' }),
    ['html'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
```

### `tsconfig.json`

**What belongs here:**

- TypeScript compiler options for the test project.
- Strict mode enabled for type safety.
- Module resolution settings (e.g., `nodenext` for ES modules).

**Configuration:**

```json
{
  "compilerOptions": {
    "target": "es2021",
    "module": "nodenext",
    "strict": true,
    "noEmit": true
  },
  "include": ["**/*.ts"]
}
```

## Available Commands in Makefile

If your project includes a `Makefile` at the root level, common commands might include:

```makefile
e2e:                    # Run full E2E test suite
compose-e2e:            # Run E2E tests in Docker Compose environment
compose-up:             # Start application stack for testing
```

**Ground rule:** If a command is used frequently (e.g., `npm run pretest && npm test`), consider adding it to the Makefile or `package.json` scripts for consistency and ease of use.

**Common npm scripts (from `package.json`):**

- `npm run pretest`: Runs `bddgen` to generate Playwright tests from `.feature` files (required before `npm test`).
- `npm test`: Executes the full test suite using Playwright.
- `npm run test:headed`: Runs tests in headed mode (browser visible) for debugging.
- `npm run bddgen`: Manually trigger BDD code generation.
- `npm run install`: Installs Playwright browser binaries.

## Conventions

### Naming Convention

- **Variables and functions**: Use `camelCase` (e.g., `loginPage`, `submitForm()`).
- **Classes**: Use `PascalCase` (e.g., `LoginPage`, `RoomSearchPage`).
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `BASE_URL`, `MAX_RETRIES`).
- **Type/Interface names**: Use `PascalCase` (e.g., `Fixtures`, `TestData`).

### File Naming Convention

**Feature files:**
- GOOD: `auth_login.feature`, `booking_create.feature`, `room_search.feature`
- BAD: `Login.feature`, `test1.feature`, `auth-login.feature`, `login_spec.feature`

**Step definition files:**
- GOOD: `auth_login.ts`, `booking_create.ts` (matches feature file name, `.ts` extension)
- BAD: `login.steps.ts`, `authLogin.ts`, `steps.ts`

**Page object files:**
- GOOD: `LoginPage.ts`, `RoomSearchPage.ts`, `AdminDashboardPage.ts` (PascalCase, ends with `Page`)
- BAD: `login.ts`, `roomSearch.ts`, `login-page.ts`

**Fixture file:**
- GOOD: `fixtures.ts` (singular, lowercase)
- BAD: `fixture.ts`, `Fixtures.ts`, `test-fixtures.ts`

### Folder and Module Naming Convention

- **Feature domains**: Use lowercase, descriptive names (e.g., `admin/`, `guest/`, `billing/`, `checkout/`).
- **Avoid generic names**: Don't use `utils/`, `helpers/`, `common/` unless scoped (e.g., `auth-utils/`, `dom-helpers/`).
- **Mirror structure**: Keep `steps/` and `pages/` folder structure aligned with `features/` domains for easy navigation.

### Step and Scenario Naming Convention

**Gherkin steps should be business-focused, not technical:**

- GOOD: `Given I am on the login page`, `When I submit valid credentials "user@example.com" and "password123"`, `Then I should see a welcome message`
- BAD: `Given I navigate to /login`, `When I click the submit button`, `Then I should see div#welcome-message`

**Scenario titles should describe the outcome:**

- GOOD: `Successful login redirects to dashboard`, `Invalid credentials show error message`
- BAD: `Test login`, `Login test case 1`, `Verify login functionality`

**Tags for organization:**

- `@smoke`: Critical path tests that run on every commit.
- `@regression`: Full test suite for release validation.
- `@wip`: Work in progress—excluded from CI runs.
- `@positive` / `@negative`: Happy path vs. error scenarios.
- Domain tags: `@admin`, `@guest`, `@billing` for filtering by user type or feature area.

## When to use hard failures

Use **hard failures** (standard `expect()` assertions that throw on failure) for critical test validations that indicate a broken feature or regression:

- **User-facing outcomes**: Login success, payment completion, data persistence.
- **Navigation and routing**: URL changes, page transitions, redirects.
- **Core business logic**: Calculations, validations, state changes that affect user experience.

Use **soft checks or logging** (non-throwing validations) for non-blocking observations:

- **UI polish**: Optional animations, non-critical styling, secondary information displays.
- **Performance metrics**: Page load times, API response times (log but don't fail unless threshold is critical).
- **Debugging information**: Element visibility states, intermediate values (log for troubleshooting).

**Avoid throwing errors** inside low-level helpers (page objects, utility functions) unless the error represents a truly unrecoverable state (e.g., missing environment configuration, browser not available). Let step definitions handle assertions and failures—page objects should return data or perform actions, not assert outcomes.

**Example:**

```typescript
// GOOD: Hard failure in step definition
Then('I should be redirected to the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/); // Throws if URL doesn't match
});

// BAD: Hard failure in page object
async verifyRedirect() {
  if (!this.page.url().includes('/dashboard')) {
    throw new Error('Not redirected'); // Don't throw in page objects
  }
}

// GOOD: Page object returns data, step definition asserts
async getCurrentUrl(): Promise<string> {
  return this.page.url();
}
```

## Gracefully shutting down

Playwright's test runner handles browser and worker lifecycle automatically through fixtures. You don't need to manually call `browser.close()` or manage resource cleanup in most cases.

**How it works:**

- **Fixtures provide isolation**: Each test gets a fresh `page` fixture that's automatically created and torn down.
- **Automatic cleanup**: When a test completes (success or failure), Playwright closes the browser context and cleans up resources.
- **Before/After hooks**: Use `Before` and `After` (exported from `fixtures.ts`) for setup and teardown that applies to multiple scenarios:

```typescript
import { Before, After } from '../fixtures';

Before(async ({ page }) => {
  // Setup: authenticate, seed test data, etc.
  await authenticateAsAdmin(page);
});

After(async ({ page }) => {
  // Teardown: cleanup test data, logout, etc.
  await cleanupTestData(page);
});
```

**Best practices:**

- **Don't manually close browsers**: Avoid `await browser.close()` inside tests—let Playwright manage it.
- **Use fixtures for shared state**: If you need shared authentication or test data across scenarios, create custom fixtures in `fixtures.ts` rather than global variables.
- **Clean up test data**: If tests create data (bookings, users, etc.), clean it up in `After` hooks or via API calls to prevent test pollution.
- **Handle async teardown**: If cleanup is async (API calls, database operations), ensure `After` hooks await completion.

**Resource management in CI:**

- Playwright automatically limits concurrent workers based on available CPU cores.
- Screenshots, videos, and traces are generated only on failure (configured in `playwright.config.ts`).
- Reports are written to `playwright-report/` and `cucumber-report/` after the test run completes.

## Libraies suggestion

### Recommended Libraries

- **@playwright/test**: Core testing framework providing browser automation, assertions, and test runner. Essential for all E2E tests.

- **playwright-bdd**: Bridges Gherkin syntax with Playwright, enabling BDD workflows. Converts `.feature` files to Playwright tests via `bddgen`.

- **TypeScript**: Provides type safety, IDE autocomplete, and compile-time error checking. Reduces bugs and improves maintainability.

- **ESLint & Prettier**: Code quality and formatting tools. Enforces consistent style and catches common mistakes.

- **dotenv**: Loads environment variables from `.env` files. Useful for managing test environments (dev, staging, prod) and sensitive credentials.

- **@cucumber/cucumber**: Included as a peer dependency of `playwright-bdd`. Provides Gherkin parsing and step matching.

**Why these choices:**

- **Playwright**: Fast, reliable, with excellent debugging tools (trace viewer, screenshots, videos).
- **playwright-bdd**: Seamless integration with Playwright's test runner, no separate Cucumber process needed.
- **TypeScript**: Catches errors early, improves refactoring safety, and provides better IDE support.

### Unrecommended Libraries but still can use with caution

- **Heavy test data ORMs** (e.g., Sequelize, TypeORM in test projects): Adds unnecessary complexity and slow test execution. Prefer direct API calls or simple data setup helpers.

- **Complex custom wrappers around Playwright**: Wrappers that hide Playwright's API make debugging harder and reduce flexibility. Use page objects and fixtures instead.

- **Test data factories with heavy dependencies**: Libraries like FactoryBot can be overkill for E2E tests. Simple helper functions or API calls are often sufficient.

- **Separate Cucumber.js runner**: Don't use `@cucumber/cucumber` directly alongside `playwright-bdd`—it creates duplicate test execution and confusion. `playwright-bdd` handles Cucumber integration internally.

**Why discouraged:**

- **Complexity**: Heavy abstractions make tests harder to debug and understand.
- **Performance**: Unnecessary dependencies slow down test execution and CI pipelines.
- **Maintenance**: Over-engineering test infrastructure increases long-term maintenance burden.

## Bad Practices

- **Assertions in page objects**: Page objects should perform actions and return data, not assert outcomes. Assertions belong in step definitions.

- **Overusing `waitForTimeout()`**: Use Playwright's built-in waiting (e.g., `waitFor()`, `toHaveText()`) instead of fixed timeouts. Fixed waits are flaky and slow.

- **Duplicating selectors**: Don't repeat locators across step definitions. Centralize them in page objects as `readonly` properties.

- **Ultra-technical step text**: Gherkin steps should describe user behavior, not DOM manipulation. Avoid steps like "And I click div#submit > span:nth-child(2)".

- **Massive `utils.ts` file**: Don't create a single utility file with mixed responsibilities. Split helpers by domain (e.g., `auth-helpers.ts`, `api-helpers.ts`) or use fixtures.

- **Hardcoded test data**: Avoid hardcoding emails, passwords, or URLs in step definitions. Use Gherkin parameters, environment variables, or test data fixtures.

- **Global state mutations**: Don't use global variables to share state between tests. Use Playwright fixtures or `Before` hooks for shared setup.

- **Ignoring test isolation**: Each test should be independent. Don't rely on execution order or shared browser state between scenarios.

- **Skipping `bddgen`**: Always run `npm run pretest` (which runs `bddgen`) before executing tests. Without it, Playwright can't find the generated test files.

- **Mixing concerns**: Don't put API calls, database queries, or complex business logic directly in step definitions. Extract to helpers, fixtures, or separate service classes.

## Contribution-Guide

1. **Fork the repository**: Create your own fork of the template repository.

2. **Clone your fork**: `git clone <your-fork-url>`

3. **Create a branch**: `git checkout -b feature/add-new-scenario` or `git checkout -b fix/flaky-test`

4. **Make changes**: Implement your feature, fix, or improvement. Follow the conventions outlined in this README.

5. **Add or update tests**: If adding new scenarios, create corresponding feature files, step definitions, and page objects. Ensure existing tests still pass.

6. **Run tests and lint**: Execute `npm run pretest && npm test` to verify all tests pass. Run ESLint if configured: `npm run lint`.

7. **Commit changes**: Write clear commit messages (e.g., "Add login scenario for admin users", "Fix room search step definition").

8. **Push to your fork**: `git push origin feature/add-new-scenario`

9. **Open a pull request**: Create a PR on the original repository. Explain what changes you made and why.

10. **Address review feedback**: Respond to comments, make requested changes, and update your PR.

11. **Merge**: Once approved, a maintainer will merge your PR.

## Reference

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **playwright-bdd Documentation**: https://vitalets.github.io/playwright-bdd/
- **Gherkin Syntax Reference**: https://cucumber.io/docs/gherkin/
- **BDD Best Practices**: https://cucumber.io/docs/bdd/
- **Page Object Model Pattern**: https://playwright.dev/docs/pom
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Cross Functional Requirements

- **Timeouts and retry policy**: Configure timeouts in `playwright.config.ts` based on application response times. Use `retries` for flaky test mitigation (e.g., `retries: 2`). Set appropriate `timeout` values for actions (default: 30 seconds) and navigation.

- **Logging strategy**: Playwright captures screenshots and videos on failure automatically (configured in `playwright.config.ts`). Use `trace: 'retain-on-failure'` for detailed debugging. Add custom logging in step definitions for business-critical actions.

- **Test data management**: Ensure test data setup is idempotent (can be run multiple times safely). Use `Before` hooks for data preparation and `After` hooks for cleanup. Prefer API calls over UI interactions for test data setup to reduce execution time.

- **Parallelization and isolation**: Configure `workers` in `playwright.config.ts` to run tests in parallel (default: based on CPU cores). Ensure tests are isolated—no shared state between scenarios. Use fixtures for authentication and data setup to maintain isolation.

- **Environment configuration**: Support multiple environments (dev, staging, prod) via `BASE_URL` environment variable. Use `.env` files for local development and CI environment variables for automated runs.

- **Tag-based test selection**: Use tags (`@smoke`, `@regression`) to run subsets of tests. Execute smoke tests on every commit, full regression suite on releases. Filter with `--grep` flag: `npx playwright test --grep "@smoke"`.

## Technical Requirement Guidelines

- **Standardized test report structure**: Generate both Cucumber HTML reports (BDD scenarios) and Playwright HTML reports (detailed execution). Reports should be accessible in CI/CD pipelines and locally after test runs.

- **Tracing and artifacts on failure**: Configure `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, and `trace: 'retain-on-failure'` in `playwright.config.ts`. Artifacts help debug failures without re-running tests.

- **Stable, test-friendly selectors**: Prefer `data-testid` attributes, role-based locators (`getByRole()`), or semantic HTML selectors. Avoid brittle CSS selectors that break with styling changes (e.g., `.class-name > div:nth-child(3)`).

- **Code quality checks**: Enable TypeScript strict mode in `tsconfig.json`. Integrate ESLint for linting and Prettier for formatting. Run quality checks in CI pipelines before test execution.

- **Tag-based test selection**: Organize scenarios with tags (`@smoke`, `@regression`, `@wip`, domain tags). Enable selective test execution for faster feedback loops and CI optimization.

- **Multiple environment configuration**: Support different environments via `BASE_URL` and other environment variables. Use `.env.example` to document required variables. Configure environment-specific settings in `playwright.config.ts` or via CI/CD variables.

- **CI/CD integration**: Provide example GitHub Actions workflows (`.github/workflows/`) that install dependencies, generate BDD tests (`bddgen`), run tests, and publish reports. Ensure CI runs are reproducible and fast.

- **Type safety**: Use TypeScript with strict mode. Type page object methods, step definition parameters, and fixtures. Leverage Playwright's built-in types for `Page`, `Locator`, and test fixtures.

