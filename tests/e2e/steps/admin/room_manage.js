const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const RoomManagementPage = require('../../pages/admin/RoomManagementPage');

Given('I am on the admin room management page', async function () {
  this.roomManagementPage = new RoomManagementPage(this.page);
  await this.roomManagementPage.goto();
});

When('I create a new room type with name {string}, capacity {int} and base price {string}', async function (name, capacity, price) {
  await this.roomManagementPage.createRoom(name, capacity, price);
});

Then('the new room type should appear in the room list', async function () {
  const rooms = await this.roomManagementPage.getRoomList();
  expect(rooms.length).toBeGreaterThan(0);
});

Then('its details should be saved correctly', async function () {
  // Placeholder
});

Given('I have a room {string} of type {string}', async function (roomId, type) {
  // Mock
});

When('I mark room {string} as OUT_OF_ORDER', async function (roomId) {
  await this.roomManagementPage.markOutOfOrder(roomId);
});

Then('the room should be flagged as out of order', async function () {
  // Check status
});

Then('when a guest searches for rooms, room {string} should not be listed', async function (roomId) {
  // This would require switching to guest context or mock
});

Given('room {string} has a future booking from {string} to {string}', async function (roomId, from, to) {
  // Mock
});

When('I attempt to delete room {string}', async function (roomId) {
  await this.roomManagementPage.deleteRoom(roomId);
});

Then('I should see an error message {string}', async function (message) {
  const error = await this.roomManagementPage.getErrorMessage();
  expect(error).toContain(message);
});

Then('the room should remain in the system', async function () {
  // Check list
});