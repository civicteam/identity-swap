import { PublicKey } from "@solana/web3.js";
import { includes } from "ramda";
import BN from "bn.js";
import { Serializable } from "../../utils/types";
import { OnChainEntity } from "../OnChainEntity";
import { SerializableToken, Token } from "./Token";

export type SerializableTokenAccount = {
  mint: SerializableToken;
  address: string;
  balance: number;
};

export class TokenAccount
  extends OnChainEntity
  implements Serializable<SerializableTokenAccount> {
  readonly mint: Token;
  readonly address: PublicKey;
  readonly balance: number;

  constructor(
    mint: Token,
    address: PublicKey,
    balance: number,
    currentSlot?: number
  ) {
    super(currentSlot);

    this.mint = mint;
    this.address = address;
    this.balance = balance;
  }

  matchToken(token: Token): boolean {
    return this.mint.equals(token);
  }

  sameToken(other: TokenAccount): boolean {
    return this.mint.equals(other.mint);
  }

  isAccountFor(tokens: Array<Token>): boolean {
    return includes(this.mint, tokens);
  }

  /**
   * Return the proportion of the total supply of the token
   * that this token account controls, as a number between 0 and 1
   * with 5 decimal places of precision
   */
  proportionOfTotalSupply(): number {
    if (this.mint.supply.eqn(0)) return 0;

    const precision = 5;
    const scaling = new BN(10).pow(new BN(precision));
    return (
      new BN(this.balance).mul(scaling).div(this.mint.supply).toNumber() /
      scaling.toNumber()
    );
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

  equals(other: TokenAccount): boolean {
    return this.address.equals(other.address);
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
