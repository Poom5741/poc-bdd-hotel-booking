import { test, expect } from '../fixtures.js';

test.describe('Admin booking overview', () => {
  test('View bookings list filtered by date range', async ({ bookingOverviewPage }) => {
    await bookingOverviewPage.goto();
    await bookingOverviewPage.waitForBookingList();
    
    const fromDate = '2025-12-01';
    const toDate = '2025-12-31';
    await bookingOverviewPage.filterBookings(fromDate, toDate);
    
    const bookings = await bookingOverviewPage.getBookingsMeta();
    expect(bookings.length).toBeGreaterThan(0);
    
    // Verify all bookings fall within the date range
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    bookings.forEach((booking) => {
      if (!booking.checkIn || !booking.checkOut) return;
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      expect(checkInDate >= from && checkOutDate <= to).toBeTruthy();
    });
    
    // Verify no bookings outside the range are shown
    bookings.forEach((booking) => {
      if (!booking.checkIn || !booking.checkOut) return;
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      expect(checkInDate < from || checkOutDate > to).toBeFalsy();
    });
  });

  test('Mark booking as "Checked-in" on or after check-in date', async ({ bookingOverviewPage }) => {
    const targetCheckInDate = '2025-12-10';
    const actionDate = '2025-12-10';
    
    await bookingOverviewPage.goto();
    await bookingOverviewPage.waitForBookingList();
    
    const bookingId = await bookingOverviewPage.findBookingIdByDate({
      checkIn: targetCheckInDate,
    });
    
    if (!bookingId) {
      throw new Error(`Could not find booking with check-in date ${targetCheckInDate}`);
    }
    
    await bookingOverviewPage.markCheckedIn(bookingId);
    
    // Verify status updated
    const currentStatus = await bookingOverviewPage.getStatusByBookingId(bookingId);
    expect(currentStatus).toContain('Checked-in');
    
    // Verify UI reflects the new status
    const statusLocator = bookingOverviewPage.getStatusLocatorByBookingId(bookingId);
    await expect(statusLocator).toContainText('Checked-in');
  });

  test('Mark booking as "Checked-out" on or after check-out date', async ({ bookingOverviewPage }) => {
    const targetCheckOutDate = '2025-12-15';
    const actionDate = '2025-12-15';
    
    await bookingOverviewPage.goto();
    await bookingOverviewPage.waitForBookingList();
    
    const bookingId = await bookingOverviewPage.findBookingIdByDate({
      checkOut: targetCheckOutDate,
    });
    
    if (!bookingId) {
      throw new Error(`Could not find booking with check-out date ${targetCheckOutDate}`);
    }
    
    await bookingOverviewPage.markCheckedOut(bookingId);
    
    // Verify status updated
    const currentStatus = await bookingOverviewPage.getStatusByBookingId(bookingId);
    expect(currentStatus).toContain('Checked-out');
    
    // Verify UI reflects the new status
    const statusLocator = bookingOverviewPage.getStatusLocatorByBookingId(bookingId);
    await expect(statusLocator).toContainText('Checked-out');
  });
});

