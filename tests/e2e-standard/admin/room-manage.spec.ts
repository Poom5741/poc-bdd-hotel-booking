import { test, expect } from '../fixtures.js';

test.describe('Admin room management', () => {
  test('Create a new room type', async ({ roomManagementPage }) => {
    await roomManagementPage.goto();
    
    await roomManagementPage.createRoom('Standard', 2, '$120');
    
    const rooms = await roomManagementPage.getRoomList();
    expect(rooms.length).toBeGreaterThan(0);
    
    // Placeholder: details should be saved correctly
    // This can be expanded to verify specific room details
  });

  test('Mark a room OUT_OF_ORDER and it should not appear in guest search', async ({ roomManagementPage, roomSearchPage }) => {
    const roomId = '101';
    const roomType = 'Standard';
    
    // Note: The "I have a room" step was a mock in the original, so we'll skip that setup
    await roomManagementPage.goto();
    
    await roomManagementPage.markOutOfOrder(roomId);
    
    // Verify room is flagged as out of order (placeholder check)
    // This can be expanded based on the actual UI indicators
    
    // Check that room doesn't appear in guest search
    await roomSearchPage.goto();
    await roomSearchPage.setCheckIn('2025-12-01');
    await roomSearchPage.setCheckOut('2025-12-05');
    await roomSearchPage.submitSearch();
    
    const roomCount = await roomSearchPage.getRoomCardCountByName(roomId);
    expect(roomCount).toBe(0);
  });

  test('Attempt to delete room with future bookings results in error', async ({ roomManagementPage }) => {
    const roomId = '102';
    const fromDate = '2025-12-01';
    const toDate = '2025-12-05';
    
    // Note: The "room has a future booking" step was a mock in the original
    // In a real scenario, you might set up a booking via API
    await roomManagementPage.goto();
    
    await roomManagementPage.deleteRoom(roomId);
    
    // Wait for error message to be visible
    await roomManagementPage.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    await expect(roomManagementPage.errorMessage).toHaveText('Cannot delete room with future bookings');
    
    // Verify room remains in the system (placeholder check)
    // This can be expanded to verify the room still exists in the list
  });
});

