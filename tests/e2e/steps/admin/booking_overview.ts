import { expect } from '@playwright/test';
import { Before, Given, When, Then } from '../../fixtures';

interface ScenarioState {
  range?: { from: string; to: string };
  targetCheckInDate?: string;
  targetCheckOutDate?: string;
  selectedBookingId?: string;
  actionDate?: string;
  expectedStatus?: string;
}

let scenarioState: ScenarioState = {};

Before(() => {
  scenarioState = {};
});

Given('I am on the admin bookings overview page', async ({ bookingOverviewPage }) => {
  await bookingOverviewPage.goto();
  await bookingOverviewPage.waitForBookingList();
});

When('I filter bookings from {string} to {string}', async ({ bookingOverviewPage }, from: string, to: string) => {
  await bookingOverviewPage.filterBookings(from, to);
  scenarioState.range = { from, to };
});

Then('I should see a list of bookings whose dates fall within that range', async ({ bookingOverviewPage }) => {
  const bookings = await bookingOverviewPage.getBookingsMeta();
  expect(bookings.length).toBeGreaterThan(0);

  const { from, to } = scenarioState.range || {};
  const fromDate = new Date(from!);
  const toDate = new Date(to!);

  bookings.forEach((booking) => {
    if (!booking.checkIn || !booking.checkOut) return;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    expect(checkInDate >= fromDate && checkOutDate <= toDate).toBeTruthy();
  });
});

Then('the list should not contain bookings outside the range', async ({ bookingOverviewPage }) => {
  const bookings = await bookingOverviewPage.getBookingsMeta();
  const { from, to } = scenarioState.range || {};
  const fromDate = new Date(from!);
  const toDate = new Date(to!);

  bookings.forEach((booking) => {
    if (!booking.checkIn || !booking.checkOut) return;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    expect(checkInDate < fromDate || checkOutDate > toDate).toBeFalsy();
  });
});

// Accept both hyphen variants (non-breaking and ASCII)
Given('a booking exists with check‑in date {string}', async ({}, date: string) => {
  scenarioState.targetCheckInDate = date;
});
Given('a booking exists with check-in date {string}', async ({}, date: string) => {
  scenarioState.targetCheckInDate = date;
});

// Handle check-out date scenarios
Given('a booking exists with check‑out date {string}', async ({}, date: string) => {
  scenarioState.targetCheckOutDate = date;
});
Given('a booking exists with check-out date {string}', async ({}, date: string) => {
  scenarioState.targetCheckOutDate = date;
});

When('I select that booking on {string} or later', async ({ bookingOverviewPage }, date: string) => {
  await bookingOverviewPage.waitForBookingList();

  const bookingId = await bookingOverviewPage.findBookingIdByDate({
    checkIn: scenarioState.targetCheckInDate,
    checkOut: scenarioState.targetCheckOutDate,
  });

  if (!bookingId) {
    const dateInfo = scenarioState.targetCheckInDate 
      ? `check-in date ${scenarioState.targetCheckInDate}` 
      : `check-out date ${scenarioState.targetCheckOutDate}`;
    throw new Error(`Could not find booking with ${dateInfo}`);
  }

  scenarioState.selectedBookingId = bookingId;
  scenarioState.actionDate = date;
});

When('I mark it as {string}', async ({ bookingOverviewPage }, status: string) => {
  const bookingId = scenarioState.selectedBookingId;

  if (!bookingId) {
    throw new Error('No booking selected in scenario state');
  }

  if (status === 'Checked‑in' || status === 'Checked-in') {
    await bookingOverviewPage.markCheckedIn(bookingId);
  } else if (status === 'Checked‑out' || status === 'Checked-out') {
    await bookingOverviewPage.markCheckedOut(bookingId);
  }

  scenarioState.expectedStatus = status.replace('‑', '-');
});

Then('the booking status should be updated to {string}', async ({ bookingOverviewPage }, status: string) => {
  const bookingId = scenarioState.selectedBookingId!;
  const currentStatus = await bookingOverviewPage.getStatusByBookingId(bookingId);
  expect(currentStatus).toContain(status.replace('‑', '-'));
});

Then('the UI should reflect the new status', async ({ bookingOverviewPage }) => {
  const bookingId = scenarioState.selectedBookingId!;
  const expectedStatus = scenarioState.expectedStatus!;

  const statusLocator = bookingOverviewPage.getStatusLocatorByBookingId(bookingId);
  await expect(statusLocator).toContainText(expectedStatus);
});

