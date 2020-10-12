/// <reference types="Cypress" />
import { Given, When } from "cypress-cucumber-preprocessor/steps";
import { Swap } from "../../support/pages/Swap";
import { page } from "../../support/pages/Page";
import { PoolPage } from "../../support/pages/PoolPage";

Given("I am on the Swap page", () => {
  new Swap().visit();
});

When("I click the Swap button", () => {
  (page as PoolPage).execute();
});
