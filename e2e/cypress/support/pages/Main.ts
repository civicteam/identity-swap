import { Page } from "./Page";
import Chainable = Cypress.Chainable;

export class Main extends Page {
  constructor() {
    super("/");
  }

  openWalletSelector(): this {
    cy.getByTestId("WALLET_MENU_DRAWER").click();
    return this;
  }

  getWalletType(walletType: string): Chainable {
    return cy.getByTestId(`WALLET_SELECTION_${walletType.toUpperCase()}`);
  }

  selectWallet(walletType: string): this {
    this.getWalletType(walletType).click();
    return this;
  }

  selectNetwork(network: string): void {
    cy.getByTestId("NETWORK_SELECTOR")
      .get("select")
      .select(network.toLowerCase());
  }

  connectWallet(): this {
    cy.get("body").click();
    cy.getByTestId("WALLET_CONNECTOR").click();
    return this;
  }

  assertActiveWallet(): void {
    cy.getByTestId("WALLET_ACTIVE");
  }
}
