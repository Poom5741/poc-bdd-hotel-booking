# BMAD Plan: Refactor booking price test to click first room and check for any price display

## Goal
Change the booking price test scenario to click on the first room that appears (instead of selecting by price), then verify that a price is displayed in the confirmation page without checking for a specific dollar amount, using page object model methods instead of direct locators.

## Implementation Tasks

### Task 1: Update booking_create.feature to remove price-specific selection
- Modify the "@price" scenario in `tests/e2e/features/guest/booking_create.feature`:
  - Change "I select a room with price" step to "I select a room card" (use the first room)
  - Change the assertion step to check for any price display instead of specific "$360"
- **Files to touch:**
  - `tests/e2e/features/guest/booking_create.feature`

### Task 2: Add method to RoomSearchPage to click first room card
- Add method `clickFirstRoomCard()` to `RoomSearchPage.js` that:
  - Gets all room cards using existing `getRoomCards()` method
  - Clicks the first room card
  - Waits for booking panel to appear
- **Files to touch:**
  - `tests/e2e/pages/guest/RoomSearchPage.js`

### Task 3: Update booking_create.js step to use page object method for first room selection
- Replace the "I select a room with price" step implementation to use `clickFirstRoomCard()` method from RoomSearchPage
- Remove the price-specific selection logic
- **Files to touch:**
  - `tests/e2e/steps/guest/booking_create.js`

### Task 4: Add method to ConfirmationPage to check if price exists
- Add method `hasPriceDisplayed()` to `ConfirmationPage.js` that:
  - Checks if total price element exists and has text content
  - Returns boolean indicating if price is displayed (without checking specific value)
- **Files to touch:**
  - `tests/e2e/pages/guest/ConfirmationPage.js`

### Task 5: Update booking_create.js assertion to check for any price display
- Replace the "the booking summary should show a total price of" step implementation:
  - Use `hasPriceDisplayed()` method from ConfirmationPage
  - Assert that price is displayed (truthy check) instead of checking for specific dollar amount
- **Files to touch:**
  - `tests/e2e/steps/guest/booking_create.js`

---

**Ready to run /bmad-run for Task 1.**
