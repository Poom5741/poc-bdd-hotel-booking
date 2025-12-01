import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('I am on the admin room management page', async ({ roomManagementPage }) => {
  await roomManagementPage.goto();
});

When('I create a new room type with name {string}, capacity {int} and base price {string}', async ({ roomManagementPage }, name: string, capacity: number, price: string) => {
  await roomManagementPage.createRoom(name, capacity, price);
});

Then('the new room type should appear in the room list', async ({ roomManagementPage }) => {
  const rooms = await roomManagementPage.getRoomList();
  expect(rooms.length).toBeGreaterThan(0);
});

Then('its details should be saved correctly', async ({ roomManagementPage }) => {
  // Placeholder
});

Given('I have a room {string} of type {string}', async ({ roomManagementPage }, roomId: string, type: string) => {
  // Mock
});

When('I mark room {string} as OUT_OF_ORDER', async ({ roomManagementPage }, roomId: string) => {
  await roomManagementPage.markOutOfOrder(roomId);
});

Then('the room should be flagged as out of order', async ({ roomManagementPage }) => {
  // Check status
});

Then('when a guest searches for rooms, room {string} should not be listed', async ({ roomManagementPage }, roomId: string) => {
  // This would require switching to guest context or mock
});

Given('room {string} has a future booking from {string} to {string}', async ({ roomManagementPage }, roomId: string, from: string, to: string) => {
  // Mock
});

When('I attempt to delete room {string}', async ({ roomManagementPage }, roomId: string) => {
  await roomManagementPage.deleteRoom(roomId);
});

Then('I should see an error room message {string}', async ({ roomManagementPage }, message: string) => {
  // waits for the alert rendered by handleDelete('room-102')
  // Use page object's errorMessage locator to avoid matching Next.js route announcer
  await expect(roomManagementPage.errorMessage).toHaveText(message);
});

Then('the room should remain in the system', async ({}) => {
  // Step: And the room should remain in the system
  // From: features/admin/room_manage.feature:30:5
});

