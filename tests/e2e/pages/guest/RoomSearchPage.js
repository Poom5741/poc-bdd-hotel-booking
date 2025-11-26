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

  async getNoRoomsMessage() {
    return await this.noRoomsMessage.textContent();
  }
}

module.exports = RoomSearchPage;