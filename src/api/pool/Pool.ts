import assert from "assert";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { min } from "ramda";
import { SerializableToken, Token } from "../token/Token";
import { SerializableTokenAccount, TokenAccount } from "../token/TokenAccount";
import { Serializable } from "../../utils/types";
import { OnChainEntity } from "../OnChainEntity";

export type SerializablePool = {
  address: string;
  tokenA: SerializableTokenAccount;
  tokenB: SerializableTokenAccount;
  poolToken: SerializableToken;

  programId: string;
  nonce: number;
  feeRatio: number;
};

export const DEFAULT_SLIPPAGE = 0.1;
type SlippageDirection = "down" | "up";

export type TokenAmounts = {
  poolTokenAmount: number;
  tokenAAmount: number;
  tokenBAmount: number;
};

/**
 * Adjust an amount either up or down according to a slippage parameter
 * The default slippage parameter is DEFAULT_SLIPPAGE.
 * e.g. if parameters.slippage is 0.1, the amount is 100, and the direction is
 * "down",
 * the result is 100 * (1 - 0.1) = 90
 *
 * @param amount
 * @param direction
 * @param slippage
 */
export const adjustForSlippage = (
  amount: number,
  direction: SlippageDirection,
  slippage = DEFAULT_SLIPPAGE
): number => {
  const slippageMultiplier = 1 + (direction === "up" ? slippage : -slippage);

  return amount * slippageMultiplier;
};

export class Pool
  extends OnChainEntity
  implements Serializable<SerializablePool> {
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
    feeRatio: number,
    currentSlot?: number
  ) {
    super(currentSlot);

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

  /**
   * Get the liquidity of the pool in terms of token A
   */
  getLiquidity(): number {
    return this.tokenA.balance;
  }

  /**
   * The smallest pool token amount that can be received during deposit
   * or given during withdrawal, depends on the balances and precision
   * of token A and B in the pool.
   */
  getSmallestPoolTokenAmountForWithdrawalOrDeposit(): number {
    const smallestPoolTokenAmountForA = this.getPoolTokenValueOfTokenAAmount(1);
    const smallestPoolTokenAmountForB = this.getPoolTokenValueOfTokenBAmount(1);

    return min(smallestPoolTokenAmountForA, smallestPoolTokenAmountForB);
  }

  calculateAmountsWithSlippage(
    poolTokenAmount: number,
    direction: SlippageDirection,
    slippage?: number
  ): TokenAmounts {
    // Calculate the expected amounts for token A & B given a pool token amount and slippage parameters
    const tokenAAmountWithoutSlippage = this.getTokenAValueOfPoolTokenAmount(
      poolTokenAmount
    );

    const tokenBAmountWithoutSlippage = this.getTokenBValueOfPoolTokenAmount(
      poolTokenAmount
    );

    const tokenALimitWithSlippage = adjustForSlippage(
      tokenAAmountWithoutSlippage,
      direction,
      slippage
    );

    const tokenBLimitWithSlippage = adjustForSlippage(
      tokenBAmountWithoutSlippage,
      direction,
      slippage
    );

    return {
      poolTokenAmount,
      tokenAAmount: tokenALimitWithSlippage,
      tokenBAmount: tokenBLimitWithSlippage,
    };
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

  /**
   * Calculate the value of the pool tokens in terms of A
   * A = P*A_bal/P_sup
   * where A = the value of the pool tokens in A (the return value)
   * P = the poolTokenAmount
   * A_bal = the balance of token A in the pool
   * P_sup = the total supply of pool tokens
   *
   * @param poolTokenAmount
   */
  getTokenAValueOfPoolTokenAmount(poolTokenAmount: number): number {
    // TODO this will change in later versions of the tokenSwap program.
    return new BN(poolTokenAmount)
      .mul(new BN(this.tokenA.balance))
      .div(this.poolToken.supply)
      .toNumber();
  }

  /**
   * Calculate the value of the pool tokens in terms of B
   * B = P*B_bal/P_sup
   * where B = the value of the pool tokens in B (the return value)
   * P = the poolTokenAmount
   * B_bal = the balance of token B in the pool
   * P_sup = the total supply of pool tokens
   *
   * @param poolTokenAmount
   */
  getTokenBValueOfPoolTokenAmount(poolTokenAmount: number): number {
    // TODO this will change in later versions of the tokenSwap program.
    return new BN(poolTokenAmount)
      .mul(new BN(this.tokenB.balance))
      .div(this.poolToken.supply)
      .toNumber();
  }

  /**
   * This formula is defined in relation to getTokenAValueOfPoolTokenAmount:
   * P = A*P_sup/A_bal
   * @param tokenAAmount
   */
  getPoolTokenValueOfTokenAAmount(tokenAAmount: number): number {
    return new BN(tokenAAmount)
      .mul(this.poolToken.supply)
      .div(new BN(this.tokenA.balance))
      .toNumber();
  }

  /**
   * This formula is defined in relation to getTokenBValueOfPoolTokenAmount:
   * P = B*P_sup/B_bal
   * @param tokenBAmount
   */
  getPoolTokenValueOfTokenBAmount(tokenBAmount: number): number {
    return new BN(tokenBAmount)
      .mul(this.poolToken.supply)
      .div(new BN(this.tokenB.balance))
      .toNumber();
  }

  toString(): string {
    return `Pool Address: ${this.address.toBase58()}
    Token A: ${this.tokenA.toString()}
    Token B: ${this.tokenB.toString()}
    Pool Token: ${this.poolToken.toString()} Supply: ${this.poolToken.supply.toNumber()}" 
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

  equals(other: Pool): boolean {
    return this.address.equals(other.address);
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
