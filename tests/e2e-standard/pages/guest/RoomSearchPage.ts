import type { Page, Locator } from '@playwright/test';

export default class RoomSearchPage {
  readonly page: Page;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly guestsInput: Locator;
  readonly submitButton: Locator;
  readonly roomCards: Locator;
  readonly noRoomsMessage: Locator;
  readonly bookingPanel: Locator;
  readonly bookingGuestsInput: Locator;
  readonly confirmBookingButton: Locator;
  readonly errorMessage: Locator;
  readonly validationError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkInInput = page.locator('input[name="checkIn"]');
    this.checkOutInput = page.locator('input[name="checkOut"]');
    this.guestsInput = page.locator('input[name="guests"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.roomCards = page.locator('.room-card');
    this.noRoomsMessage = page.locator('.no-rooms-message');
    this.bookingPanel = page.locator('.booking-panel');
    this.bookingGuestsInput = page.locator('input[name="bookingGuests"]');
    // HTML uses .submit-button (not .confirm-booking-button), scoped to .booking-panel
    this.confirmBookingButton = page.locator('.booking-panel button.submit-button').filter({ hasText: 'Confirm Booking' });
    // Scope to main content to avoid matching Next.js route announcer (which is outside main)
    // We'll handle both booking panel and form errors in getErrorMessage() method
    // This locator is a fallback - the getErrorMessage method will check both locations
    this.errorMessage = page.locator('main .error-message').first();
    this.validationError = page.locator('.validation-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/search');
  }

  async setCheckIn(date: string): Promise<void> {
    await this.checkInInput.fill(date);
  }

  async setCheckOut(date: string): Promise<void> {
    await this.checkOutInput.fill(date);
  }

  async setGuests(count: number): Promise<void> {
    await this.guestsInput.fill(count.toString());
  }

  async submitSearch(): Promise<void> {
    await this.submitButton.click();
  }

  async getRoomCards(): Promise<Locator[]> {
    return await this.roomCards.all();
  }

  async clickFirstRoomCard(): Promise<void> {
    const roomCards = await this.getRoomCards();
    if (roomCards.length === 0) {
      throw new Error('No room cards found');
    }
    await roomCards[0].click();
    await this.waitForBookingPanel();
  }

  async getNoRoomsMessage(): Promise<string | null> {
    return await this.noRoomsMessage.textContent();
  }

  async waitForBookingPanel(): Promise<void> {
    await this.bookingPanel.waitFor({ state: 'visible' });
  }

  async fillBookingGuests(count: string): Promise<void> {
    await this.bookingGuestsInput.fill(count);
  }

  async clickConfirmBooking(): Promise<void> {
    await this.confirmBookingButton.click();
  }

  getRoomCardByPrice(price: string): Locator {
    const priceValue = price.replace('$', '');
    // Try to find by data-price attribute first (more reliable)
    let roomCard = this.page.locator(`.room-card[data-price="${priceValue}"]`).first();
    // Fallback to text search if data attribute doesn't match
    return roomCard;
  }

  getRoomCardByName(name: string): Locator {
    return this.page.locator('.room-card').filter({ hasText: name }).first();
  }

  async getRoomCardCountByName(name: string): Promise<number> {
    return await this.page.locator('.room-card').filter({ hasText: name }).count();
  }

  async getErrorMessage(): Promise<string | null> {
    // Wait for error message to be visible before getting text
    // Check all possible error locations: booking panel, form, results (for injected errors), and fallback
    const selectors = [
      'main .booking-panel .error-message',  // Booking errors (most common)
      'main form .error-message',            // Form validation errors
      'main .results .error-message',         // Injected errors when room doesn't appear
      'main .error-message'                   // Fallback for any error in main
    ];
    
    // Check each selector sequentially with longer timeout
    // This is more reliable than Promise.race which can resolve too early
    for (const selector of selectors) {
      try {
        const locator = this.page.locator(selector).first();
        // Wait for error to appear with longer timeout (5 seconds)
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        const text = await locator.textContent();
        if (text && text.trim()) {
          return text.trim();
        }
      } catch {
        // Continue to next selector if this one doesn't find an error
        continue;
      }
    }
    
    // No error message found in any location
    return null;
  }

  async getValidationError(): Promise<string | null> {
    return await this.validationError.textContent();
  }
}

