const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const MyBookingsPage = require('../../pages/guest/MyBookingsPage');

Given('I am logged in as a guest user', async function () {
  // Assume login step or mock
});

When('I navigate to the {string} page', async function (pageName) {
  if (pageName === 'My Bookings') {
    this.myBookingsPage = new MyBookingsPage(this.page);
    await this.myBookingsPage.goto();
  }
});

Then('I should see a list of future bookings', async function () {
  const bookings = await this.myBookingsPage.getBookingList();
  expect(bookings.length).toBeGreaterThan(0);
});

Then('I should see a separate list of past bookings', async function () {
  // Placeholder
});

Given('I have a future booking with check‑in date {string}', async function (date) {
  // Mock
});

When('I click the cancel button for that booking', async function () {
  // Assume booking id
  await this.myBookingsPage.cancelBookingById('some-id');
});

Then('the booking should be removed from the future bookings list', async function () {
  // Check list
});

Then('I should see a confirmation message {string}', async function (message) {
  const confirmation = await this.page.locator('.confirmation-message').textContent();
  expect(confirmation).toContain(message);
});

Given('I have a past booking with check‑in date {string}', async function (date) {
  // Mock
});

When('I look for a cancel button for that booking', async function () {
  // Check visibility
});

Then('I should not see a cancel option', async function () {
  // Assert no cancel button
});

Then('I should see a label {string}', async function (label) {
  const labelElement = await this.page.locator('.label').textContent();
  expect(labelElement).toContain(label);
});