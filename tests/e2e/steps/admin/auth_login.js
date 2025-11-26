const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const AdminLoginPage = require('../../pages/admin/AdminLoginPage');

Given('I am on the admin login page', async function () {
  this.adminLoginPage = new AdminLoginPage(this.page);
  await this.adminLoginPage.goto();
});

When('I submit valid credentials {string} and {string}', async function (email, password) {
  await this.adminLoginPage.fillEmail(email);
  await this.adminLoginPage.fillPassword(password);
  await this.adminLoginPage.submit();
});

When('I submit invalid credentials {string} and {string}', async function (email, password) {
  await this.adminLoginPage.fillEmail(email);
  await this.adminLoginPage.fillPassword(password);
  await this.adminLoginPage.submit();
});

Then('I should be redirected to {string}', async function (path) {
  await expect(this.page).toHaveURL(path);
});

Then('I should see an admin welcome message', async function () {
  // Assume dashboard
  const welcomeText = await this.page.locator('.admin-welcome-message').textContent();
  expect(welcomeText).toBeTruthy();
});

Then('I should remain on {string}', async function (path) {
  await expect(this.page).toHaveURL(path);
});

Then('I should see an authentication error message', async function () {
  const errorText = await this.adminLoginPage.getErrorText();
  expect(errorText).toBeTruthy();
});

Given('I am logged in as a guest user', async function () {
  // Mock guest login
});

When('I navigate to {string}', async function (path) {
  await this.page.goto(path);
});

Then('I should see an {string} message', async function (message) {
  const msg = await this.page.locator('.message').textContent();
  expect(msg).toContain(message);
});