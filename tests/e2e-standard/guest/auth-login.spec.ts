import { test, expect } from '../fixtures.js';
import type { Page } from '@playwright/test';

const resolveLoginPage = (page: Page, loginPage: any, adminLoginPage: any) => {
  const url = page.url();
  if (url.includes('/admin')) {
    return adminLoginPage;
  }
  return loginPage;
};

test.describe('Guest authentication', () => {
  test('Successful login redirects to dashboard', async ({ loginPage, dashboardPage, page }) => {
    await loginPage.goto();
    await loginPage.fillEmail('guest1@stayflex.test');
    await loginPage.fillPassword('password123');
    await loginPage.submit();
    
    await expect(page).toHaveURL(/\/dashboard$/);
    
    const welcomeText = await dashboardPage.getWelcomeText();
    expect(welcomeText).toBeTruthy();
  });

  test('Invalid credentials show error and stay on login page', async ({ page, loginPage, adminLoginPage }) => {
    await loginPage.goto();
    
    const loginPageInstance = resolveLoginPage(page, loginPage, adminLoginPage);
    await loginPageInstance.fillEmail('guest1@stayflex.test');
    await loginPageInstance.fillPassword('wrongpassword');
    await loginPageInstance.submit();
    
    await expect(page).toHaveURL(/\/login$/);
    
    const errorText = await loginPageInstance.getErrorText();
    expect(errorText).toBeTruthy();
  });

  test('Accessing dashboard without authentication redirects to login', async ({ page, loginPage }) => {
    // Clear cookies and permissions to ensure not authenticated
    await page.context().clearCookies();
    await page.context().clearPermissions();
    
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/\/login$/);
    
    // Verify login form is visible
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });
});

