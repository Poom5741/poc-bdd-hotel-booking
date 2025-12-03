import type { Page, Locator } from '@playwright/test';
import { step } from '../../utilities/step-decorator';

export default class LoginPage {
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
    // Scope to main content to avoid matching Next.js route announcer (which is outside main)
    // Error messages in login.js have role="alert", so we use that for specificity
    this.errorText = page.locator('main section .error-message[role="alert"]').first();
  }

  @step("Navigate to login page")
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  @step("Fill email: {email}")
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  @step("Fill password")
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  @step("Submit login form")
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  @step("Get error text from login page")
  async getErrorText(): Promise<string | null> {
    // Wait for error message to be visible before getting text
    try {
      await this.errorText.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorText.textContent();
    } catch {
      // If error message doesn't appear, return null
      return null;
    }
  }
}

