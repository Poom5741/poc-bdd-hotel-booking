const { expect } = require('@playwright/test');

class BookingOverviewPage {
  constructor(page) {
    this.page = page;
    this.filterFromInput = page.locator('input[name="filterFrom"]');
    this.filterToInput = page.locator('input[name="filterTo"]');
    this.applyFilterButton = page.locator('.apply-filter-button');
    this.bookingList = page.locator('.booking-item');
    this.checkInButton = page.locator('.check-in-button');
    this.checkOutButton = page.locator('.check-out-button');
  }

  async goto() {
    await this.page.goto('/admin/bookings');
  }

  async filterBookings(fromDate, toDate) {
    await this.filterFromInput.fill(fromDate);
    await this.filterToInput.fill(toDate);
    await this.applyFilterButton.click();
  }

  async markCheckedIn(bookingId) {
    const button = this.page.locator(`.booking-item[data-id="${bookingId}"] .check-in-button`);
    await button.click();
  }

  async markCheckedOut(bookingId) {
    const button = this.page.locator(`.booking-item[data-id="${bookingId}"] .check-out-button`);
    await button.click();
  }

  async getBookingList() {
    return await this.bookingList.all();
  }

  async getStatusByBookingId(id) {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }
}

module.exports = BookingOverviewPage;