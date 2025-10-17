Feature: Validate Las Vegas Grand Prix Results
  Scenario: Verify top 3 finishers in the 2023 Las Vegas Grand Prix
    Given I open the BBC Sport Formula 1 page
    When I navigate to the Las Vegas Grand Prix results
    Then the results table should contain the following top 3 finishers:
      | position | driver           |
      | 1        | Max Verstappen   |
      | 2        | George Russell   |
      | 3        | Sergio Perez     |
