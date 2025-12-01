# language: en
@guest @booking @create
Feature: Guest booking creation

  As a guest user
  I want to create a booking from search results
  So that I can reserve a room for my stay

  @guest @booking @create @positive
  Scenario: Create booking from search results
    Given I am on the room search page
    When I search for rooms from "2025-12-01" to "2025-12-05"
    And I select a room card
    And I choose "2" guests
    And I submit the booking
    Then I should see a booking confirmation page
    And the booking summary should display the selected dates and number of guests

  @guest @booking @create @negative
  Scenario: Cannot book overlapping dates for the same room
    Given I have an existing booking for room "Deluxe Suite" from "2025-12-01" to "2025-12-05"
    And I am on the room search page
    When I search for rooms from "2025-12-03" to "2025-12-07"
    And I attempt to book "Deluxe Suite"
    Then I should see an error message "Room is not available for the selected dates"

  @guest @booking @create @price
  Scenario: Booking summary shows correct price
    Given I am on the room search page
    When I search for rooms from "2025-12-10" to "2025-12-12"
    And I select a room card
    And I choose "1" guest
    And I submit the booking
    Then the booking summary should show a total price
