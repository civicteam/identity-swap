/// <reference types="Cypress" />
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import { Direction, PoolPage } from "../../support/pages/PoolPage";
import { page } from "../../support/pages/Page";

type AOrB = "A" | "B";

Given("My testnet wallet is connected", () => {
  (page as PoolPage)
    .initializeWithNetwork("testnet")
    .openWalletSelector()
    .selectWallet("Local")
    .connectWallet();
});

When(
  "I select the {word} token: {word}",
  (side: string, tokenSymbol: string) => {
    (page as PoolPage)
      .openTokenSelector(side)
      .getTokenSelectorElements(side)
      .getByAttribute("data-value", tokenSymbol)
      .first()
      .click();
  }
);

When("I enter {int} into the {word} field", (amount: number, side: string) => {
  (page as PoolPage)
    .getTokenAmountField(side)
    .clear()
    .type("" + amount);
});

Then("I see a liquidity value", () => {
  (page as PoolPage)
    .getLiquidityIndicator()
    .should("have.attr", "value")
    .and("match", /\d+\.?\d*/);
});

Then("I see a value in the {word} field", (aOrB: AOrB) => {
  (page as PoolPage)
    .getTokenAmountField(aOrB)
    .should("have.attr", "value")
    .and("match", /\d+\.?\d*/);
});

Then("my {word} wallet is {word}", (token: string, direction: Direction) => {
  (page as PoolPage).expectBalanceChanged("to", direction);
});

Then(
  "my {word} wallet is {word} by {int}",
  (token: string, direction: Direction, amount: number) => {
    const difference = direction === "increased" ? amount : -amount;
    (page as PoolPage).expectBalanceDifference("from", difference);
  }
);

Then("I see no rate", (): void => {
  (page as PoolPage).expectNoRate();
});

Then("I see a rate", (): void => {
  (page as PoolPage).expectRateExists().storeRate();
});

Then("the rate is {word}", (direction: Direction) => {
  (page as PoolPage).expectRateChanged(direction);
});
