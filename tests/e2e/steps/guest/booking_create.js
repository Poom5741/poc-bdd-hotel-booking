const { createBdd } = require('playwright-bdd');
const { Given, When, Then } = createBdd();
const { expect } = require('@playwright/test');
const RoomSearchPage = require('../../pages/guest/RoomSearchPage');

When('I select a room card', async ({ page }) => {
  const roomSearchPage = new RoomSearchPage(page);
  const roomCards = await roomSearchPage.getRoomCards();
  await roomCards[0].click();
});

When('I choose {string} guests', async ({ page }, guests) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.setGuests(parseInt(guests));
});

When('I choose {string} guest', async ({ page }, guests) => {
  const roomSearchPage = new RoomSearchPage(page);
  await roomSearchPage.setGuests(parseInt(guests));
});

When('I submit the booking', async ({ page }) => {
  // Assume booking submit button
  await page.locator('.submit-booking').click();
});

Then('I should see a booking confirmation page', async ({ page }) => {
  await expect(page).toHaveURL(/confirmation/);
});

Then('the booking summary should display the selected dates and number of guests', async ({ page }) => {
  // Placeholder
});

Given('I have an existing booking for room {string} from {string} to {string}', async ({ page }, room, checkIn, checkOut) => {
  // Mock or setup
});

When('I attempt to book {string}', async ({ page }, room) => {
  // Select room
});

Then('I should see an error message {string}', async ({ page }, message) => {
  const error = await page.locator('.error-message').textContent();
  expect(error).toContain(message);
});

When('I select a room with price {string} per night', async ({ page }, price) => {
  // Select specific room
});

Then('the booking summary should show a total price of {string}', async ({ page }, total) => {
  const priceElement = await page.locator('.total-price').textContent();
  expect(priceElement).toContain(total);
});
