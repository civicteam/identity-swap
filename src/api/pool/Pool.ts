import { PublicKey } from "@solana/web3.js";

export class Token {
  readonly address: PublicKey;
  readonly decimals: number;

  constructor(address: PublicKey, decimals: number) {
    this.address = address;
    this.decimals = decimals;
  }
}

export class TokenAccount {
  readonly mint: Token;
  readonly address: PublicKey;
  readonly balance: number;

  constructor(mint: Token, address: PublicKey, balance: number) {
    this.mint = mint;
    this.address = address;
    this.balance = balance;
  }
}

export class Pool {
  readonly address: PublicKey;
  readonly tokenA: TokenAccount;
  readonly tokenB: TokenAccount;
  readonly poolToken: Token;

  constructor(
    address: PublicKey,
    tokenA: TokenAccount,
    tokenB: TokenAccount,
    poolToken: Token
  ) {
    this.address = address;
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.poolToken = poolToken;
  }

  getRate(): number {
    return this.tokenA.balance > 0
      ? this.tokenB.balance / this.tokenA.balance
      : 0;
  }

  getLiquidity(): number {
    return this.tokenA.balance;
  }
}
