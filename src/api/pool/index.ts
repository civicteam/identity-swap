import assert from "assert";
import {
  Account,
  AccountMeta,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { TokenSwap } from "@solana/spl-token-swap";
import BufferLayout from "buffer-layout";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { Wallet } from "../wallet/Wallet";
import { APIFactory as TokenAPIFactory, TOKEN_PROGRAM_ID } from "../token";
import { TokenAccount } from "../token/TokenAccount";
import { makeNewAccountInstruction } from "../../utils/transaction";
import { TokenSwapLayout } from "../../utils/layouts";
import { makeTransaction, sendTransaction } from "../wallet/";
import { localSwapProgramId } from "../../utils/env";
import { Pool } from "./Pool";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const poolConfig = require("./pool.config.json");

let pools: Array<Pool>;

export type PoolCreationParameters = {
  wallet: Wallet;
  donorAccountA: TokenAccount;
  donorAccountB: TokenAccount;
  feeNumerator: number;
  feeDenominator: number;
  tokenAAmount?: number; // if missing, donate the full amount in donorAccountA
  tokenBAmount?: number; // if missing, donate the full amount in donorAccountB
};

type PoolOperationParameters = {
  // The liquidity pool to use when executing the transaction
  pool: Pool;
  // The wallet signing the transaction
  wallet: Wallet;
};

/**
 * Parameters for a swap transactions
 */
export type SwapParameters = PoolOperationParameters & {
  // The account, owned by the wallet, containing the source tokens
  fromAccount: TokenAccount;
  // The account, owned by the wallet, that will contain the target tokens.
  // If missing, a new account will be created (incurring a fee)
  toAccount: TokenAccount;
  // The amount of source tokens to swap
  fromAmount: number;
};

export type DepositParameters = PoolOperationParameters & {
  // The user account containing token A
  fromAAccount: TokenAccount;
  // The user account containing token B
  fromBAccount: TokenAccount;
  // The amount to deposit in terms of token A
  fromAAmount: number;
  // The user account to receive pool tokens.
  // If missing, a new account will be created (incurring a fee)
  poolTokenAccount?: TokenAccount;
};

export type WithdrawalParameters = PoolOperationParameters & {
  // The user account containing pool tokens
  fromPoolTokenAccount: TokenAccount;
  // The user account to receive token A
  toAAccount?: TokenAccount;
  // The user account to receive token B
  toBAccount?: TokenAccount;
  // The amount to withdraw (in terms of pool tokens)
  fromPoolTokenAmount: number;
};

interface API {
  getPools: (forceRefresh: boolean) => Promise<Array<Pool>>;
  getPool: (address: PublicKey) => Promise<Pool>;
  createPool: (parameters: PoolCreationParameters) => Promise<Pool>;
  deposit: (parameters: DepositParameters) => Promise<string>;
  withdraw: (parameters: WithdrawalParameters) => Promise<string>;
  swap: (parameters: SwapParameters) => Promise<string>;
}

export const APIFactory = (cluster: ExtendedCluster): API => {
  const connection = getConnection(cluster);
  const poolConfigForCluster = poolConfig[cluster];

  const swapProgramIdString =
    poolConfigForCluster.swapProgramId || localSwapProgramId;
  if (!swapProgramIdString) throw new Error("No TokenSwap program ID defined");
  const swapProgramId = new PublicKey(swapProgramIdString);

  const tokenAPI = TokenAPIFactory(cluster);

  /**
   * Given a pool address, look up its information
   * @param address
   */
  const getPool = async (address: PublicKey): Promise<Pool> => {
    const payer = new Account();
    const tokenSwap = new TokenSwap(connection, address, swapProgramId, payer);

    // load the pool
    console.log("swap Address", address);
    const swapInfo = await tokenSwap.getInfo();

    // load the token account and mint info for tokens A and B
    const tokenAccountAInfo = await tokenAPI.tokenAccountInfo(
      swapInfo.tokenAccountA
    );
    const tokenAccountBInfo = await tokenAPI.tokenAccountInfo(
      swapInfo.tokenAccountB
    );

    // load the mint info for the pool token
    console.log("tokenPool", swapInfo.tokenPool);
    const poolTokenInfo = await tokenAPI.tokenInfo(swapInfo.tokenPool);

    if (!tokenAccountAInfo || !tokenAccountBInfo)
      throw Error("Error collecting pool data");

    return new Pool(
      address,
      tokenAccountAInfo,
      tokenAccountBInfo,
      poolTokenInfo,
      swapProgramId,
      swapInfo.nonce,
      swapInfo.feeRatio
    );
  };

  const getPools = async (forceRefresh = false): Promise<Array<Pool>> => {
    if (pools && !forceRefresh) return pools;

    console.log("Loading pools for cluster", cluster);
    const poolPromises = poolConfigForCluster.pools.map((address: string) =>
      getPool(new PublicKey(address))
    );

    pools = await Promise.all(poolPromises);
    return pools;
  };

  const isReverseSwap = ({
    pool,
    fromAccount,
  }: Pick<SwapParameters, "pool" | "fromAccount">) =>
    pool.tokenB.mint.equals(fromAccount.mint);

  const createSwapTransactionInstruction = async (
    parameters: Required<SwapParameters>
  ): Promise<TransactionInstruction> => {
    const isReverse = isReverseSwap(parameters);
    const poolIntoAccount = isReverse
      ? parameters.pool.tokenB
      : parameters.pool.tokenA;
    const poolFromAccount = isReverse
      ? parameters.pool.tokenA
      : parameters.pool.tokenB;

    const authority = await parameters.pool.tokenSwapAuthority();
    return TokenSwap.swapInstruction(
      parameters.pool.address,
      authority,
      parameters.fromAccount.address,
      poolIntoAccount.address,
      poolFromAccount.address,
      parameters.toAccount.address,
      swapProgramId,
      TOKEN_PROGRAM_ID,
      parameters.fromAmount
    );
  };

  const createPool = async (
    parameters: PoolCreationParameters
  ): Promise<Pool> => {
    assert(
      !parameters.donorAccountA.mint.equals(parameters.donorAccountB.mint),
      "Donor accounts must have different tokens."
    );

    const tokenSwapAccount = new Account();
    const [authority, nonce] = await PublicKey.findProgramAddress(
      [tokenSwapAccount.publicKey.toBuffer()],
      swapProgramId
    );

    console.log("Creating pool token");
    const poolToken = await tokenAPI.createToken(parameters.wallet, authority);

    console.log("Creating pool token account");
    const poolTokenAccount = await tokenAPI.createAccountForToken(
      parameters.wallet,
      poolToken
    );

    console.log("Creating token A account");
    const tokenAAccount = await tokenAPI.createAccountForToken(
      parameters.wallet,
      parameters.donorAccountA.mint,
      authority
    );

    console.log("Creating token B account");
    const tokenBAccount = await tokenAPI.createAccountForToken(
      parameters.wallet,
      parameters.donorAccountB.mint,
      authority
    );

    // TODO later merge into a single tx with fundB and createSwapAccount
    const aAmountToDonate =
      parameters.tokenAAmount || parameters.donorAccountA.balance;
    const tokenAFundParameters = {
      wallet: parameters.wallet,
      source: parameters.donorAccountA,
      destination: tokenAAccount,
      amount: aAmountToDonate,
    };
    console.log("Fund token A account: ", tokenAFundParameters);
    const transferPromiseA = tokenAPI.transfer(tokenAFundParameters);

    const bAmountToDonate =
      parameters.tokenBAmount || parameters.donorAccountB.balance;
    console.log("Fund token B account");
    const transferPromiseB = tokenAPI.transfer({
      wallet: parameters.wallet,
      source: parameters.donorAccountB,
      destination: tokenBAccount,
      amount: bAmountToDonate,
    });

    await Promise.all([transferPromiseA, transferPromiseB]);

    const createSwapAccountInstruction = await makeNewAccountInstruction(
      cluster,
      parameters.wallet,
      tokenSwapAccount.publicKey,
      TokenSwapLayout,
      swapProgramId
    );

    console.log("Creating pool");
    // TODO this should all be moved into the token-swap client.
    const keys: AccountMeta[] = [
      { pubkey: tokenSwapAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: false, isWritable: false },
      {
        pubkey: tokenAAccount.address,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: tokenBAccount.address,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: poolToken.address, isSigner: false, isWritable: true },
      { pubkey: poolTokenAccount.address, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8("instruction"),
      BufferLayout.nu64("feeNumerator"),
      BufferLayout.nu64("feeDenominator"),
      BufferLayout.u8("nonce"),
    ]);
    let data = Buffer.alloc(1024);
    {
      const sourceData = {
        instruction: 0, // InitializeSwap instruction
        feeNumerator: parameters.feeNumerator,
        feeDenominator: parameters.feeDenominator,
        nonce,
      };
      const encodeLength = commandDataLayout.encode(sourceData, data);
      data = data.slice(0, encodeLength);
    }
    const initializeSwapInstruction = new TransactionInstruction({
      keys,
      programId: swapProgramId,
      data,
    });

    const swapInitializationTransaction = await makeTransaction(
      [createSwapAccountInstruction, initializeSwapInstruction],
      [tokenSwapAccount]
    );

    await sendTransaction(swapInitializationTransaction, {
      commitment: "max",
      skipPreflight: false,
    });
    console.log("Created new pool");

    const createdPool = await getPool(tokenSwapAccount.publicKey);

    // add the pool to the list of known pools
    poolConfigForCluster.pools.push(createdPool.address.toBase58());

    return createdPool;
  };

  /**
   * Swap tokens via a liquidity pool
   * @param {SwapParameters} parameters
   */
  const swap = async (parameters: SwapParameters): Promise<string> => {
    if (!parameters.toAccount) {
      // Later we hope to be able to create a new account if the user does not have one
      // for the To token
      throw new Error("Creating a new To Account is not yet implemented");
    }

    console.log("Executing swap: ", parameters);

    const delegate = await parameters.pool.tokenSwapAuthority();
    await tokenAPI.approve(
      parameters.wallet,
      parameters.fromAccount,
      delegate,
      parameters.fromAmount
    );

    const swapInstruction = await createSwapTransactionInstruction(
      // we have guarded against all missing parameters now
      parameters as Required<SwapParameters>
    );

    const transaction = await makeTransaction([swapInstruction]);
    return sendTransaction(transaction, { commitment: "max" });
  };

  /**
   * Deposit funds into a pool
   * @param parameters
   */
  const deposit = async (parameters: DepositParameters): Promise<string> => {
    const fromBAmount = parameters.fromAAmount * parameters.pool.getRate();
    const authority = await parameters.pool.tokenSwapAuthority();

    console.log("Approving transfer of funds to the pool");
    await tokenAPI.approve(
      parameters.wallet,
      parameters.fromAAccount,
      authority,
      parameters.fromAAmount
    );
    await tokenAPI.approve(
      parameters.wallet,
      parameters.fromBAccount,
      authority,
      fromBAmount
    );

    const poolTokenAccount =
      parameters.poolTokenAccount ||
      (await tokenAPI.createAccountForToken(
        parameters.wallet,
        parameters.pool.poolToken
      ));

    console.log("Depositing funds into the pool");
    const depositInstruction = TokenSwap.depositInstruction(
      parameters.pool.address,
      authority,
      parameters.fromAAccount.address,
      parameters.fromBAccount.address,
      parameters.pool.tokenA.address,
      parameters.pool.tokenB.address,
      parameters.pool.poolToken.address,
      poolTokenAccount.address,
      swapProgramId,
      TOKEN_PROGRAM_ID,
      parameters.fromAAmount
    );

    const transaction = await makeTransaction([depositInstruction]);

    return sendTransaction(transaction, {
      commitment: "max",
    });
  };

  /**
   * Withdraw funds from a pool
   * @param parameters
   */
  const withdraw = async (
    parameters: WithdrawalParameters
  ): Promise<string> => {
    const authority = await parameters.pool.tokenSwapAuthority();

    console.log("Approving transfer of pool tokens back to the pool");
    await tokenAPI.approve(
      parameters.wallet,
      parameters.fromPoolTokenAccount,
      authority,
      parameters.fromPoolTokenAmount
    );

    const toAAccount =
      parameters.toAAccount ||
      (await tokenAPI.createAccountForToken(
        parameters.wallet,
        parameters.pool.tokenA.mint
      ));

    const toBAccount =
      parameters.toBAccount ||
      (await tokenAPI.createAccountForToken(
        parameters.wallet,
        parameters.pool.tokenB.mint
      ));

    console.log("Withdrawing funds from the pool");
    const withdrawalInstruction = TokenSwap.withdrawInstruction(
      parameters.pool.address,
      authority,
      parameters.pool.poolToken.address,
      parameters.fromPoolTokenAccount.address,
      parameters.pool.tokenA.address,
      parameters.pool.tokenB.address,
      toAAccount.address,
      toBAccount.address,
      swapProgramId,
      TOKEN_PROGRAM_ID,
      parameters.fromPoolTokenAmount
    );

    const transaction = await makeTransaction([withdrawalInstruction]);

    return sendTransaction(transaction, {
      commitment: "max",
    });
  };

  return {
    getPools,
    getPool,
    createPool,
    deposit,
    withdraw,
    swap,
  };
};
