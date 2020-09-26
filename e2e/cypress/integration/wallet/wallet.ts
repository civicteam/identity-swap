/// <reference types="Cypress" />
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";

Given("I am on the AMM page", () => {
  cy.visit("/");
});

When("I open the wallet selector", () => {
  cy.getByTestId("WALLET_MENU_DRAWER").click();
});

Then("I see the wallet options:", (walletTable) => {
  const options = walletTable.raw().map((row: Array<string>) => row[0]);
  options.forEach((option: string) => {
    const testId = `WALLET_SELECTION_${option.toUpperCase()}`;
    cy.getByTestId(testId);
  });
});
