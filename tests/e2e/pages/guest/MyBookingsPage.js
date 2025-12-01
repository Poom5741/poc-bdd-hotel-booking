class MyBookingsPage {
  constructor(page) {
    this.page = page;
    this.bookingList = page.locator('.booking-item');
    this.confirmationMessage = page.locator('.confirmation-message');
  }

  async goto() {
    await this.page.goto('/my-bookings');
  }

  async getBookingList() {
    return await this.bookingList.all();
  }

  async waitForBookingList() {
    await this.bookingList.first().waitFor({ state: 'visible' });
  }

  async getBookingsMeta() {
    return await this.bookingList.evaluateAll((nodes) =>
      nodes.map((node) => {
        const dataset = node.dataset || {};
        const status =
          dataset.status ||
          (node.classList.contains('past') ? 'past' : '') ||
          (node.classList.contains('future') ? 'future' : '') ||
          '';

        return {
          id: dataset.id || node.getAttribute('data-id') || '',
          status,
          checkIn:
            dataset.checkin ||
            dataset.checkIn ||
            node.getAttribute('data-checkin') ||
            node.getAttribute('data-check-in') ||
            '',
        };
      }),
    );
  }

  async findBookingIdByDate(checkIn) {
    const bookings = await this.getBookingsMeta();
    const match = bookings.find((booking) => booking.checkIn?.startsWith(checkIn));
    return match?.id;
  }

  async cancelBookingById(id) {
    const cancelButton = this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
    await cancelButton.click();
  }

  async getStatusByBookingId(id) {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }

  getBookingLocatorById(id) {
    return this.page.locator(`.booking-item[data-id="${id}"]`);
  }

  async getConfirmationMessage() {
    return await this.confirmationMessage.textContent();
  }

  getCancelButtonByBookingId(id) {
    return this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
  }

  getLabelByBookingId(id, labelText) {
    return this.page.locator(`.booking-item[data-id="${id}"]`).getByText(labelText, { exact: false });
  }
}

module.exports = MyBookingsPage;
