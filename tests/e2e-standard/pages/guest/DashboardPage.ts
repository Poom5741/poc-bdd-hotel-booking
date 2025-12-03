import type { Page, Locator } from '@playwright/test';

export default class DashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.locator('.welcome-message');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async getWelcomeText(): Promise<string | null> {
    return await this.welcomeText.textContent();
  }
}

