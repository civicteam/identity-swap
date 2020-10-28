Feature: Connecting a wallet

  As a user
  I can connect my wallet
  So that I can sign transactions on the AMM

  Background: Start on the AMM page
    Given I am on the AMM page

  Scenario: See the wallet selection
    Then I see the wallet options:
      | Sollet |
      | Local  |

  Scenario: Connect Local wallet
    When I select "Local" wallet
    And I connect my wallet
    Then my wallet is connected

  Scenario: Select network
    When I select "Local" wallet
    And I select the "testnet" network
    And I connect my wallet
    Then my wallet is connected
