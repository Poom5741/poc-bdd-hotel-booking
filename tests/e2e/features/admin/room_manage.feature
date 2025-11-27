# language: en
@admin @room_manage
Feature: Admin room management

  As an admin user
  I want to manage room types and availability
  So that the inventory reflects the hotel’s current state

  @admin @room_manage @create
  Scenario: Create a new room type
    Given I am on the admin room management page
    When I create a new room type with name "Standard", capacity 2 and base price "$120"
    Then the new room type should appear in the room list
    And its details should be saved correctly

  @admin @room_manage @out_of_order
  Scenario: Mark a room OUT_OF_ORDER and it should not appear in guest search
    Given I have a room "101" of type "Standard"
    And I am on the admin room management page
    When I mark room "101" as OUT_OF_ORDER
    Then the room should be flagged as out of order
    And when a guest searches for rooms, room "101" should not be listed

  @admin @room_manage @delete_future_booking
  Scenario: Attempt to delete room with future bookings results in error
    Given room "102" has a future booking from "2025-12-01" to "2025-12-05"
    And I am on the admin room management page
    When I attempt to delete room "102"
    Then I should see an error room message "Cannot delete room with future bookings"
    And the room should remain in the system
