import assert from "assert";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { SerializableToken, Token } from "../token/Token";
import { SerializableTokenAccount, TokenAccount } from "../token/TokenAccount";
import { Serializable } from "../../utils/types";

export type SerializablePool = {
  address: string;
  tokenA: SerializableTokenAccount;
  tokenB: SerializableTokenAccount;
  poolToken: SerializableToken;

  programId: string;
  nonce: number;
  feeRatio: number;
};

export class Pool implements Serializable<SerializablePool> {
  readonly address: PublicKey;
  readonly tokenA: TokenAccount;
  readonly tokenB: TokenAccount;
  readonly poolToken: Token;
  readonly feeRatio: number;

  private programId: PublicKey;
  private nonce: number;

  constructor(
    address: PublicKey,
    tokenA: TokenAccount,
    tokenB: TokenAccount,
    poolToken: Token,
    programId: PublicKey,
    nonce: number,
    feeRatio: number
  ) {
    this.address = address;
    this.tokenA = tokenA;
    this.tokenB = tokenB;
    this.poolToken = poolToken;
    this.programId = programId;
    this.nonce = nonce;
    this.feeRatio = feeRatio;
  }

  simpleRate(): number {
    return this.tokenA.balance > 0
      ? this.tokenB.balance / this.tokenA.balance
      : 0;
  }

  getLiquidity(): number {
    return this.tokenA.balance;
  }

  /**
   * Calculate the associated amount in the other token, for an input token amount.
   * Note, this does not yet take into account slippage, which is not supported by the swap program.
   * It also assumes the swap program uses the Constant Product Function with no smoothing,
   * and that the fees are paid by the recipient, i.e. they are subtracted from the destination amount
   * @param inputToken
   * @param inputAmount
   * @param includeFees
   */
  calculateAmountInOtherToken = (
    inputToken: Token,
    inputAmount: number,
    includeFees: boolean
  ): number => {
    assert(
      inputToken.equals(this.tokenA.mint) ||
        inputToken.equals(this.tokenB.mint),
      "Input token must be either pool token A or B"
    );
    const isReverse = this.tokenB.mint.equals(inputToken);
    const [firstAmountInPool, secondAmountInPool] = isReverse
      ? [this.tokenB.balance, this.tokenA.balance]
      : [this.tokenA.balance, this.tokenB.balance];
    const invariant = new BN(firstAmountInPool).mul(new BN(secondAmountInPool));
    const newFromAmountInPool = new BN(firstAmountInPool).add(
      new BN(inputAmount)
    );

    const newToAmountInPool = invariant.div(newFromAmountInPool);
    // TODO double-check with Solana that ceil() is the right thing to do here
    const grossToAmount = new BN(secondAmountInPool).sub(newToAmountInPool);
    const fees = includeFees
      ? Math.floor(grossToAmount.toNumber() * this.feeRatio)
      : 0;

    return grossToAmount.sub(new BN(fees)).toNumber();
  };

  calculateTokenAAmount = (
    tokenBAmount: number,
    includeFees: boolean
  ): number =>
    this.calculateAmountInOtherToken(
      this.tokenB.mint,
      tokenBAmount,
      includeFees
    );
  calculateTokenBAmount = (
    tokenAAmount: number,
    includeFees: boolean
  ): number =>
    this.calculateAmountInOtherToken(
      this.tokenA.mint,
      tokenAAmount,
      includeFees
    );

  impliedRate(inputToken: Token, inputAmount: number): number {
    const swappedAmount = this.calculateAmountInOtherToken(
      inputToken,
      inputAmount,
      false
    );

    return inputAmount > 0 ? swappedAmount / inputAmount : 0;
  }

  impliedFee(inputToken: Token, inputAmount: number): number {
    const swappedAmountWithFee = this.calculateAmountInOtherToken(
      inputToken,
      inputAmount,
      true
    );

    const swappedAmountWithoutFee = this.calculateAmountInOtherToken(
      inputToken,
      inputAmount,
      false
    );
    return swappedAmountWithoutFee - swappedAmountWithFee;
  }

  otherToken(token: Token): Token {
    if (this.tokenA.mint.equals(token)) return this.tokenB.mint;
    if (this.tokenB.mint.equals(token)) return this.tokenA.mint;
    throw new Error("");
  }

  getTokenAValueOfPoolTokenAmount(poolTokenAmount: number): number {
    // TODO this will change in later versions of the tokenSwap program.
    return poolTokenAmount;
  }

  getTokenBValueOfPoolTokenAmount(poolTokenAmount: number): number {
    return this.calculateTokenBAmount(
      this.getTokenAValueOfPoolTokenAmount(poolTokenAmount),
      false
    );
  }

  getPoolTokenValueOfTokenAAmount(tokenAAmount: number): number {
    // TODO this will change in later versions of the tokenSwap program.
    return tokenAAmount;
  }

  getPoolTokenValueOfTokenBAmount(tokenBAmount: number): number {
    return this.getPoolTokenValueOfTokenAAmount(
      this.getTokenAValueOfPoolTokenAmount(tokenBAmount)
    );
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

  matches(
    firstTokenAccount: TokenAccount,
    secondTokenAccount: TokenAccount
  ): boolean {
    return (
      (this.tokenA.sameToken(firstTokenAccount) &&
        this.tokenB.sameToken(secondTokenAccount)) ||
      (this.tokenB.sameToken(firstTokenAccount) &&
        this.tokenA.sameToken(secondTokenAccount))
    );
  }

  serialize(): SerializablePool {
    return {
      address: this.address.toBase58(),
      tokenA: this.tokenA.serialize(),
      tokenB: this.tokenB.serialize(),
      poolToken: this.poolToken.serialize(),
      programId: this.programId.toBase58(),
      nonce: this.nonce,
      feeRatio: this.feeRatio,
    };
  }

  static from(serializablePool: SerializablePool): Pool {
    return new Pool(
      new PublicKey(serializablePool.address),
      TokenAccount.from(serializablePool.tokenA),
      TokenAccount.from(serializablePool.tokenB),
      Token.from(serializablePool.poolToken),
      new PublicKey(serializablePool.programId),
      serializablePool.nonce,
      serializablePool.feeRatio
    );
  }
}
