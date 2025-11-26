const { expect } = require('@playwright/test');

class AdminDashboardPage {
  constructor(page) {
    this.page = page;
    this.welcomeText = page.locator('.admin-welcome-message');
  }

  async goto() {
    await this.page.goto('/admin/dashboard');
  }

  async getWelcomeText() {
    return await this.welcomeText.textContent();
  }
}

module.exports = AdminDashboardPage;