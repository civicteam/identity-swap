import { PublicKey } from "@solana/web3.js";
import { Token } from "./Token";

export class TokenAccount {
  readonly mint: Token;
  readonly address: PublicKey;
  readonly balance: number;

  constructor(mint: Token, address: PublicKey, balance: number) {
    this.mint = mint;
    this.address = address;
    this.balance = balance;
  }

  toString(): string {
    return `Account with token: ${this.mint.toString()}. Address: ${this.address.toBase58()}. Balance: ${
      this.balance
    }`;
  }
}
