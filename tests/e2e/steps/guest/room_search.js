const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const RoomSearchPage = require('../../pages/guest/RoomSearchPage');

Given('I am on the room search page', async function () {
  this.roomSearchPage = new RoomSearchPage(this.page);
  await this.roomSearchPage.goto();
});

When('I search for rooms from {string} to {string}', async function (checkIn, checkOut) {
  await this.roomSearchPage.setCheckIn(checkIn);
  await this.roomSearchPage.setCheckOut(checkOut);
  await this.roomSearchPage.submitSearch();
});

Then('I should see a list of room cards', async function () {
  const roomCards = await this.roomSearchPage.getRoomCards();
  expect(roomCards.length).toBeGreaterThan(0);
});

Then('each card should display room details', async function () {
  // Placeholder for checking details
});

Then('I should see a message {string}', async function (message) {
  const noRoomsMessage = await this.roomSearchPage.getNoRoomsMessage();
  expect(noRoomsMessage).toContain(message);
});

When('I enter a check‑in date {string} and a check‑out date {string}', async function (checkIn, checkOut) {
  await this.roomSearchPage.setCheckIn(checkIn);
  await this.roomSearchPage.setCheckOut(checkOut);
});

When('I submit the search', async function () {
  await this.roomSearchPage.submitSearch();
});

Then('I should see a validation error message about the date range', async function () {
  // Assume error message locator
  const error = await this.page.locator('.validation-error').textContent();
  expect(error).toBeTruthy();
});