# language: en
@admin @booking_overview
Feature: Admin booking overview

  As an admin user
  I want to view and manage bookings
  So that I can keep track of reservations and their status

  @admin @booking_overview @filter
  Scenario: View bookings list filtered by date range
    Given I am on the admin bookings overview page
    When I filter bookings from "2025-12-01" to "2025-12-31"
    Then I should see a list of bookings whose dates fall within that range
    And the list should not contain bookings outside the range

  @admin @booking_overview @checkin
  Scenario: Mark booking as "Checked‑in" on or after check‑in date
    Given a booking exists with check‑in date "2025-12-10"
    And I am on the admin bookings overview page
    When I select that booking on "2025-12-10" or later
    And I mark it as "Checked‑in"
    Then the booking status should be updated to "Checked‑in"
    And the UI should reflect the new status

  @admin @booking_overview @checkout
  Scenario: Mark booking as "Checked‑out" on or after check‑out date
    Given a booking exists with check‑out date "2025-12-15"
    And I am on the admin bookings overview page
    When I select that booking on "2025-12-15" or later
    And I mark it as "Checked‑out"
    Then the booking status should be updated to "Checked‑out"
    And the UI should reflect the new status
