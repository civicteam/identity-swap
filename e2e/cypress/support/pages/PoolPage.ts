/// <reference types="Cypress" />
import { Page } from "./Page";
import Chainable = Cypress.Chainable;
import { isEmpty } from "ramda";

export type Direction = "increased" | "decreased";

// Given a property stored into Cypress with .as()
// Retrieve this value, and compare it to the new value
const compareWithStored = (property: string, direction: Direction) => (
  newValue: number
) => {
  cy.get("@" + property).then((oldValue) => {
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
const compareExactWithStored = (
  property: string,
  amount: number,
  tolerance: number
) => (newValue: number) => {
  cy.get("@" + property).then((oldValue) => {
    cy.log(
      `Old ${property}: ${oldValue}, New ${property}: ${newValue}, Expected Change: ${amount}`
    );

    const expectedValue = Number(oldValue) + amount;

    const expectedMinValue = expectedValue - expectedValue * (tolerance / 2);
    const expectedMaxValue = expectedValue + expectedValue * (tolerance / 2);

    expect(newValue).to.be.gte(expectedMinValue).and.lte(expectedMaxValue);
  });
};

export abstract class PoolPage extends Page {
  balanceCache: Record<string, number>;

  protected constructor(path: string) {
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

  storeRate(): Chainable {
    return this.getRate().as("rate");
  }

  storeBalances() {
    this.storeBalance("from");
    this.storeBalance("to");
  }

  expectBalanceChanged(side: string, direction: Direction) {
    this.getBalance(side).then(compareWithStored(side + "Balance", direction));
  }

  expectBalanceDifference(side: string, amount: number, tolerance: number) {
    this.getBalance(side).then(
      compareExactWithStored(side + "Balance", amount, tolerance)
    );
  }

  getRate(): Chainable {
    return cy
      .getByTestId("RATE")
      .within(() => cy.get("input"))
      .then((element) => {
        const elementValue = Cypress.$(element).val();
        console.log("Element value : '" + elementValue + "'");
        return isEmpty(elementValue) ? null : Number(elementValue);
      });
  }

  expectNoRate(): this {
    this.getRate().then((value) => {
      expect(value).to.equal(null);
    });
    return this;
  }

  expectRateExists(): this {
    this.getRate().then((value) => {
      expect(value).to.be.greaterThan(0);
    });
    return this;
  }

  expectRateChanged(direction: Direction) {
    this.getRate().then(compareWithStored("rate", direction));
  }
}
