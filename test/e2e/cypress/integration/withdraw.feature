Feature: Withdraw

  As a Liquidity Investor
  I can withdraw funds from a liquidity pool
  So that I can recover my profits

  Background: Start on the Withdraw page with pool tokens
    Given I am on the Withdraw page
    And my testnet wallet is connected
    And I have a USDC-CVC pool token account with balance greater than 100

  Scenario: Withdraw
    When I select the from token: USDC
    And I select the to token: CVC
    And I enter 1 into the from field
    And I click the Withdraw button
    Then my USDC wallet is decreased by roughly 1
    And my CVC wallet is decreased

  Scenario: Reverse withdraw
    When I select the from token: CVC
    And I select the to token: USDC
    And I enter 10 into the from field
    And I click the Withdraw button
    Then my CVC wallet is decreased by roughly 10
    And my USDC wallet is decreased

