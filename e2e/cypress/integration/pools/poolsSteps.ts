/// <reference types="Cypress" />
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import {
  compareExactWithStored,
  Direction,
  Page,
  page,
} from "../../support/pages/Page";
import { Pools } from "../../support/pages/Pools";
import { Withdraw } from "../../support/pages/Withdraw";
import { PoolPage } from "../../support/pages/PoolPage";

Given("I am on the Pools page", () => {
  new Pools().visit();
});

When("I select withdraw on the first pool", () => {
  (page as Pools).storePoolShare(0);

  (page as Pools)
    .getPoolProperty(0, "WITHDRAW")
    .filter(":visible")
    .click({ multiple: true });
});

When("I execute a withdrawal", () => {
  const withdrawPage = new Withdraw();
  withdrawPage.selectToken("from", "USDC");
  withdrawPage.selectToken("to", "CVC");
  withdrawPage.enterTokenAmount(1, "from");
  withdrawPage.execute();
});

When(
  "I select the {word} token: {word}",
  (side: string, tokenSymbol: string) => {
    const withdrawPage = new Withdraw();
    withdrawPage.selectToken(side, tokenSymbol);
  }
);

When("I return to the pools list", () => {
  (page as Page).selectMenuItem("POOLS");
});

Then("I can see {int} pools", (poolCount) => {
  (page as Pools).getPools().should("have.length", poolCount);
});

Then("I can see a share value for each pool", () => {
  (page as Pools)
    .getPools()
    .each((element, index) =>
      (page as Pools).getPoolShare(index).should("be.greaterThan", 0)
    );
});

Then("my pool token balance has {word}", (direction: Direction) => {
  (page as Pools).expectPoolTokenBalanceChanged(0, direction);
});

Then("my {word} balance is equal to the pool token balance", () => {
  const withdrawPage = new Withdraw();

  withdrawPage
    .getBalance("from")
    .then(compareExactWithStored("PoolTokenBalance0", 0, 0));
});
