/// <reference types="Cypress" />
import { PoolPage } from "./PoolPage";
import Chainable = Cypress.Chainable;

const findPoolFromTokenPair = (aTokenSymbol: string, bTokenSymbol: string) => (
  state: any
) =>
  state.pool.availablePools.find(
    (pool: any) => pool.poolToken.symbol === `${aTokenSymbol}/${bTokenSymbol}`
  );

const findAccountsWithToken = (token: Record<string, string>) => (state: any) =>
  state.wallet.tokenAccounts.filter(
    (account: any) => account.mint.address == token.address
  );

export class Withdraw extends PoolPage {
  constructor() {
    super("/withdraw");
  }

  getPoolTokenAccount(aTokenSymbol: string, bTokenSymbol: string): Chainable {
    return cy
      .window()
      .its("store")
      .invoke("getState")
      .then((state) => {
        const pool = findPoolFromTokenPair(aTokenSymbol, bTokenSymbol)(state);
        return findAccountsWithToken(pool.poolToken)(state);
      });
  }
}
