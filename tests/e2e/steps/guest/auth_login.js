const { createBdd } = require('playwright-bdd');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/guest/LoginPage');
const AdminLoginPage = require('../../pages/admin/AdminLoginPage');

const { Given, When, Then } = createBdd();

const resolveLoginPage = (page) => {
  const url = page.url();
  if (url.includes('/admin')) {
    return new AdminLoginPage(page);
  }
  return new LoginPage(page);
};

Given('I am on the login page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
});

When('I submit valid credentials {string} and {string}', async ({ page }, email, password) => {
  const loginPage = resolveLoginPage(page);
  await loginPage.fillEmail(email);
  await loginPage.fillPassword(password);
  await loginPage.submit();
});

When('I submit invalid credentials {string} and {string}', async ({ page }, email, password) => {
  const loginPage = resolveLoginPage(page);
  await loginPage.fillEmail(email);
  await loginPage.fillPassword(password);
  await loginPage.submit();
});

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

Then('I should be redirected to {string}', async ({ page }, path) => {
  const escapedPath = escapeForRegex(path);
  await expect(page).toHaveURL(new RegExp(`${escapedPath}$`));
});

Then('I should remain on {string}', async ({ page }, path) => {
  const escapedPath = escapeForRegex(path);
  await expect(page).toHaveURL(new RegExp(`${escapedPath}$`));
});

Then('I should see a welcome message', async ({ page }) => {
  const welcomeText = await page.locator('.welcome-message').textContent();
  expect(welcomeText).toBeTruthy();
});

Then('I should see an admin welcome message', async ({ page }) => {
  const welcomeText = await page.locator('.admin-welcome-message').textContent();
  expect(welcomeText).toBeTruthy();
});

Then('I should see an authentication error message', async ({ page }) => {
  const loginPage = resolveLoginPage(page);
  const errorText = await loginPage.getErrorText();
  expect(errorText).toBeTruthy();
});

Given('I am not authenticated', async ({ page }) => {
  await page.context().clearCookies();
  await page.context().clearPermissions();
});

When('I navigate to {string}', async ({ page }, path) => {
  await page.goto(path);
});

Then('I should see a login prompt', async ({ page }) => {
  const loginHeader = page.getByText(/login/i);
  await expect(loginHeader).toBeVisible();
});
