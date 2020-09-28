Feature: Swap

  As a swapper
  I can swap two tokens
  So that I use one token to purchase another one

  Background: Start on the Swap page
    Given My testnet wallet is connected
    And I am on the Swap page

  Scenario: View swap liquidity
    When I select the from token: USDC
    And I select the to token: CVC
    Then I see a liquidity value
