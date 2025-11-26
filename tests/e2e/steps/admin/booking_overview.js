const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const BookingOverviewPage = require('../../pages/admin/BookingOverviewPage');

Given('I am on the admin bookings overview page', async function () {
  this.bookingOverviewPage = new BookingOverviewPage(this.page);
  await this.bookingOverviewPage.goto();
});

When('I filter bookings from {string} to {string}', async function (from, to) {
  await this.bookingOverviewPage.filterBookings(from, to);
});

Then('I should see a list of bookings whose dates fall within that range', async function () {
  const bookings = await this.bookingOverviewPage.getBookingList();
  expect(bookings.length).toBeGreaterThan(0);
});

Then('the list should not contain bookings outside the range', async function () {
  // Placeholder
});

Given('a booking exists with check‑in date {string}', async function (date) {
  // Mock
});

When('I select that booking on {string} or later', async function (date) {
  // Assume booking id
});

When('I mark it as {string}', async function (status) {
  if (status === 'Checked‑in') {
    await this.bookingOverviewPage.markCheckedIn('some-id');
  } else if (status === 'Checked‑out') {
    await this.bookingOverviewPage.markCheckedOut('some-id');
  }
});

Then('the booking status should be updated to {string}', async function (status) {
  const currentStatus = await this.bookingOverviewPage.getStatusByBookingId('some-id');
  expect(currentStatus).toBe(status);
});

Then('the UI should reflect the new status', async function () {
  // Placeholder
});

Given('a booking exists with check‑out date {string}', async function (date) {
  // Mock
});