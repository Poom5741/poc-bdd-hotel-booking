import type { Page, Locator } from '@playwright/test';

interface BookingMeta {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

interface BookingDateFilter {
  checkIn?: string;
  checkOut?: string;
}

export default class BookingOverviewPage {
  readonly page: Page;
  readonly filterFromInput: Locator;
  readonly filterToInput: Locator;
  readonly applyFilterButton: Locator;
  readonly bookingList: Locator;
  readonly checkInButton: Locator;
  readonly checkOutButton: Locator;
  readonly articleList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterFromInput = page.locator('input[name="filterFrom"]');
    this.filterToInput = page.locator('input[name="filterTo"]');
    // HTML uses .submit-button with text "Apply Filter", not .apply-filter-button
    // Scope to the filter section to avoid matching other submit buttons
    this.applyFilterButton = page.locator('.filters button.submit-button').filter({ hasText: 'Apply Filter' });
    this.bookingList = page.locator('.booking-item');
    this.checkInButton = page.locator('.check-in-button');
    this.checkOutButton = page.locator('.check-out-button');
    this.articleList = page.locator('article');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/bookings');
  }

  async waitForBookingList(): Promise<void> {
    // Wait for either explicit .booking-item or generic article entries
    if (await this.bookingList.count() > 0) {
      await this.bookingList.first().waitFor({ state: 'visible' });
    } else {
      await this.articleList.first().waitFor({ state: 'visible' });
    }
  }

  async filterBookings(fromDate: string, toDate: string): Promise<void> {
    await this.filterFromInput.fill(fromDate);
    await this.filterToInput.fill(toDate);
    await this.applyFilterButton.click();
  }

  async markCheckedIn(bookingId: string): Promise<void> {
    const button = this.page.locator(`.booking-item[data-id="${bookingId}"] .check-in-button`);
    await button.click();
  }

  async markCheckedOut(bookingId: string): Promise<void> {
    const button = this.page.locator(`.booking-item[data-id="${bookingId}"] .check-out-button`);
    await button.click();
  }

  async getBookingList(): Promise<Locator[]> {
    return await this.bookingList.all();
  }

  async getBookingsMeta(): Promise<BookingMeta[]> {
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
        const normalize = (s: string | null | undefined): string => (s || '').replace(/\u2011/g, '-').replace(/\u00a0/g, ' ').trim();
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

  async findBookingIdByDate({ checkIn, checkOut }: BookingDateFilter): Promise<string | undefined> {
    const normalize = (s: string | null | undefined): string => (s || '').replace(/\u2011/g, '-').trim();
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

  async getStatusByBookingId(id: string): Promise<string | null> {
    const statusElement = this.page.locator(`.booking-item[data-id="${id}"] .status`);
    return await statusElement.textContent();
  }

  getStatusLocatorByBookingId(id: string): Locator {
    return this.page.locator(`.booking-item[data-id="${id}"] .status`);
  }
}

