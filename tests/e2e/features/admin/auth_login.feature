# language: en
@admin @auth
Feature: Admin authentication

  As an admin user
  I want to log in to the admin portal
  So that I can manage rooms and bookings

  @admin @auth @positive
  Scenario: Admin login success redirects to admin dashboard
    Given I am on the admin login page
    When I submit valid credentials "admin@stayflex.test" and "admin123"
    Then I should be redirected to "/admin/dashboard"
    And I should see an admin welcome message

  @admin @auth @negative
  Scenario: Invalid admin credentials show error
    Given I am on the admin login page
    When I submit invalid credentials "admin@stayflex.test" and "wrongpass"
    Then I should remain on "/admin/login"
    And I should see an authentication error message

  @admin @auth @authorization
  Scenario: Non‑admin accessing admin route while logged in as guest is denied
    Given I am logged in as a guest user
    When I navigate to "/admin/dashboard"
    Then I should see an "Access denied" message
    And I should be redirected to "/admin/login"
