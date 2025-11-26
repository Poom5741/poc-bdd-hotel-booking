const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;
    this.welcomeText = page.locator('.welcome-message');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getWelcomeText() {
    return await this.welcomeText.textContent();
  }
}

module.exports = DashboardPage;