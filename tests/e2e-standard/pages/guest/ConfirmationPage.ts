import type { Page, Locator } from '@playwright/test';
import { step } from '../../utilities/step-decorator';

export default class ConfirmationPage {
  readonly page: Page;
  readonly confirmationMessage: Locator;
  readonly totalPrice: Locator;
  readonly summary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationMessage = page.locator('.confirmation-message');
    this.totalPrice = page.locator('.total-price');
    this.summary = page.locator('.summary');
  }

  @step("Navigate to confirmation page")
  async goto(): Promise<void> {
    await this.page.goto('/confirmation');
  }

  @step("Get confirmation message")
  async getConfirmationMessage(): Promise<string | null> {
    return await this.confirmationMessage.textContent();
  }

  @step("Get total price from confirmation")
  async getTotalPrice(): Promise<string | null> {
    return await this.totalPrice.textContent();
  }

  @step("Check if price is displayed")
  async hasPriceDisplayed(): Promise<boolean> {
    try {
      // Wait for element to be visible (ensures React has rendered the summary section)
      await this.totalPrice.waitFor({ state: 'visible', timeout: 5000 });
      
      // Wait for price to be calculated (contains $ and digits)
      // This ensures useEffect has completed and the price has been calculated
      await this.page.waitForFunction(
        (selector) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          const text = el.textContent || '';
          // Check if text contains price pattern: $ followed by one or more digits
          return /\$\d+/.test(text);
        },
        '.total-price',
        { timeout: 5000 }
      );
      
      // Double-check by getting text content to verify price is actually displayed
      const text = await this.totalPrice.textContent();
      return text !== null && /\$\d+/.test(text);
    } catch {
      // If element doesn't exist or price pattern doesn't appear, return false
      return false;
    }
  }

  @step("Get booking summary")
  async getBookingSummary(): Promise<string | null> {
    const summaryText = await this.summary.textContent();
    return summaryText;
  }

  @step("Get dates from booking summary")
  async getDates(): Promise<string | null> {
    const datesText = await this.summary.locator('p').filter({ hasText: 'Dates:' }).textContent();
    return datesText;
  }

  @step("Get guests from booking summary")
  async getGuests(): Promise<string | null> {
    const guestsText = await this.summary.locator('p').filter({ hasText: 'Guests:' }).textContent();
    return guestsText;
  }
}

