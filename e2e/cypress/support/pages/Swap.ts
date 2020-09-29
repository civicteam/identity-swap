/// <reference types="Cypress" />
import { Page } from "./Page";
import Chainable = Cypress.Chainable;

export type FromOrTo = "from" | "to";
export type Direction = "increased" | "decreased";

export class Swap extends Page {
  balanceCache: Record<string, number>;

  constructor() {
    super("/swap");

    this.balanceCache = {
      from: 0,
      to: 0,
    };
  }

  getTokenSelector(fromOrTo: FromOrTo): Chainable {
    return cy.getByTestId("TOKEN_SELECTOR_" + fromOrTo.toUpperCase());
  }

  openTokenSelector(fromOrTo: FromOrTo): this {
    this.loadingIndicator().should("not.be.visible");
    this.getTokenSelector(fromOrTo).click();
    return this;
  }

  getTokenSelectorElements(fromOrTo: FromOrTo): Chainable {
    return cy.getByTestId(
      "TOKEN_SELECTOR_" + fromOrTo.toUpperCase() + "_ELEMENT"
    );
  }

  getLiquidityIndicator(): Chainable {
    return cy.getByTestId("LIQUIDITY").within(() => cy.get("input"));
  }

  getTokenAmountField(fromOrTo: FromOrTo): Chainable {
    return cy.getByTestId(
      "TOKEN_SELECTOR_" + fromOrTo.toUpperCase() + "_AMOUNT"
    );
  }

  getBalance(fromOrTo: FromOrTo): Chainable {
    return cy
      .getByTestId("TOKEN_SELECTOR_" + fromOrTo.toUpperCase() + "_BALANCE")
      .within(() => cy.get("input"))
      .then((element) => {
        return Number(Cypress.$(element).val());
      });
  }

  execute(): this {
    this.storeBalances();
    this.getAction().click();
    return this;
  }

  storeBalance(fromOrTo: FromOrTo): Chainable {
    return this.getBalance(fromOrTo).as(fromOrTo + "Balance");
  }

  storeBalances() {
    this.storeBalance("from");
    this.storeBalance("to");
  }

  expectBalanceChanged(fromOrTo: FromOrTo, direction: Direction) {
    this.getBalance(fromOrTo).then((balance) => {
      cy.get("@" + fromOrTo + "Balance").then((oldBalance) => {
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

  expectBalanceDifference(fromOrTo: FromOrTo, amount: number) {
    this.getBalance(fromOrTo).then((balance) => {
      cy.get("@" + fromOrTo + "Balance").then((oldBalance) => {
        cy.log(
          `Old Balance: ${oldBalance}, New Balance: ${balance}, Expected Difference: ${amount}`
        );
        expect(balance).to.equal(Number(oldBalance) + amount);
      });
    });
  }
}
