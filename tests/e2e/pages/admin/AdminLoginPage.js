const { expect } = require('@playwright/test');

class AdminLoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorText = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/admin/login');
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async getErrorText() {
    return await this.errorText.textContent();
  }
}

module.exports = AdminLoginPage;