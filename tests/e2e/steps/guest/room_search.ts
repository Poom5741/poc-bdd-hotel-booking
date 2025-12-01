import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('I am on the room search page', async ({ roomSearchPage }) => {
  await roomSearchPage.goto();
});

When('I search for rooms from {string} to {string}', async ({ roomSearchPage }, checkIn: string, checkOut: string) => {
  await roomSearchPage.setCheckIn(checkIn);
  await roomSearchPage.setCheckOut(checkOut);
  await roomSearchPage.submitSearch();
});

Then('I should see a list of room cards', async ({ roomSearchPage }) => {
  const roomCards = await roomSearchPage.getRoomCards();
  expect(roomCards.length).toBeGreaterThan(0);
});

Then('each card should display room details', async ({ roomSearchPage }) => {
  // Placeholder for checking details
});

Then('I should see a message {string}', async ({ roomSearchPage }, message: string) => {
  const noRoomsMessage = await roomSearchPage.getNoRoomsMessage();
  expect(noRoomsMessage).toContain(message);
});

When('I enter a check‑in date {string} and a check‑out date {string}', async ({ roomSearchPage }, checkIn: string, checkOut: string) => {
  await roomSearchPage.setCheckIn(checkIn);
  await roomSearchPage.setCheckOut(checkOut);
});

When('I submit the search', async ({ roomSearchPage }) => {
  await roomSearchPage.submitSearch();
});

Then('I should see a validation error message about the date range', async ({ roomSearchPage }) => {
  const error = await roomSearchPage.getValidationError();
  expect(error).toBeTruthy();
});

