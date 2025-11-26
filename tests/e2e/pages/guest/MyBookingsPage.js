const { expect } = require('@playwright/test');

class MyBookingsPage {
  constructor(page) {
    this.page = page;
    this.bookingList = page.locator('.booking-item');
  }

  async goto() {
    await this.page.goto('/my-bookings');
  }

  async getBookingList() {
    return await this.bookingList.all();
  }

  async cancelBookingById(id) {
    const cancelButton = this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
    await cancelButton.click();
  }

  async getStatusByBookingId(id) {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }
}

module.exports = MyBookingsPage;