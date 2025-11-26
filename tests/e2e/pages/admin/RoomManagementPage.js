const { expect } = require('@playwright/test');

class RoomManagementPage {
  constructor(page) {
    this.page = page;
    this.createRoomButton = page.locator('.create-room-button');
    this.roomNameInput = page.locator('input[name="roomName"]');
    this.capacityInput = page.locator('input[name="capacity"]');
    this.priceInput = page.locator('input[name="price"]');
    this.saveButton = page.locator('.save-button');
    this.roomList = page.locator('.room-item');
    this.outOfOrderButton = page.locator('.out-of-order-button');
    this.deleteButton = page.locator('.delete-button');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/admin/rooms');
  }

  async createRoom(name, capacity, price) {
    await this.createRoomButton.click();
    await this.roomNameInput.fill(name);
    await this.capacityInput.fill(capacity.toString());
    await this.priceInput.fill(price);
    await this.saveButton.click();
  }

  async markOutOfOrder(roomId) {
    const button = this.page.locator(`.room-item[data-id="${roomId}"] .out-of-order-button`);
    await button.click();
  }

  async deleteRoom(roomId) {
    const button = this.page.locator(`.room-item[data-id="${roomId}"] .delete-button`);
    await button.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async getRoomList() {
    return await this.roomList.all();
  }
}

module.exports = RoomManagementPage;