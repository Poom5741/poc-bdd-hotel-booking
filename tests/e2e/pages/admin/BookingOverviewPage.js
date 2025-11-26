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

  async waitForBookingList() {
    await this.bookingList.first().waitFor({ state: 'visible' });
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

  async getBookingsMeta() {
    return await this.bookingList.evaluateAll((nodes) =>
      nodes.map((node) => {
        const dataset = node.dataset || {};
        const statusText =
          node.querySelector('.status')?.textContent?.trim() ||
          dataset.status ||
          '';

        return {
          id: dataset.id || node.getAttribute('data-id') || '',
          checkIn:
            dataset.checkin ||
            dataset.checkIn ||
            node.getAttribute('data-checkin') ||
            node.getAttribute('data-check-in') ||
            '',
          checkOut:
            dataset.checkout ||
            dataset.checkOut ||
            node.getAttribute('data-checkout') ||
            node.getAttribute('data-check-out') ||
            '',
          status: statusText,
        };
      }),
    );
  }

  async findBookingIdByDate({ checkIn, checkOut }) {
    const bookings = await this.getBookingsMeta();
    const match = bookings.find(
      (booking) =>
        (checkIn && booking.checkIn?.startsWith(checkIn)) ||
        (checkOut && booking.checkOut?.startsWith(checkOut)),
    );
    return match?.id;
  }

  async getStatusByBookingId(id) {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }
}

module.exports = BookingOverviewPage;
