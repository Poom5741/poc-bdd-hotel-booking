import type { Page, Locator } from '@playwright/test';

export default class RoomManagementPage {
  readonly page: Page;
  readonly createRoomButton: Locator;
  readonly roomNameInput: Locator;
  readonly capacityInput: Locator;
  readonly priceInput: Locator;
  readonly saveButton: Locator;
  readonly roomList: Locator;
  readonly outOfOrderButton: Locator;
  readonly deleteButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
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

  async goto(): Promise<void> {
    await this.page.goto('/admin/rooms');
  }

  async createRoom(name: string, capacity: number, price: string): Promise<void> {
    await this.createRoomButton.click();
    await this.roomNameInput.fill(name);
    await this.capacityInput.fill(capacity.toString());
    await this.priceInput.fill(price);
    await this.saveButton.click();
  }

  async markOutOfOrder(roomId: string): Promise<void> {
    const button = this.page.locator(`.room-item[data-id="${roomId}"] .out-of-order-button`);
    await button.click();
  }

  async deleteRoom(roomId: string): Promise<void> {
    const button = this.page.locator(`.room-item[data-id="${roomId}"] .delete-button`);
    await button.click();
  }

  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  async getRoomList(): Promise<Locator[]> {
    return await this.roomList.all();
  }
}

