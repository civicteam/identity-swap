/// <reference types="Cypress" />
import { Swap } from "../../support/pages/Swap";
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import AUTWindow = Cypress.AUTWindow;
import { page } from "../../support/pages/Page";
import { PoolPage } from "../../support/pages/PoolPage";

type DevWindow = AUTWindow & {
  userLanguage: string;
};

let currentLanguage: string;

Given("my browser language is set to {string}", (language) => {
  currentLanguage = language;
});

When("I visit the swap page", () => {
  new Swap().visit({
    onBeforeLoad: (_contentWindow: DevWindow) => {
      // define a special property here, as the browser does not allow the setting of navigator.languages
      _contentWindow.userLanguage = currentLanguage;
    },
  });
});

Then("the UI language matches my browser language", () => {
  cy.getByTestId("PAGE_TITLE").should("have.text", "Umtauschen");
});

Then("I see my balance with a comma decimal separator", () => {
  (page as PoolPage).getBalanceString("from").should("contain", ",");
});
