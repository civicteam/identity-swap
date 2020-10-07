/// <reference types="Cypress" />

import { compareWithStored, Direction, page, Page } from "./Page";
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

  getPoolTokenBalance(index: number): Chainable {
    return this.getPoolProperty(index, "USER_BALANCE")
      .invoke("attr", "data-value")
      .then<number>((value) => Number(value));
  }

  storePoolShare(index: number): Chainable {
    this.getPoolShare(index).as("Share" + index);

    return this.getPoolTokenBalance(index).as("PoolTokenBalance" + index);
  }

  expectPoolTokenBalanceChanged(index: number, direction: Direction) {
    this.getPoolTokenBalance(index).then(
      compareWithStored("PoolTokenBalance" + index, direction)
    );
  }
}
