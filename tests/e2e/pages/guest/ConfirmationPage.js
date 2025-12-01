const { expect } = require('@playwright/test');

class ConfirmationPage {
  constructor(page) {
    this.page = page;
    this.confirmationMessage = page.locator('.confirmation-message');
    this.totalPrice = page.locator('.total-price');
    this.summary = page.locator('.summary');
  }

  async goto() {
    await this.page.goto('/confirmation');
  }

  async getConfirmationMessage() {
    return await this.confirmationMessage.textContent();
  }

  async getTotalPrice() {
    return await this.totalPrice.textContent();
  }

  async hasPriceDisplayed() {
    const count = await this.totalPrice.count();
    if (count === 0) {
      return false;
    }
    const text = await this.totalPrice.textContent();
    return text !== null && text.trim().length > 0;
  }

  async getBookingSummary() {
    const summaryText = await this.summary.textContent();
    return summaryText;
  }

  async getDates() {
    const datesText = await this.summary.locator('p').filter({ hasText: 'Dates:' }).textContent();
    return datesText;
  }

  async getGuests() {
    const guestsText = await this.summary.locator('p').filter({ hasText: 'Guests:' }).textContent();
    return guestsText;
  }
}

module.exports = ConfirmationPage;

