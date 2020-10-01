Feature: Deposit

  As a Liquidity Investor
  I can deposit funds into a liquidity pool
  So that I can earn interest

  Background: Start on the Deposit page
    Given I am on the Deposit page
    And My testnet wallet is connected

  Scenario: View pool liquidity
    When I select the from token: CVC
    And I select the to token: USDC
    Then I see a liquidity value

  Scenario: View reverse pool liquidity
    When I select the from token: USDC
    And I select the to token: CVC
    Then I see a liquidity value

  Scenario: View pool To amount
    When I select the from token: CVC
    And I enter 10 into the from field
    And I select the to token: USDC
    Then I see a value in the to field

  Scenario: Deposit
    When I select the from token: CVC
    And I select the to token: USDC
    And I enter 100 into the from field
    And I click the Deposit button
    Then my CVC wallet is reduced
    # TODO by 100 (awaiting rounding bug fix)
    And my USDC wallet is reduced

  Scenario: Reverse deposit
    When I select the from token: USDC
    And I select the to token: CVC
    And I enter 1 into the from field
    And I click the Deposit button
    Then my USDC wallet is reduced by 1
    And my CVC wallet is reduced
