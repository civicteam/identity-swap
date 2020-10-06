Feature: i18n

  As a non-English-speaking user
  I can use the app in my own language (if supported)
  So that I can understand the interface

  Background:
    Given my browser language is set to "de"

  Scenario: The app language matches my browser selection
    When I visit the swap page
    Then the UI language matches my browser language

  Scenario: Amounts are shown in my country's locale
    Given I visit the swap page
    And my testnet wallet is connected
    When I select the from token: CVC
    Then I see my balance with a comma decimal separator
