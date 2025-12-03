import { test, expect } from '../fixtures.js';

test.describe('Guest My Bookings', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    // Helper function to log in as guest user
    await loginPage.goto();
    await loginPage.fillEmail('guest1@stayflex.test');
    await loginPage.fillPassword('password123');
    await loginPage.submit();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('View list of future and past bookings', async ({ myBookingsPage }) => {
    await myBookingsPage.goto();
    await myBookingsPage.waitForBookingList();
    
    const bookings = await myBookingsPage.getBookingsMeta();
    const futureBookings = bookings.filter((booking) =>
      (booking.status || '').toLowerCase().includes('future'),
    );
    expect(futureBookings.length).toBeGreaterThan(0);
    
    const pastBookings = bookings.filter((booking) =>
      (booking.status || '').toLowerCase().includes('past'),
    );
    expect(pastBookings.length).toBeGreaterThan(0);
  });

  test('Cancel future booking (today < check-in)', async ({ myBookingsPage }) => {
    const targetFutureCheckIn = '2025-12-20';
    
    await myBookingsPage.goto();
    await myBookingsPage.waitForBookingList();
    
    const bookingId = await myBookingsPage.findBookingIdByDate(targetFutureCheckIn);
    if (!bookingId) {
      throw new Error(`Could not find booking with check-in date ${targetFutureCheckIn}`);
    }
    
    await myBookingsPage.cancelBookingById(bookingId);
    
    // Verify booking is removed from list
    const bookingLocator = myBookingsPage.getBookingLocatorById(bookingId);
    await expect(bookingLocator).toBeHidden();
    
    // Verify confirmation message
    const confirmation = await myBookingsPage.getConfirmationMessage();
    expect(confirmation).toContain('Booking cancelled');
  });

  test('Cannot cancel past booking', async ({ myBookingsPage }) => {
    const targetPastCheckIn = '2024-11-01';
    
    await myBookingsPage.goto();
    await myBookingsPage.waitForBookingList();
    
    const bookingId = await myBookingsPage.findBookingIdByDate(targetPastCheckIn);
    if (!bookingId) {
      throw new Error(`Could not find booking with check-in date ${targetPastCheckIn}`);
    }
    
    // Verify cancel button is not visible
    const cancelButton = myBookingsPage.getCancelButtonByBookingId(bookingId);
    await expect(cancelButton).toBeHidden();
    
    // Verify label is visible
    const labelLocator = myBookingsPage.getLabelByBookingId(bookingId, 'Cannot cancel past bookings');
    await expect(labelLocator).toBeVisible();
  });
});

