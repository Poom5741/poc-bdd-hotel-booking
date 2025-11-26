const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../pages/guest/LoginPage');

Given('I am on the login page', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.goto();
});

When('I submit valid credentials {string} and {string}', async function (email, password) {
  await this.loginPage.fillEmail(email);
  await this.loginPage.fillPassword(password);
  await this.loginPage.submit();
});

When('I submit invalid credentials {string} and {string}', async function (email, password) {
  await this.loginPage.fillEmail(email);
  await this.loginPage.fillPassword(password);
  await this.loginPage.submit();
});

Then('I should be redirected to {string}', async function (path) {
  await expect(this.page).toHaveURL(path);
});

Then('I should see a welcome message', async function () {
  // Assume dashboard page
  const welcomeText = await this.page.locator('.welcome-message').textContent();
  expect(welcomeText).toBeTruthy();
});

Then('I should remain on {string}', async function (path) {
  await expect(this.page).toHaveURL(path);
});

Then('I should see an authentication error message', async function () {
  const errorText = await this.loginPage.getErrorText();
  expect(errorText).toBeTruthy();
});

Given('I am not authenticated', async function () {
  // Clear any auth state if needed
});

When('I navigate to {string}', async function (path) {
  await this.page.goto(path);
});

Then('I should see a login prompt', async function () {
  // Check for login form or message
  await expect(this.page.locator('input[name="email"]')).toBeVisible();
});