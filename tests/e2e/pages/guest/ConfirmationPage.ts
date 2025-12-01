import type { Page, Locator } from '@playwright/test';

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

  async goto(): Promise<void> {
    await this.page.goto('/confirmation');
  }

  async getConfirmationMessage(): Promise<string | null> {
    return await this.confirmationMessage.textContent();
  }

  async getTotalPrice(): Promise<string | null> {
    return await this.totalPrice.textContent();
  }

  async hasPriceDisplayed(): Promise<boolean> {
    const count = await this.totalPrice.count();
    if (count === 0) {
      return false;
    }
    const text = await this.totalPrice.textContent();
    return text !== null && text.trim().length > 0;
  }

  async getBookingSummary(): Promise<string | null> {
    const summaryText = await this.summary.textContent();
    return summaryText;
  }

  async getDates(): Promise<string | null> {
    const datesText = await this.summary.locator('p').filter({ hasText: 'Dates:' }).textContent();
    return datesText;
  }

  async getGuests(): Promise<string | null> {
    const guestsText = await this.summary.locator('p').filter({ hasText: 'Guests:' }).textContent();
    return guestsText;
  }
}

