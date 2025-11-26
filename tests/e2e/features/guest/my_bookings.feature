# language: en
@guest @booking @my_bookings
Feature: Guest My Bookings

  As a guest user
  I want to view and manage my bookings
  So that I can keep track of upcoming stays and past history

  @guest @booking @my_bookings @view
  Scenario: View list of future and past bookings
    Given I am logged in as a guest user
    When I navigate to the "My Bookings" page
    Then I should see a list of future bookings
    And I should see a separate list of past bookings

  @guest @booking @my_bookings @cancel @positive
  Scenario: Cancel future booking (today < check‑in)
    Given I have a future booking with check‑in date "2025-12-20"
    And I am on the "My Bookings" page
    When I click the cancel button for that booking
    Then the booking should be removed from the future bookings list
    And I should see a confirmation message "Booking cancelled"

  @guest @booking @my_bookings @cancel @negative
  Scenario: Cannot cancel past booking
    Given I have a past booking with check‑in date "2024-11-01"
    And I am on the "My Bookings" page
    When I look for a cancel button for that booking
    Then I should not see a cancel option
    And I should see a label "Cannot cancel past bookings"
