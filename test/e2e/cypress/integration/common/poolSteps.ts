/// <reference types="Cypress" />
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import { PoolPage } from "../../support/pages/PoolPage";
import { Direction, page } from "../../support/pages/Page";

type AOrB = "A" | "B";
type Precision = "roughly" | "exactly";

const DEFAULT_TOLERANCE = 0.02;

Given("my testnet wallet is connected", () => {
  (page as PoolPage)
    .initializeWithNetwork("testnet")
    .selectWallet("Local")
    .connectWallet()
    .waitForLoadingComplete();
});

When(
  "I select the {word} token: {word}",
  (side: string, tokenSymbol: string) => {
    (page as PoolPage).selectToken(side, tokenSymbol);
  }
);

When("I enter {int} into the {word} field", (amount: number, side: string) => {
  (page as PoolPage).enterTokenAmount(amount, side);
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
  "my {word} wallet is {word} by {word} {int}",
  (
    token: string,
    direction: Direction,
    precision: Precision,
    amount: number
  ) => {
    const difference = direction === "increased" ? amount : -amount;
    const tolerance = precision === "exactly" ? 0 : DEFAULT_TOLERANCE;

    (page as PoolPage).expectBalanceDifference("from", difference, tolerance);
  }
);

Then("I see no rate", (): void => {
  (page as PoolPage).expectNoRate();
});

Then("I see a rate", (): void => {
  (page as PoolPage).expectRateExists().storeRate();
});

Then("I see a fee", (): void => {
  (page as PoolPage).expectFeeExists().storeFee();
});

Then("the rate is {word}", (direction: Direction) => {
  (page as PoolPage).expectRateChanged(direction);
});
