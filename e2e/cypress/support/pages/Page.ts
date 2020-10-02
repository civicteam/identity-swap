/// <reference types="Cypress" />

import Chainable = Cypress.Chainable;
import VisitOptions = Cypress.VisitOptions;

export let page: Page | null = null;

// Generic setter, so the type is not lost from the return value
export const setPage = <T extends Page>(p: T): T => {
  page = p;
  return p;
};

export abstract class Page {
  private readonly path: string;

  protected constructor(path: string) {
    this.path = path;
  }

  protected invokeAction(action: Record<string, unknown>): this {
    cy.window().its("store").invoke("dispatch", action);
    return this;
  }

  initializeWithNetwork(network: string): this {
    return this.invokeAction({
      type: "wallet/selectCluster",
      payload: network,
    });
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

  visit(options?: Partial<VisitOptions>): this {
    cy.visit(this.path, options);

    cy.wrap(this).as("page");
    page = this;

    return this;
  }

  loadingIndicator(): Chainable {
    return cy.getByTestId("LOADING", { timeout: 30000 });
  }

  waitForLoadingComplete(): void {
    this.loadingIndicator().should("not.be.visible");
  }

  expectLoading(): void {
    this.loadingIndicator().should("be.visible");
  }

  getAction(): Chainable {
    return cy.getByTestId("ACTION");
  }
}
