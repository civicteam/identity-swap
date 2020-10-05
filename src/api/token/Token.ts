import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Serializable } from "../../utils/types";
import { minorAmountToMajor } from "../../utils/amount";

export type SerializableToken = {
  address: string;
  decimals: number;
  supply: string;
  mintAuthority?: string;
  name?: string;
  symbol?: string;
};

export class Token implements Serializable<SerializableToken> {
  readonly address: PublicKey;
  readonly decimals: number;
  readonly supply: BN;
  readonly mintAuthority?: PublicKey;
  readonly name?: string;
  readonly symbol?: string;

  constructor(
    address: PublicKey,
    decimals: number,
    supply: BN,
    mintAuthority?: PublicKey,
    name?: string,
    symbol?: string
  ) {
    this.address = address;
    this.decimals = decimals;
    this.supply = supply;
    this.mintAuthority = mintAuthority;
    this.name = name;
    this.symbol = symbol;
  }

  toMajorDenomination(amountInMinorDenomination: number): string {
    return minorAmountToMajor(amountInMinorDenomination, this);
  }

  toString(): string {
    return this.name
      ? `${this.name} (${this.symbol})`
      : this.address.toBase58();
  }

  equals(other: Token): boolean {
    return this.address.equals(other.address);
  }

  serialize(): SerializableToken {
    return {
      address: this.address.toBase58(),
      decimals: this.decimals,
      supply: this.supply.toString(10),
      mintAuthority: this.mintAuthority?.toBase58(),
      name: this.name,
      symbol: this.symbol,
    };
  }

  static from(serializableToken: SerializableToken): Token {
    const mintAuthority = (serializableToken.mintAuthority &&
      new PublicKey(serializableToken.mintAuthority)) as PublicKey | undefined;
    return new Token(
      new PublicKey(serializableToken.address),
      serializableToken.decimals,
      new BN(serializableToken.supply, 10),
      mintAuthority,
      serializableToken.name,
      serializableToken.symbol
    );
  }
}
