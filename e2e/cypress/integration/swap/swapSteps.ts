/// <reference types="Cypress" />
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { Main } from "../../support/pages/Main";
import { FromOrTo, Swap } from "../../support/pages/Swap";

let page: Swap;

Given("My testnet wallet is connected", () => {
  const mainPage = new Main().visit().initializeWithNetwork("testnet");
  mainPage.openWalletSelector().selectWallet("Local").connectWallet();
});

Given("I am on the Swap page", () => {
  page = new Swap().visit();
});

When(
  "I select the {word} token: {word}",
  (fromOrTo: FromOrTo, tokenSymbol: string) => {
    page.getTokenSelector(fromOrTo).select(tokenSymbol);
  }
);
