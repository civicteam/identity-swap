Feature: Pools

  As a liquidity investor
  I can see which pools I have invested in, and by how much
  So that I can make investment decisions

  Background: Start on the Pools page
    Given I am on the Pools page
    And my testnet wallet is connected

  Scenario: I can see the pools list
    Then I can see 2 pools

  Scenario: I can see my share
    Then I can see a share value for each pool

  Scenario: My balance matches the withdrawal balance
    When I select withdraw on the first pool
    And I select the from token: USDC
    # Note - this is likely to change in the next TokenSwap version
    Then my USDC balance is equal to the pool token balance

  Scenario: My share changes when I make a withdrawal
    When I select withdraw on the first pool
    And I execute a withdrawal
    And I return to the pools list
    Then my pool token balance has reduced
