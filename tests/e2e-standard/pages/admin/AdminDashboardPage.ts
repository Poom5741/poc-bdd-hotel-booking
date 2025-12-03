import type { Page, Locator } from '@playwright/test';
import { step } from '../../utilities/step-decorator';

export default class AdminDashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.locator('.admin-welcome-message');
  }

  @step("Navigate to admin dashboard page")
  async goto(): Promise<void> {
    await this.page.goto('/admin/dashboard');
  }

  @step("Get welcome text from admin dashboard")
  async getWelcomeText(): Promise<string | null> {
    return await this.welcomeText.textContent();
  }
}

