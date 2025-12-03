import type { Page, Locator } from '@playwright/test';

export default class RoomManagementPage {
  readonly page: Page;
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
    this.roomNameInput = page.locator('input[name="roomName"]');
    this.capacityInput = page.locator('input[name="capacity"]');
    this.priceInput = page.locator('input[name="price"]');
    // The submit button has class "submit-button" and text "Save Room"
    this.saveButton = page.locator('form button[type="submit"]').filter({ hasText: 'Save Room' });
    // HTML uses .booking-item, not .room-item
    this.roomList = page.locator('.booking-item');
    // HTML uses .check-in-button for the "Mark Out of Order" button, not .out-of-order-button
    this.outOfOrderButton = page.locator('.check-in-button');
    this.deleteButton = page.locator('.delete-button');
    // Scope to main content to avoid matching Next.js route announcer (which is outside main)
    // Error messages in rooms.js have role="alert", so we use that for specificity
    this.errorMessage = page.locator('main .error-message[role="alert"]').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/rooms');
  }

  async createRoom(name: string, capacity: number, price: string): Promise<void> {
    // Form is always visible, no need to click a "create" button
    await this.roomNameInput.fill(name);
    await this.capacityInput.fill(capacity.toString());
    await this.priceInput.fill(price);
    // Wait for button to be visible
    await this.saveButton.waitFor({ state: 'visible' });
    // Wait for button to be enabled (retry if disabled)
    let retries = 10;
    while (retries > 0 && (await this.saveButton.isDisabled())) {
      await this.page.waitForTimeout(100);
      retries--;
    }
    await this.saveButton.click();
  }

  async markOutOfOrder(roomId: string): Promise<void> {
    // Normalize roomId: HTML uses displayId (e.g., "102" not "room-102")
    const normalizedId = roomId.startsWith('room-') ? roomId.replace('room-', '') : roomId;
    // HTML uses .booking-item (not .room-item) and .check-in-button (not .out-of-order-button)
    const button = this.page.locator(`.booking-item[data-id="${normalizedId}"] .check-in-button`);
    await button.click();
  }

  async deleteRoom(roomId: string): Promise<void> {
    // Normalize roomId: HTML uses displayId (e.g., "102" not "room-102")
    const normalizedId = roomId.startsWith('room-') ? roomId.replace('room-', '') : roomId;
    // HTML uses .booking-item (not .room-item)
    const button = this.page.locator(`.booking-item[data-id="${normalizedId}"] .delete-button`);
    await button.click();
  }

  async getErrorMessage(): Promise<string | null> {
    // Wait for error message to be visible before getting text
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorMessage.textContent();
    } catch {
      // If error message doesn't appear, return null
      return null;
    }
  }

  async getRoomList(): Promise<Locator[]> {
    return await this.roomList.all();
  }
}

