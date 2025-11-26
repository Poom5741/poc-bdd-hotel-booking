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

When('I select a room card', async function () {
  const roomCards = await this.roomSearchPage.getRoomCards();
  await roomCards[0].click();
});

When('I choose {string} guests', async function (guests) {
  await this.roomSearchPage.setGuests(parseInt(guests));
});

When('I submit the booking', async function () {
  // Assume booking submit button
  await this.page.locator('.submit-booking').click();
});

Then('I should see a booking confirmation page', async function () {
  await expect(this.page).toHaveURL(/confirmation/);
});

Then('the booking summary should display the selected dates and number of guests', async function () {
  // Placeholder
});

Given('I have an existing booking for room {string} from {string} to {string}', async function (room, checkIn, checkOut) {
  // Mock or setup
});

When('I attempt to book {string}', async function (room) {
  // Select room
});

Then('I should see an error message {string}', async function (message) {
  const error = await this.page.locator('.error-message').textContent();
  expect(error).toContain(message);
});

When('I select a room with price {string} per night', async function (price) {
  // Select specific room
});

Then('the booking summary should show a total price of {string}', async function (total) {
  const priceElement = await this.page.locator('.total-price').textContent();
  expect(priceElement).toContain(total);
});