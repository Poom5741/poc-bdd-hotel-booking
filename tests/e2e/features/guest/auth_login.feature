# language: en
@guest @auth
Feature: Guest authentication

  As a guest user
  I want to be able to log in to the StayFlex portal
  So that I can access my dashboard and make bookings

  @guest @auth @positive
  Scenario: Successful login redirects to dashboard
    Given I am on the login page
    When I submit valid credentials "guest1@stayflex.test" and "password123"
    Then I should be redirected to "/dashboard"
    And I should see a welcome message

  @guest @auth @negative
  Scenario: Invalid credentials show error and stay on login page
    Given I am on the login page
    When I submit invalid credentials "guest1@stayflex.test" and "wrongpassword"
    Then I should remain on "/login"
    And I should see an authentication error message

  @guest @auth @security
  Scenario: Accessing dashboard without authentication redirects to login
    Given I am not authenticated
    When I navigate to "/dashboard"
    Then I should be redirected to "/login"
    And I should see a login prompt
