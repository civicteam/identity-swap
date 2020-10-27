/// <reference types="Cypress" />
import {
  compareExactWithStored,
  compareWithStored,
  Direction,
  page,
  Page,
} from "./Page";
import Chainable = Cypress.Chainable;
import { isEmpty } from "ramda";

export abstract class PoolPage extends Page {
  balanceCache: Record<string, number>;

  protected constructor(path: string) {
    super(path);

    this.balanceCache = {
      from: 0,
      to: 0,
    };
  }

  selectToken(side: string, tokenSymbol: string): Chainable {
    return this.openTokenSelector(side)
      .getTokenSelectorElement(side, tokenSymbol)
      .first()
      .click();
  }

  enterTokenAmount(amount: number, side: string): Chainable {
    return (
      this.getTokenAmountField(side)
        .click()
        // This is a workaround for a known issue in Cypress
        // https://stackoverflow.com/questions/57378083/cy-clear-not-clearing-input-field-properly-cypress
        // however it may be indicative of an accessibility issue, so should be investigated
        .invoke("val", "")
        .clear({ force: true })
        .type("" + amount)
    );
  }

  getTokenSelector(side: string): Chainable {
    return cy.getByTestId("TOKEN_SELECTOR_" + side.toUpperCase());
  }

  openTokenSelector(side: string): this {
    this.getTokenSelector(side).click();
    return this;
  }

  getTokenSelectorElement(side: string, symbol: string): Chainable {
    return cy.getByTestId(
      `TOKEN_SELECTOR_${side.toUpperCase()}_ELEMENT_${symbol}`
    );
  }

  getLiquidityIndicator(): Chainable {
    return cy.getByTestId("LIQUIDITY").within(() => cy.get("input"));
  }

  getTokenAmountField(side: string): Chainable {
    return cy
      .getByTestId("TOKEN_SELECTOR_" + side.toUpperCase() + "_AMOUNT")
      .within(() => cy.get("input"));
  }

  getBalanceString(side: string): Chainable {
    return cy
      .getByTestId("TOKEN_SELECTOR_" + side.toUpperCase() + "_BALANCE")
      .within(() => cy.get("input"))
      .then((element) => Cypress.$(element).val());
  }

  getBalance(side: string): Chainable {
    return this.getBalanceString(side).then((balanceString) =>
      Number(balanceString.replace(/,/g, ""))
    );
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

  storeFee(): Chainable {
    return this.getFee().as("fee");
  }

  storeBalances() {
    this.storeBalance("from");
    this.storeBalance("to");
  }

  expectBalanceChanged(side: string, direction: Direction) {
    // @ts-ignore
    this.getBalance(side).pipe(compareWithStored(side + "Balance", direction));
  }

  expectBalanceDifference(side: string, amount: number, tolerance: number) {
    // @ts-ignore
    this.getBalance(side).pipe(
      compareExactWithStored(side + "Balance", amount, tolerance)
    );
  }

  private getNumberValue(field: string): Chainable {
    return cy
      .getByTestId(field)
      .within(() => cy.get("input"))
      .then((element) => {
        const elementValue = Cypress.$(element).val();
        console.log("Element value : '" + elementValue + "'");
        return isEmpty(elementValue) ? null : Number(elementValue);
      });
  }

  getRate(): Chainable {
    return this.getNumberValue("RATE");
  }

  getFee(): Chainable {
    return this.getNumberValue("FEE");
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

  expectFeeExists(): this {
    this.getFee().then((value) => {
      expect(value).to.be.greaterThan(0);
    });
    return this;
  }

  expectRateChanged(direction: Direction) {
    this.getRate().then(compareWithStored("rate", direction));
  }
}
