class BookingOverviewPage {
  constructor(page) {
    this.page = page;
    this.filterFromInput = page.locator('input[name="filterFrom"]');
    this.filterToInput = page.locator('input[name="filterTo"]');
    this.applyFilterButton = page.locator('.apply-filter-button');
    this.bookingList = page.locator('.booking-item');
    this.checkInButton = page.locator('.check-in-button');
    this.checkOutButton = page.locator('.check-out-button');
    this.articleList = page.locator('article');
  }

  async goto() {
    await this.page.goto('/admin/bookings');
  }

  async waitForBookingList() {
    // Wait for either explicit .booking-item or generic article entries
    if (await this.bookingList.count() > 0) {
      await this.bookingList.first().waitFor({ state: 'visible' });
    } else {
      await this.articleList.first().waitFor({ state: 'visible' });
    }
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
    // Prefer .booking-item with data attributes; fallback to parsing article paragraphs
    if (await this.bookingList.count() > 0) {
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

    // Fallback: parse articles with paragraphs like "YYYY-MM-DD → YYYY-MM-DD"
    return await this.articleList.evaluateAll((nodes) =>
      nodes.map((node) => {
        const normalize = (s) => (s || '').replace(/\u2011/g, '-').replace(/\u00a0/g, ' ').trim();
        const text1 = normalize(node.querySelector('p')?.textContent || '');
        let checkIn = '';
        let checkOut = '';
        if (text1.includes('→')) {
          const parts = text1.split('→').map((x) => normalize(x));
          checkIn = parts[0];
          checkOut = parts[1] || '';
        } else if (text1.includes('->')) {
          const parts = text1.split('->').map((x) => normalize(x));
          checkIn = parts[0];
          checkOut = parts[1] || '';
        }
        const statusText = normalize(node.querySelectorAll('p')[1]?.textContent || '');
        const idAttr = node.querySelector('.booking-item')?.getAttribute('data-id') || '';
        return { id: idAttr, checkIn, checkOut, status: statusText };
      }),
    );
  }

  async findBookingIdByDate({ checkIn, checkOut }) {
    const normalize = (s) => (s || '').replace(/\u2011/g, '-').trim();
    const targetIn = normalize(checkIn);
    const targetOut = normalize(checkOut);
    const bookings = await this.getBookingsMeta();
    const match = bookings.find((booking) => {
      const bIn = normalize(booking.checkIn);
      const bOut = normalize(booking.checkOut);
      return (targetIn && bIn === targetIn) || (targetOut && bOut === targetOut);
    });
    return match?.id;
  }

  async getStatusByBookingId(id) {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }
}

module.exports = BookingOverviewPage;
