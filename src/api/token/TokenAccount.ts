import { PublicKey } from "@solana/web3.js";
import { includes } from "ramda";
import { Serializable } from "../../utils/types";
import { SerializableToken, Token } from "./Token";

export type SerializableTokenAccount = {
  mint: SerializableToken;
  address: string;
  balance: number;
};

export class TokenAccount implements Serializable<SerializableTokenAccount> {
  readonly mint: Token;
  readonly address: PublicKey;
  readonly balance: number;

  constructor(mint: Token, address: PublicKey, balance: number) {
    this.mint = mint;
    this.address = address;
    this.balance = balance;
  }

  sameToken(other: TokenAccount): boolean {
    return this.mint.equals(other.mint);
  }

  isAccountFor(tokens: Array<Token>): boolean {
    return includes(this.mint, tokens);
  }

  toString(): string {
    return `Account with token: ${this.mint.toString()}. Address: ${this.address.toBase58()}. Balance: ${
      this.balance
    }`;
  }

  serialize(): SerializableTokenAccount {
    return {
      mint: this.mint.serialize(),
      address: this.address.toBase58(),
      balance: this.balance,
    };
  }

  static from(
    serializableTokenAccount: SerializableTokenAccount
  ): TokenAccount {
    return new TokenAccount(
      Token.from(serializableTokenAccount.mint),
      new PublicKey(serializableTokenAccount.address),
      serializableTokenAccount.balance
    );
  }
}
