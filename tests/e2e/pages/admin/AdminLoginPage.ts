import type { Page, Locator } from '@playwright/test';

export default class AdminLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorText = page.locator('.error-message');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string | null> {
    return await this.errorText.textContent();
  }

  getMessageByText(text: string): Locator {
    return this.page.getByText(text, { exact: false });
  }
}

