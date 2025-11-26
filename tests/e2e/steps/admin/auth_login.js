const { createBdd } = require('playwright-bdd');
const { expect } = require('@playwright/test');
const AdminLoginPage = require('../../pages/admin/AdminLoginPage');

const { Given, Then } = createBdd();

Given('I am on the admin login page', async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  await adminLoginPage.goto();
});

Then('I should see an {string} message', async ({ page }, message) => {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
});
