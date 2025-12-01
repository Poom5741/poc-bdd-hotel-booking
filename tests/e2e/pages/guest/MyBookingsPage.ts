import type { Page, Locator } from '@playwright/test';

interface BookingMeta {
  id: string;
  status: string;
  checkIn: string;
}

export default class MyBookingsPage {
  readonly page: Page;
  readonly bookingList: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bookingList = page.locator('.booking-item');
    this.confirmationMessage = page.locator('.confirmation-message');
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-bookings');
  }

  async getBookingList(): Promise<Locator[]> {
    return await this.bookingList.all();
  }

  async waitForBookingList(): Promise<void> {
    await this.bookingList.first().waitFor({ state: 'visible' });
  }

  async getBookingsMeta(): Promise<BookingMeta[]> {
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

  async findBookingIdByDate(checkIn: string): Promise<string | undefined> {
    const bookings = await this.getBookingsMeta();
    const match = bookings.find((booking) => booking.checkIn?.startsWith(checkIn));
    return match?.id;
  }

  async cancelBookingById(id: string): Promise<void> {
    const cancelButton = this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
    await cancelButton.click();
  }

  async getStatusByBookingId(id: string): Promise<string | null> {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }

  getBookingLocatorById(id: string): Locator {
    return this.page.locator(`.booking-item[data-id="${id}"]`);
  }

  async getConfirmationMessage(): Promise<string | null> {
    return await this.confirmationMessage.textContent();
  }

  getCancelButtonByBookingId(id: string): Locator {
    return this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
  }

  getLabelByBookingId(id: string, labelText: string): Locator {
    return this.page.locator(`.booking-item[data-id="${id}"]`).getByText(labelText, { exact: false });
  }
}

