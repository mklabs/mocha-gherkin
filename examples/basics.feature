# features/myFeature.feature

Feature: Example feature
  As a user of cucumber.js
  I want to have documentation on cucumber
  So that I can concentrate on building awesome applications

  Scenario: Reading the tests
    Given I am in the test directory
    When I read the index.js file
    Then I should see "new Parser" somewhere

