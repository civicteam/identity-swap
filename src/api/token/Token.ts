import { PublicKey } from "@solana/web3.js";

export class Token {
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
}
