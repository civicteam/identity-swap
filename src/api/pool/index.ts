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
import { Pool } from "./Pool";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const poolConfig = require("./pool.config.json");

export type PoolCreationParameters = {
  wallet: Wallet;
  donorAccountA: TokenAccount;
  donorAccountB: TokenAccount;
  feeNumerator: number;
  feeDenominator: number;
  tokenAAmount?: number; // if missing, donate the full amount in donorAccountA
  tokenBAmount?: number; // if missing, donate the full amount in donorAccountB
};

/**
 * Parameters for a swap transactions
 */
export type SwapParameters = {
  // The liquidity pool to use when executing the swap
  pool: Pool;
  // The wallet signing the swap
  wallet: Wallet;
  // The account, owned by the wallet, containing the source tokens
  fromAccount: TokenAccount;
  // The account, owned by the wallet, that will contain the target tokens.
  // If missing, a new account will be created (incurring a fee)
  toAccount: TokenAccount;
  // The amount of source tokens to swap
  fromAmount: number;
};

interface API {
  getPools: () => Promise<Pool[]>;
  getPool: (address: PublicKey) => Promise<Pool>;
  createPool: (parameters: PoolCreationParameters) => Promise<Pool>;
  swap: (parameters: SwapParameters) => Promise<string>;
}

export const APIFactory = (cluster: ExtendedCluster): API => {
  const connection = getConnection(cluster);
  const poolConfigForCluster = poolConfig[cluster];
  const swapProgramId = new PublicKey(poolConfigForCluster.swapProgramId);

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
      swapInfo.nonce
    );
  };

  const getPools = (): Promise<Pool[]> => {
    console.log("Loading pools for cluster", cluster);
    const poolPromises = poolConfigForCluster.pools.map((address: string) =>
      getPool(new PublicKey(address))
    );

    return Promise.all(poolPromises);
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

    const payer = new Account();
    const tokenSwap = new TokenSwap(
      connection,
      parameters.pool.address,
      swapProgramId,
      payer
    );
    const authority = await parameters.pool.tokenSwapAuthority();
    return tokenSwap.swapInstruction(
      authority,
      parameters.fromAccount.address,
      poolIntoAccount.address,
      poolFromAccount.address,
      parameters.toAccount.address,
      TOKEN_PROGRAM_ID,
      parameters.fromAmount
    );
  };

  const createPool = async (
    parameters: PoolCreationParameters
  ): Promise<Pool> => {
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
    await tokenAPI.transfer(tokenAFundParameters);

    const bAmountToDonate =
      parameters.tokenBAmount || parameters.donorAccountB.balance;
    console.log("Fund token B account");
    await tokenAPI.transfer({
      wallet: parameters.wallet,
      source: parameters.donorAccountB,
      destination: tokenBAccount,
      amount: bAmountToDonate,
    });

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

    await sendTransaction(swapInitializationTransaction);
    console.log("Created new pool");

    return getPool(tokenSwapAccount.publicKey);
  };

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
    return sendTransaction(transaction);
  };

  return {
    getPools,
    getPool,
    createPool,
    swap,
  };
};
