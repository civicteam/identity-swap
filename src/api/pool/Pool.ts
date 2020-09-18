import { PublicKey } from "@solana/web3.js";
import { Token } from "../token/Token";
import { TokenAccount } from "../token/TokenAccount";

export class Pool {
  readonly address: PublicKey;
  readonly tokenA: TokenAccount;
  readonly tokenB: TokenAccount;
  readonly poolToken: Token;

  private programId: PublicKey;
  private nonce: number;

  constructor(
    address: PublicKey,
    tokenA: TokenAccount,
    tokenB: TokenAccount,
    poolToken: Token,
    programId: PublicKey,
    nonce: number
  ) {
    this.address = address;
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.poolToken = poolToken;
    this.programId = programId;
    this.nonce = nonce;
  }

  getRate(): number {
    return this.tokenA.balance > 0
      ? this.tokenB.balance / this.tokenA.balance
      : 0;
  }

  getLiquidity(): number {
    return this.tokenA.balance;
  }

  toString(): string {
    return `Pool Address: ${this.address.toBase58()}
    Token A: ${this.tokenA.toString()}
    Token B: ${this.tokenB.toString()}
    Pool Token: ${this.poolToken.toString()}
    `;
  }

  tokenSwapAuthority(): Promise<PublicKey> {
    return PublicKey.createProgramAddress(
      [this.address.toBuffer(), Buffer.from([this.nonce])],
      this.programId
    );
  }
}
