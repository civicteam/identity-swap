/// <reference types="Cypress" />
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { Main } from "../../support/pages/Main";

let page: Main;

Given("I am on the AMM page", () => {
  page = new Main().visit();
});

When("I open the wallet selector", () => {
  page.openWalletSelector();
});

When("I select {string} wallet", (walletType) => {
  page.selectWallet(walletType);
});

When("I connect my wallet", () => {
  page.connectWallet();
});

Then("I see the wallet options:", (walletTable) => {
  const options = walletTable.raw().map((row: Array<string>) => row[0]);
  options.forEach((option: string) => {
    page.getWalletType(option);
  });
});

Then("my wallet is connected", () => {
  page.assertActiveWallet();
});
When("I select the {string} network", (network) => {
  page.selectNetwork(network);
});
