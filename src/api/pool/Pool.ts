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
  private feeRatio: number;

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

  getRate(): number {
    return this.tokenA.balance > 0
      ? this.tokenB.balance / this.tokenA.balance
      : 0;
  }

  getLiquidity(): number {
    return this.tokenA.balance;
  }

  /**
   * Calculate the toAmount for a swap.
   * Note, this does not yet take into account slippage, which is not supported by the swap program.
   * It also assumes the swap program uses the Constant Product Function with no smoothing,
   * and that the fees are paid by the recipient, i.e. they are subtracted from the destination amount
   * @param fromToken
   * @param fromAmount
   */
  calculateSwappedAmount = (fromToken: Token, fromAmount: number): number => {
    const isReverse = this.tokenB.mint.equals(fromToken);

    const fromAmountInPool = isReverse
      ? this.tokenB.balance
      : this.tokenA.balance;
    const toAmountInPool = isReverse
      ? this.tokenB.balance
      : this.tokenA.balance;
    const invariant = fromAmountInPool * toAmountInPool;

    const newFromAmountInPool = fromAmountInPool + fromAmount;
    const newToAmountInPool = invariant / newFromAmountInPool;

    const grossToAmount = newToAmountInPool - toAmountInPool;

    // TODO double-check with Solana that ceil() is the right thing to do here
    const fees = Math.ceil(newToAmountInPool * this.feeRatio);

    return grossToAmount - fees;
  };

  calculateImpliedRate = (fromToken: Token, fromAmount: number): number => {
    const swappedAmount = this.calculateSwappedAmount(fromToken, fromAmount);

    return fromAmount > 0 ? swappedAmount / fromAmount : 0;
  };

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
