import { test, expect } from '../fixtures.js';

test.describe('Guest room search', () => {
  test('Search with available rooms shows room cards', async ({ roomSearchPage }) => {
    await roomSearchPage.goto();
    await roomSearchPage.setCheckIn('2025-12-01');
    await roomSearchPage.setCheckOut('2025-12-05');
    await roomSearchPage.submitSearch();
    
    const roomCards = await roomSearchPage.getRoomCards();
    expect(roomCards.length).toBeGreaterThan(0);
    
    // Check that each card displays room details (placeholder check)
    // In a real scenario, you might want to verify specific details
  });

  test('Search with no matching rooms shows no results message', async ({ roomSearchPage }) => {
    await roomSearchPage.goto();
    await roomSearchPage.setCheckIn('2030-01-01');
    await roomSearchPage.setCheckOut('2030-01-05');
    await roomSearchPage.submitSearch();
    
    const noRoomsMessage = await roomSearchPage.getNoRoomsMessage();
    expect(noRoomsMessage).toContain('No rooms available');
  });

  test('Invalid date range shows validation error', async ({ roomSearchPage }) => {
    await roomSearchPage.goto();
    await roomSearchPage.setCheckIn('2025-12-10');
    await roomSearchPage.setCheckOut('2025-12-05');
    await roomSearchPage.submitSearch();
    
    const error = await roomSearchPage.getValidationError();
    expect(error).toBeTruthy();
  });
});

