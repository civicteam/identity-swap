/// <reference types="Cypress" />

import Chainable = Cypress.Chainable;
import VisitOptions = Cypress.VisitOptions;

export let page: Page | null = null;

// Generic setter, so the type is not lost from the return value
export const setPage = <T extends Page>(p: T): T => {
  page = p;
  return p;
};

export type MenuItem = "POOLS" | "DEPOSIT" | "SWAP" | "WITHDRAW";

export type Direction = "increased" | "decreased";

// Given a property stored into Cypress with .as()
// Retrieve this value, and compare it to the new value
export const compareWithStored = (property: string, direction: Direction) => (
  newValue: number
) => {
  // @ts-ignore
  cy.get("@" + property).pipe((oldValue) => {
    cy.log(
      `Old ${property}: ${oldValue}, New ${property}: ${newValue}, Expected Change: ${direction}`
    );

    if (direction === "increased") {
      expect(newValue).to.be.greaterThan(Number(oldValue));
    } else {
      expect(newValue).to.be.lessThan(Number(oldValue));
    }
  });
};

// Given a property stored into Cypress with .as()
// Retrieve this value, and compare it to the new value
// It may differ by a tolerance value from the expected value
export const compareExactWithStored = (
  property: string,
  amount: number,
  tolerance: number
) => (newValue: number) => {
  // @ts-ignore
  cy.get("@" + property).pipe((oldValue) => {
    cy.log(
      `Old ${property}: ${oldValue}, New ${property}: ${newValue}, Expected Change: ${amount}`
    );

    const expectedValue = Number(oldValue) + amount;

    const expectedMinValue = expectedValue - expectedValue * (tolerance / 2);
    const expectedMaxValue = expectedValue + expectedValue * (tolerance / 2);

    expect(newValue).to.be.gte(expectedMinValue).and.lte(expectedMaxValue);
  });
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
    // filter on visible here as there may be several components that allow you
    // to select the wallet (e.g. a hidden drawer that is shown on mobile devices)
    this.getWalletType(walletType).filter(":visible").click();
    return this;
  }

  selectNetwork(network: string): void {
    // filter on visible here as there may be several components that allow you
    // to select the wallet (e.g. a hidden drawer that is shown on mobile devices)
    cy.getByTestId("NETWORK_SELECTOR")
      .get("select")
      .filter(":visible")
      .select(network.toLowerCase());
  }

  connectWallet(): this {
    cy.get("body").click();
    // filter on visible here as there may be several components that allow you
    // to select the wallet (e.g. a hidden drawer that is shown on mobile devices)
    cy.getByTestId("WALLET_CONNECTOR").filter(":visible").click();
    this.expectLoading();
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

  selectMenuItem(menuItem: MenuItem): Chainable {
    return cy
      .getByTestId(menuItem + "_MENU_ITEM")
      .filter(":visible")
      .click();
  }
}
