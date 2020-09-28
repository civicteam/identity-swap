/// <reference types="Cypress" />
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { Direction, FromOrTo, Swap } from "../../support/pages/Swap";

let page: Swap;

Given("I am on the Swap page", () => {
  page = new Swap().visit();
});

Given("My testnet wallet is connected", () => {
  page
    .initializeWithNetwork("testnet")
    .openWalletSelector()
    .selectWallet("Local")
    .connectWallet();
});

When(
  "I select the {word} token: {word}",
  (fromOrTo: FromOrTo, tokenSymbol: string) => {
    page
      .openTokenSelector(fromOrTo)
      .getTokenSelectorElements(fromOrTo)
      .getByAttribute("data-value", tokenSymbol)
      .first()
      .click();
  }
);

When(
  "I enter {int} into the {word} field",
  (amount: number, fromOrTo: FromOrTo) => {
    page.getTokenAmountField(fromOrTo).type("" + amount);
  }
);

When("I click the Swap button", () => {
  page.execute();
});

Then("I see a liquidity value", () => {
  page
    .getLiquidityIndicator()
    .should("have.attr", "value")
    .and("match", /\d+\.?\d*/);
});

Then("I see a value in the {word} field", (fromOrTo: FromOrTo) => {
  page
    .getTokenAmountField(fromOrTo)
    .should("have.attr", "value")
    .and("match", /\d+\.?\d*/);
});

Then("my {word} wallet is {word}", (token: string, direction: Direction) => {
  page.expectBalanceChanged("to", direction);
});

Then(
  "my {word} wallet is {word} by {int}",
  (token: string, direction: Direction, amount: number) => {
    const difference = direction === "increased" ? amount : -amount;
    page.expectBalanceDifference("from", difference);
  }
);
