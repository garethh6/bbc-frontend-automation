Feature: Retrieve Search Results
  Scenario: Validate at least 4 results for "Sport in 2023"
    Given I open the BBC Sport homepage
    When I search for "Sport in 2023"
    Then I should see at least 4 search results
