# language: en
@guest @room_search
Feature: Guest room search

  As a guest user
  I want to search for available rooms
  So that I can book a stay that fits my dates and preferences

  @guest @room_search @positive
  Scenario: Search with available rooms shows room cards
    Given I am on the room search page
    When I search for rooms from "2025-12-01" to "2025-12-05"
    Then I should see a list of room cards
    And each card should display room details

  @guest @room_search @negative
  Scenario: Search with no matching rooms shows no results message
    Given I am on the room search page
    When I search for rooms from "2030-01-01" to "2030-01-05"
    Then I should see a message "No rooms available"

  @guest @room_search @validation
  Scenario: Invalid date range shows validation error
    Given I am on the room search page
    When I enter a check‑in date "2025-12-10" and a check‑out date "2025-12-05"
    And I submit the search
    Then I should see a validation error message about the date range
