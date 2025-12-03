import type { Page, Locator } from '@playwright/test';
import { step } from '../../utilities/step-decorator';

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

  @step("Navigate to my bookings page")
  async goto(): Promise<void> {
    await this.page.goto('/my-bookings');
  }

  @step("Get booking list")
  async getBookingList(): Promise<Locator[]> {
    return await this.bookingList.all();
  }

  @step("Wait for booking list to appear")
  async waitForBookingList(): Promise<void> {
    await this.bookingList.first().waitFor({ state: 'visible' });
  }

  @step("Get bookings metadata")
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

  @step("Find booking ID by check-in date: {checkIn}")
  async findBookingIdByDate(checkIn: string): Promise<string | undefined> {
    const bookings = await this.getBookingsMeta();
    const match = bookings.find((booking) => booking.checkIn?.startsWith(checkIn));
    return match?.id;
  }

  @step("Cancel booking by ID: {id}")
  async cancelBookingById(id: string): Promise<void> {
    const cancelButton = this.page.locator(`.booking-item[data-id="${id}"] .cancel-button`);
    await cancelButton.click();
  }

  @step("Get status by booking ID: {id}")
  async getStatusByBookingId(id: string): Promise<string | null> {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }

  getBookingLocatorById(id: string): Locator {
    return this.page.locator(`.booking-item[data-id="${id}"]`);
  }

  @step("Get confirmation message from my bookings")
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

