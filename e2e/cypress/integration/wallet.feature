Feature: Connecting a wallet$

  As a user
  I can connect my wallet
  So that I can sign transactions on the AMM

  Scenario: See the wallet selection
  Given I am on the AMM page
  When I open the wallet selector
  Then I see the wallet options:
    | Sollet |
    | Local  |
