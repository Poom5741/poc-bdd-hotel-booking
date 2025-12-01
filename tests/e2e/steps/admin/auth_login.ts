import { expect } from '@playwright/test';
import { Given, Then } from '../../fixtures';

Given('I am on the admin login page', async ({ adminLoginPage }) => {
  await adminLoginPage.goto();
});

Then('I should see an {string} message', async ({ adminLoginPage }, message: string) => {
  const messageLocator = adminLoginPage.getMessageByText(message);
  await expect(messageLocator).toBeVisible();
});

