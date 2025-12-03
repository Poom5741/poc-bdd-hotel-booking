import type { Page, Locator } from '@playwright/test';
import { step } from '../../utilities/step-decorator';

export default class DashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.locator('.welcome-message');
  }

  @step("Navigate to dashboard page")
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  @step("Get welcome text from dashboard")
  async getWelcomeText(): Promise<string | null> {
    return await this.welcomeText.textContent();
  }
}

