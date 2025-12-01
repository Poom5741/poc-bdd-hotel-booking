const { createBdd } = require('playwright-bdd');
const { Given, When, Then } = createBdd();
const { expect } = require('@playwright/test');
const RoomSearchPage = require('../../pages/guest/RoomSearchPage');

Given('I am on the room search page', async ({ page }) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.goto();
});

When('I search for rooms from {string} to {string}', async ({ page }, checkIn, checkOut) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.setCheckIn(checkIn);
  await roomSearchPage.setCheckOut(checkOut);
  await roomSearchPage.submitSearch();
});

Then('I should see a list of room cards', async ({ page }) => {
  const roomSearchPage = new RoomSearchPage(page);
  const roomCards = await roomSearchPage.getRoomCards();
  expect(roomCards.length).toBeGreaterThan(0);
});

Then('each card should display room details', async ({ page }) => {
  // Placeholder for checking details
});

Then('I should see a message {string}', async ({ page }, message) => {
  const roomSearchPage = new RoomSearchPage(page);
  const noRoomsMessage = await roomSearchPage.getNoRoomsMessage();
  expect(noRoomsMessage).toContain(message);
});

When('I enter a check‑in date {string} and a check‑out date {string}', async ({ page }, checkIn, checkOut) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.setCheckIn(checkIn);
  await roomSearchPage.setCheckOut(checkOut);
});

When('I submit the search', async ({ page }) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.submitSearch();
});

Then('I should see a validation error message about the date range', async ({ page }) => {
  const roomSearchPage = new RoomSearchPage(page);
  const error = await roomSearchPage.getValidationError();
  expect(error).toBeTruthy();
});