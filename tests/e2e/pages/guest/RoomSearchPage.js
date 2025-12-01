const { expect } = require('@playwright/test');

class RoomSearchPage {
  constructor(page) {
    this.page = page;
    this.checkInInput = page.locator('input[name="checkIn"]');
    this.checkOutInput = page.locator('input[name="checkOut"]');
    this.guestsInput = page.locator('input[name="guests"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.roomCards = page.locator('.room-card');
    this.noRoomsMessage = page.locator('.no-rooms-message');
    this.bookingPanel = page.locator('.booking-panel');
    this.bookingGuestsInput = page.locator('input[name="bookingGuests"]');
    this.confirmBookingButton = page.locator('.confirm-booking-button');
    this.errorMessage = page.locator('.error-message');
    this.validationError = page.locator('.validation-error');
  }

  async goto() {
    await this.page.goto('/search');
  }

  async setCheckIn(date) {
    await this.checkInInput.fill(date);
  }

  async setCheckOut(date) {
    await this.checkOutInput.fill(date);
  }

  async setGuests(count) {
    await this.guestsInput.fill(count.toString());
  }

  async submitSearch() {
    await this.submitButton.click();
  }

  async getRoomCards() {
    return await this.roomCards.all();
  }

  async clickFirstRoomCard() {
    const roomCards = await this.getRoomCards();
    if (roomCards.length === 0) {
      throw new Error('No room cards found');
    }
    await roomCards[0].click();
    await this.waitForBookingPanel();
  }

  async getNoRoomsMessage() {
    return await this.noRoomsMessage.textContent();
  }

  async waitForBookingPanel() {
    await this.bookingPanel.waitFor({ state: 'visible' });
  }

  async fillBookingGuests(count) {
    await this.bookingGuestsInput.fill(count);
  }

  async clickConfirmBooking() {
    await this.confirmBookingButton.click();
  }

  getRoomCardByPrice(price) {
    const priceValue = price.replace('$', '');
    // Try to find by data-price attribute first (more reliable)
    let roomCard = this.page.locator(`.room-card[data-price="${priceValue}"]`).first();
    // Fallback to text search if data attribute doesn't match
    return roomCard;
  }

  getRoomCardByName(name) {
    return this.page.locator('.room-card').filter({ hasText: name }).first();
  }

  async getRoomCardCountByName(name) {
    return await this.page.locator('.room-card').filter({ hasText: name }).count();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async getValidationError() {
    return await this.validationError.textContent();
  }
}

module.exports = RoomSearchPage;