import { expect } from '@playwright/test';
import { Before, Given, When, Then } from '../../fixtures';

interface ScenarioState {
  targetFutureCheckIn?: string;
  targetPastCheckIn?: string;
  selectedBookingId?: string;
}

let scenarioState: ScenarioState = {};

Before(() => {
  scenarioState = {};
});

Given('I am logged in as a guest user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.fillEmail('guest1@stayflex.test');
  await loginPage.fillPassword('password123');
  await loginPage.submit();
  await expect(page).toHaveURL(/\/dashboard/);
});

When('I navigate to the {string} page', async ({ myBookingsPage }, pageName: string) => {
  if (pageName === 'My Bookings') {
    await myBookingsPage.goto();
    await myBookingsPage.waitForBookingList();
  }
});

Given('I am on the {string} page', async ({ myBookingsPage }, pageName: string) => {
  if (pageName === 'My Bookings') {
    await myBookingsPage.goto();
    await myBookingsPage.waitForBookingList();
  }
});

Then('I should see a list of future bookings', async ({ myBookingsPage }) => {
  const bookings = await myBookingsPage.getBookingsMeta();
  const futureBookings = bookings.filter((booking) =>
    (booking.status || '').toLowerCase().includes('future'),
  );
  expect(futureBookings.length).toBeGreaterThan(0);
});

Then('I should see a separate list of past bookings', async ({ myBookingsPage }) => {
  const bookings = await myBookingsPage.getBookingsMeta();
  const pastBookings = bookings.filter((booking) =>
    (booking.status || '').toLowerCase().includes('past'),
  );
  expect(pastBookings.length).toBeGreaterThan(0);
});

Given('I have a future booking with check‑in date {string}', async ({}, date: string) => {
  scenarioState.targetFutureCheckIn = date;
});

When('I click the cancel button for that booking', async ({ myBookingsPage }) => {
  await myBookingsPage.waitForBookingList();
  const bookingId = await myBookingsPage.findBookingIdByDate(scenarioState.targetFutureCheckIn!);

  if (!bookingId) {
    throw new Error(`Could not find booking with check-in date ${scenarioState.targetFutureCheckIn}`);
  }

  scenarioState.selectedBookingId = bookingId;
  await myBookingsPage.cancelBookingById(bookingId);
});

Then('the booking should be removed from the future bookings list', async ({ myBookingsPage }) => {
  const bookingId = scenarioState.selectedBookingId!;
  const bookingLocator = myBookingsPage.getBookingLocatorById(bookingId);
  await expect(bookingLocator).toBeHidden();
});

Then('I should see a confirmation message {string}', async ({ myBookingsPage }, message: string) => {
  const confirmation = await myBookingsPage.getConfirmationMessage();
  expect(confirmation).toContain(message);
});

Given('I have a past booking with check‑in date {string}', async ({}, date: string) => {
  scenarioState.targetPastCheckIn = date;
});

When('I look for a cancel button for that booking', async ({ myBookingsPage }) => {
  const bookingId = await myBookingsPage.findBookingIdByDate(scenarioState.targetPastCheckIn!);
  scenarioState.selectedBookingId = bookingId;
});

Then('I should not see a cancel option', async ({ myBookingsPage }) => {
  const bookingId = scenarioState.selectedBookingId!;
  const cancelButton = myBookingsPage.getCancelButtonByBookingId(bookingId);
  await expect(cancelButton).toBeHidden();
});

Then('I should see a label {string}', async ({ myBookingsPage }, label: string) => {
  const bookingId = scenarioState.selectedBookingId!;
  const labelLocator = myBookingsPage.getLabelByBookingId(bookingId, label);
  await expect(labelLocator).toBeVisible();
});

