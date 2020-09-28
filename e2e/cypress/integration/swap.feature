Feature: Swap

  As a swapper
  I can swap two tokens
  So that I use one token to purchase another one

  Background: Start on the Swap page
    Given I am on the Swap page
    And My testnet wallet is connected

  Scenario: View swap liquidity
    When I select the from token: CVC
    And I select the to token: USDC
    Then I see a liquidity value

  Scenario: View reverse swap liquidity
    When I select the from token: USDC
    And I select the to token: CVC
    Then I see a liquidity value

  Scenario: View swap To amount
    When I select the from token: CVC
    And I enter 10 into the from field
    And I select the to token: USDC
    Then I see a value in the to field

    @focus
  Scenario: Make swap
    When I select the from token: CVC
    And I select the to token: USDC
    And I enter 10 into the from field
    And I click the Swap button
    Then my CVC wallet is reduced by 10
    And my USDC wallet is increased
