# Playwright BDD Template

- **P**laywright-powered automation: Fast, reliable browser testing with built-in waiting and multi-browser support
- **B**usiness-readable scenarios: Gherkin syntax makes tests understandable by both technical and non-technical stakeholders
- **D**ependency injection: Fixtures provide page objects and shared context automatically to step definitions

## Introduction

This template provides a standardized structure for Playwright end-to-end testing using Behavior-Driven Development (BDD) with Gherkin syntax. It combines Playwright's powerful browser automation with `playwright-bdd` to enable writing executable test scenarios in business language.

The architecture separates concerns: feature files describe behavior in Gherkin, step definitions map scenarios to code, page objects encapsulate UI interactions, and fixtures handle dependency injection. This structure makes tests maintainable, reviewable by non-developers, and resilient to application changes.

## Objective

- **Standardized BDD structure:** Clear folder hierarchy (`features/`, `steps/`, `pages/`, `fixtures.ts`) that separates business scenarios from technical implementation, making it easy for team members to navigate and contribute.

- **Facilitate collaboration:** Feature files written in Gherkin serve as living documentation that product owners, QA engineers, and developers can read, review, and validate together.

- **Enhance maintainability:** Page Object Model pattern, reusable step definitions, and fixture-based dependency injection create maintainable test code that adapts to UI changes without breaking scenarios.

- **Support best practices:** TypeScript strict mode, comprehensive reporting (Cucumber HTML + Playwright HTML), automatic retries, and CI/CD integration patterns that catch issues early.

- **Be extensible:** Easy to add new feature domains, page objects, custom fixtures, and additional reporters without restructuring the entire project.

## High-Level Architecture

The template follows a four-layer pattern:

**Layer 1: Feature Files** (`.feature`)
- Gherkin syntax describing behavior in business language
- Organized by domain (e.g., `admin/`, `guest/`)
- Tags for test organization (`@smoke`, `@regression`)

**Layer 2: Step Definitions** (`.ts`)
- Map Gherkin steps to executable code
- Import `Given`, `When`, `Then` from `fixtures.ts`
- Delegate UI interactions to page objects
- Handle assertions and test logic

**Layer 3: Page Objects** (`.ts`)
- Encapsulate UI locators and interactions
- Methods perform actions (click, fill, navigate)
- No assertions—return data for step definitions to validate

**Layer 4: Fixtures** (`fixtures.ts`)
- Extend Playwright's base test with custom fixtures
- Instantiate page objects and inject into step definitions
- Export `Given`, `When`, `Then`, `Before` via `createBdd()` from `playwright-bdd`

## Core Workflow

1. **Write Feature** → Create `.feature` file in Gherkin syntax
2. **Generate Tests** → Run `bddgen` to convert features to Playwright tests
3. **Implement Steps** → Write step definitions that use page objects
4. **Create Page Objects** → Build page classes with locators and methods
5. **Run Tests** → Execute with `playwright test`
6. **View Reports** → Review Cucumber HTML and Playwright HTML reports

## Project Structure

```
tests/e2e/
├── features/              # Gherkin feature files by domain
│   ├── admin/
│   └── guest/
├── steps/                 # Step definitions (mirrors features/)
│   ├── admin/
│   └── guest/
├── pages/                 # Page Object Model classes
│   ├── admin/
│   └── guest/
├── fixtures.ts            # Custom fixtures and BDD exports
├── playwright.config.ts   # Playwright + BDD configuration
└── package.json           # Dependencies and scripts
```

## Key Configuration

**`playwright.config.ts`:**
- Uses `defineBddConfig()` to specify feature and step paths
- Configures Cucumber HTML and Playwright HTML reporters
- Sets base URL, timeouts, retries, and browser projects

**`fixtures.ts`:**
- Extends base test with page object fixtures
- Exports `Given`, `When`, `Then`, `Before` using `createBdd()`
- Provides dependency injection for step definitions

**`package.json` scripts:**
- `pretest`: Runs `bddgen` to generate Playwright tests from `.feature` files
- `test`: Executes the test suite
- `test:headed`: Runs tests with visible browser

## Essential Commands

```bash
npm run pretest    # Generate Playwright tests from .feature files (required before test)
npm test           # Run the full test suite
npm run test:headed # Run tests with visible browser for debugging
```

## Conventions

- **Feature files:** `snake_case.feature` (e.g., `auth_login.feature`)
- **Step definitions:** Match feature file names, `.ts` extension
- **Page objects:** `PascalCase` ending with `Page` (e.g., `LoginPage.ts`)
- **Gherkin steps:** Business-focused language, not technical selectors
- **Tags:** Use `@smoke`, `@regression`, domain tags for organization

## Reference

- **playwright-bdd Documentation:** https://vitalets.github.io/playwright-bdd/#/
- **Playwright Documentation:** https://playwright.dev/docs/intro
- **Gherkin Syntax:** https://cucumber.io/docs/gherkin/

