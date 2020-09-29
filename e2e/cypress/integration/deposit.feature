@ignore
Feature: Deposit

  As a Liquidity Investor
  I can deposit funds into a liquidity pool
  So that I can earn interest

  Background: Start on the Deposit page
    Given I am on the Deposit page
    And My testnet wallet is connected

  Scenario: View pool liquidity
    When I select the A token: CVC
    And I select the B token: USDC
    Then I see a liquidity value

  Scenario: View reverse pool liquidity
    When I select the A token: USDC
    And I select the B token: CVC
    Then I see a liquidity value

  Scenario: View pool To amount
    When I select the A token: CVC
    And I enter 10 into the A field
    And I select the B token: USDC
    Then I see a value in the to field

  Scenario: Deposit
    When I select the A token: CVC
    And I select the B token: USDC
    And I enter 10 into the A field
    And I click the Deposit button
    Then my CVC wallet is reduced by 10
    And my USDC wallet is reduced

  Scenario: Reverse deposit
    When I select the A token: USDC
    And I select the B token: CVC
    And I enter 1 into the A field
    And I click the Deposit button
    Then my USDC wallet is reduced by 1
    And my USDC wallet is reduced
