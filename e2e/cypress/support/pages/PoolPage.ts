/// <reference types="Cypress" />
import { Page } from "./Page";
import Chainable = Cypress.Chainable;

export type Direction = "increased" | "decreased";

export abstract class PoolPage extends Page {
  balanceCache: Record<string, number>;

  constructor(path: string) {
    super(path);

    this.balanceCache = {
      from: 0,
      to: 0,
    };
  }

  getTokenSelector(side: string): Chainable {
    return cy.getByTestId("TOKEN_SELECTOR_" + side.toUpperCase());
  }

  openTokenSelector(side: string): this {
    this.waitForLoadingComplete();
    this.getTokenSelector(side).click();
    return this;
  }

  getTokenSelectorElements(side: string): Chainable {
    return cy.getByTestId("TOKEN_SELECTOR_" + side.toUpperCase() + "_ELEMENT");
  }

  getLiquidityIndicator(): Chainable {
    return cy.getByTestId("LIQUIDITY").within(() => cy.get("input"));
  }

  getTokenAmountField(side: string): Chainable {
    return cy
      .getByTestId("TOKEN_SELECTOR_" + side.toUpperCase() + "_AMOUNT")
      .within(() => cy.get("input"));
  }

  getBalance(side: string): Chainable {
    return cy
      .getByTestId("TOKEN_SELECTOR_" + side.toUpperCase() + "_BALANCE")
      .within(() => cy.get("input"))
      .then((element) => {
        return Number(Cypress.$(element).val());
      });
  }

  execute(): this {
    this.storeBalances();
    this.getAction().click();
    this.expectLoading();
    this.waitForLoadingComplete();
    return this;
  }

  storeBalance(side: string): Chainable {
    return this.getBalance(side).as(side + "Balance");
  }

  storeBalances() {
    this.storeBalance("from");
    this.storeBalance("to");
  }

  expectBalanceChanged(side: string, direction: Direction) {
    this.getBalance(side).then((balance) => {
      cy.get("@" + side + "Balance").then((oldBalance) => {
        cy.log(
          `Old Balance: ${oldBalance}, New Balance: ${balance}, Expected Change: ${direction}`
        );

        if (direction === "increased") {
          expect(balance).to.be.greaterThan(Number(oldBalance));
        } else {
          expect(balance).to.be.lessThan(Number(oldBalance));
        }
      });
    });
  }

  expectBalanceDifference(side: string, amount: number) {
    this.getBalance(side).then((balance) => {
      cy.get("@" + side + "Balance").then((oldBalance) => {
        cy.log(
          `Old Balance: ${oldBalance}, New Balance: ${balance}, Expected Difference: ${amount}`
        );
        expect(balance).to.equal(Number(oldBalance) + amount);
      });
    });
  }
}
