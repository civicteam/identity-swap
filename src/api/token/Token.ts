import { PublicKey } from "@solana/web3.js";
import { Serializable } from "../../utils/types";

export type SerializableToken = {
  address: string;
  decimals: number;
  mintAuthority?: string;
  name?: string;
  symbol?: string;
};

export class Token implements Serializable<SerializableToken> {
  readonly address: PublicKey;
  readonly decimals: number;
  readonly mintAuthority?: PublicKey;
  readonly name?: string;
  readonly symbol?: string;

  constructor(
    address: PublicKey,
    decimals: number,
    mintAuthority?: PublicKey,
    name?: string,
    symbol?: string
  ) {
    this.address = address;
    this.decimals = decimals;
    this.mintAuthority = mintAuthority;
    this.name = name;
    this.symbol = symbol;
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
      mintAuthority,
      serializableToken.name,
      serializableToken.symbol
    );
  }
}
