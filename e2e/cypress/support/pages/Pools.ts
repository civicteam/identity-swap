/// <reference types="Cypress" />

import { compareWithStored, Direction, Page } from "./Page";
import Chainable = Cypress.Chainable;

export type PoolProperty =
  | "SYMBOL"
  | "LIQUIDITY_A"
  | "LIQUIDITY_B"
  | "USER_BALANCE"
  | "USER_SHARE"
  | "DEPOSIT"
  | "WITHDRAW"
  | "SWAP";

export class Pools extends Page {
  constructor() {
    super("/pools");
  }

  getPools(): Chainable {
    return cy.getByTestId("POOL");
  }

  getPoolProperty(index: number, property: PoolProperty): Chainable {
    return this.getPools()
      .eq(index)
      .within((pool) => cy.getByTestId(property));
  }

  getPoolShare(index: number): Chainable {
    return this.getPoolProperty(index, "USER_SHARE")
      .invoke("text")
      .then<number>((value) => {
        const valueString = value.match(/\d+\.?\d*/)[0];
        return Number(valueString);
      });
  }

  storePoolShare(index: number): Chainable {
    return this.getPoolShare(index).as("Share" + index);
  }

  expectPoolShareChanged(index: number, direction: Direction) {
    this.getPoolShare(index).then(
      compareWithStored("Share" + index, direction)
    );
  }
}
