import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';
import LoginPage from '../../pages/guest/LoginPage.js';
import AdminLoginPage from '../../pages/admin/AdminLoginPage.js';

const resolveLoginPage = (page: Page, loginPage: LoginPage, adminLoginPage: AdminLoginPage): LoginPage | AdminLoginPage => {
  const url = page.url();
  if (url.includes('/admin')) {
    return adminLoginPage;
  }
  return loginPage;
};

Given('I am on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('I submit valid credentials {string} and {string}', async ({ page, loginPage, adminLoginPage }, email: string, password: string) => {
  const loginPageInstance = resolveLoginPage(page, loginPage, adminLoginPage);
  await loginPageInstance.fillEmail(email);
  await loginPageInstance.fillPassword(password);
  await loginPageInstance.submit();
});

When('I submit invalid credentials {string} and {string}', async ({ page, loginPage, adminLoginPage }, email: string, password: string) => {
  const loginPageInstance = resolveLoginPage(page, loginPage, adminLoginPage);
  await loginPageInstance.fillEmail(email);
  await loginPageInstance.fillPassword(password);
  await loginPageInstance.submit();
});

const escapeForRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

Then('I should be redirected to {string}', async ({ page }, path: string) => {
  const escapedPath = escapeForRegex(path);
  await expect(page).toHaveURL(new RegExp(`${escapedPath}$`));
});

Then('I should remain on {string}', async ({ page }, path: string) => {
  const escapedPath = escapeForRegex(path);
  await expect(page).toHaveURL(new RegExp(`${escapedPath}$`));
});

Then('I should see a welcome message', async ({ dashboardPage }) => {
  const welcomeText = await dashboardPage.getWelcomeText();
  expect(welcomeText).toBeTruthy();
});

Then('I should see an admin welcome message', async ({ adminDashboardPage }) => {
  const welcomeText = await adminDashboardPage.getWelcomeText();
  expect(welcomeText).toBeTruthy();
});

Then('I should see an authentication error message', async ({ page, loginPage, adminLoginPage }) => {
  const loginPageInstance = resolveLoginPage(page, loginPage, adminLoginPage);
  const errorText = await loginPageInstance.getErrorText();
  expect(errorText).toBeTruthy();
});

Given('I am not authenticated', async ({ page }) => {
  await page.context().clearCookies();
  await page.context().clearPermissions();
});

When('I navigate to {string}', async ({ page }, path: string) => {
  await page.goto(path);
});

Then('I should see a login prompt', async ({ loginPage }) => {
  // Verify login form is visible by checking for email input and submit button
  // This is more reliable than searching for text that may not exist in the UI
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
});

