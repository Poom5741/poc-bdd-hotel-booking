import { test, expect } from '../fixtures.js';
import type { Page } from '@playwright/test';

const resolveLoginPage = (page: Page, loginPage: any, adminLoginPage: any) => {
  const url = page.url();
  if (url.includes('/admin')) {
    return adminLoginPage;
  }
  return loginPage;
};

test.describe('Admin authentication', () => {
  test('Admin login success redirects to admin dashboard', async ({ adminLoginPage, adminDashboardPage, page }) => {
    await adminLoginPage.goto();
    await adminLoginPage.fillEmail('admin@stayflex.test');
    await adminLoginPage.fillPassword('admin1231');
    await adminLoginPage.submit();
    
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    
    const welcomeText = await adminDashboardPage.getWelcomeText();
    expect(welcomeText).toBeTruthy();
  });

  test('Invalid admin credentials show error', async ({ page, adminLoginPage }) => {
    await adminLoginPage.goto();
    await adminLoginPage.fillEmail('admin@stayflex.test');
    await adminLoginPage.fillPassword('wrongpass');
    await adminLoginPage.submit();
    
    await expect(page).toHaveURL(/\/admin\/login$/);
    
    const errorText = await adminLoginPage.getErrorText();
    expect(errorText).toBeTruthy();
  });

  test('Non-admin accessing admin route while logged in as guest is denied', async ({ loginPage, page, adminLoginPage }) => {
    // Log in as guest user first
    await loginPage.goto();
    await loginPage.fillEmail('guest1@stayflex.test');
    await loginPage.fillPassword('password123');
    await loginPage.submit();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard');
    
    // Should see access denied message and be redirected
    const loginPageInstance = resolveLoginPage(page, loginPage, adminLoginPage);
    const messageLocator = adminLoginPage.getMessageByText('Access denied');
    await expect(messageLocator).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

