const { createBdd } = require('playwright-bdd');
const { Given, When, Then } = createBdd();
const { expect } = require('@playwright/test');
const RoomManagementPage = require('../../pages/admin/RoomManagementPage');

Given('I am on the admin room management page', async ({ page }) => {
  const roomManagementPage = new RoomManagementPage(page);
  await roomManagementPage.goto();
});

When('I create a new room type with name {string}, capacity {int} and base price {string}', async ({ page }, name, capacity, price) => {
  const roomManagementPage = new RoomManagementPage(page);
  await roomManagementPage.createRoom(name, capacity, price);
});

Then('the new room type should appear in the room list', async ({ page }) => {
  const roomManagementPage = new RoomManagementPage(page);
  const rooms = await roomManagementPage.getRoomList();
  expect(rooms.length).toBeGreaterThan(0);
});

Then('its details should be saved correctly', async ({ page }) => {
  // Placeholder
});

Given('I have a room {string} of type {string}', async ({ page }, roomId, type) => {
  // Mock
});

When('I mark room {string} as OUT_OF_ORDER', async ({ page }, roomId) => {
  const roomManagementPage = new RoomManagementPage(page);
  await roomManagementPage.markOutOfOrder(roomId);
});

Then('the room should be flagged as out of order', async ({ page }) => {
  // Check status
});

Then('when a guest searches for rooms, room {string} should not be listed', async ({ page }, roomId) => {
  // This would require switching to guest context or mock
});

Given('room {string} has a future booking from {string} to {string}', async ({ page }, roomId, from, to) => {
  // Mock
});

When('I attempt to delete room {string}', async ({ page }, roomId) => {
  const roomManagementPage = new RoomManagementPage(page);
  await roomManagementPage.deleteRoom(roomId);
});

Then('I should see an error room message {string}', async ({ page }, message) => {
  // waits for the alert rendered by handleDelete('room-102')
  await expect(page.getByRole('alert')).toHaveText(message);
});

Then('the room should remain in the system', async ({}) => {
  // Step: And the room should remain in the system
  // From: features/admin/room_manage.feature:30:5
});