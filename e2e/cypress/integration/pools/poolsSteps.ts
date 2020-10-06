/// <reference types="Cypress" />
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import { Direction, Page, page } from "../../support/pages/Page";
import { Pools } from "../../support/pages/Pools";
import { Withdraw } from "../../support/pages/Withdraw";

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
  const poolPage = new Withdraw();
  poolPage.selectToken("from", "USDC");
  poolPage.selectToken("to", "CVC");
  poolPage.enterTokenAmount(1, "from");
  poolPage.execute();
});

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

Then("my share has {word}", (direction: Direction) => {
  (page as Pools).expectPoolShareChanged(0, direction);
});
