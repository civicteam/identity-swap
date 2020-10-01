/// <reference types="Cypress" />
import { Given, When } from "cypress-cucumber-preprocessor/steps";
import { page } from "../../support/pages/Page";
import { PoolPage } from "../../support/pages/PoolPage";
import { Withdraw } from "../../support/pages/Withdraw";

Given("I am on the Withdraw page", () => {
  new Withdraw().visit();
});

When("I click the Withdraw button", () => {
  (page as PoolPage).execute();
});
Given(
  "I have a {word}-{word} pool token account with balance greater than {int}",
  (aToken, bToken, balance) => {
    (page as Withdraw).getPoolTokenAccount(aToken, bToken).then((accounts) => {
      expect(
        accounts.filter(
          (account: Record<string, number>) => account.balance > balance
        )
      ).to.have.length.at.least(1);
    });
  }
);
