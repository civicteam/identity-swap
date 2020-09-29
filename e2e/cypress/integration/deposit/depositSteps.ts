/// <reference types="Cypress" />
import { Given, When } from "cypress-cucumber-preprocessor/steps";
import { Deposit } from "../../support/pages/Deposit";
import { page } from "../../support/pages/Page";
import { PoolPage } from "../../support/pages/PoolPage";

Given("I am on the Deposit page", () => {
  new Deposit().visit();
});

When("I click the Deposit button", () => {
  (page as PoolPage).execute();
});
