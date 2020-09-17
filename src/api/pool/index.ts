import { Account, Cluster, Connection, PublicKey } from "@solana/web3.js";
import { TokenSwap } from "@solana/spl-token-swap";
import { Token, MintInfo } from "@solana/spl-token";
import { path } from "ramda";
import { BN } from "bn.js";
import { getConnection } from "../connection";
import { Pool, TokenAccount, Token as TokenSummary } from "./Pool";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./pool.config.json");

type ParsedTokenAccountInfo = {
  mint: string;
  tokenAmount: { amount: string; decimals: number; uiAmount: number };
};

type TokenInfo = {
  token: Token;
  mintInfo: MintInfo;
};

type TokenAccountInfo = {
  account: PublicKey;
  mint: PublicKey;
  tokenAmount: BN;
} & TokenInfo;

const tokenInfo = async (
  connection: Connection,
  tokenProgramId: PublicKey,
  mint: PublicKey,
  payer: Account
): Promise<TokenInfo> => {
  const token = new Token(connection, mint, tokenProgramId, payer);

  const mintInfo = await token.getMintInfo();

  return {
    token,
    mintInfo,
  };
};

const tokenAccountInfo = async (
  connection: Connection,
  tokenProgramId: PublicKey,
  account: PublicKey,
  payer: Account
): Promise<TokenAccountInfo | null> => {
  const getParsedAccountInfoResult = await connection.getParsedAccountInfo(
    account
  );
  const parsedInfo: ParsedTokenAccountInfo | undefined = path(
    ["value", "data", "parsed", "info"],
    getParsedAccountInfoResult
  );

  // this account does not appear to be a token account
  if (!parsedInfo) return null;

  const info = {
    tokenAmount: new BN(parsedInfo.tokenAmount.amount),
    mint: new PublicKey(parsedInfo.mint),
  };

  const mintTokenInfo = await tokenInfo(
    connection,
    tokenProgramId,
    info.mint,
    payer
  );

  return {
    ...info,
    account,
    ...mintTokenInfo,
  };
};

export const getPool = async (
  connection: Connection,
  address: PublicKey,
  swapProgramId: PublicKey,
  tokenProgramId: PublicKey
): Promise<Pool> => {
  const payer = new Account();
  const tokenSwap = new TokenSwap(connection, address, swapProgramId, payer);

  // load the pool
  console.log("swap Address", address);
  const swapInfo = await tokenSwap.getInfo();

  // load the token account and mint info for tokens A and B
  const tokenAccountAInfo = await tokenAccountInfo(
    connection,
    tokenProgramId,
    swapInfo.tokenAccountA,
    payer
  );
  const tokenAccountBInfo = await tokenAccountInfo(
    connection,
    tokenProgramId,
    swapInfo.tokenAccountB,
    payer
  );

  // load the mint info for the pool token
  console.log("tokenPool", swapInfo.tokenPool);
  const poolTokenInfo = await tokenInfo(
    connection,
    tokenProgramId,
    swapInfo.tokenPool,
    payer
  );

  if (!tokenAccountAInfo || !tokenAccountBInfo)
    throw Error("Error collecting pool data");

  return new Pool(
    address,
    new TokenAccount(
      new TokenSummary(
        tokenAccountAInfo.mint,
        tokenAccountAInfo.mintInfo.decimals
      ),
      tokenAccountAInfo.account,
      tokenAccountAInfo.tokenAmount.toNumber()
    ),
    new TokenAccount(
      new TokenSummary(
        tokenAccountBInfo.mint,
        tokenAccountBInfo.mintInfo.decimals
      ),
      tokenAccountBInfo.account,
      tokenAccountBInfo.tokenAmount.toNumber()
    ),
    new TokenSummary(swapInfo.tokenPool, poolTokenInfo.mintInfo.decimals)
  );
};

export const getPools = (cluster: Cluster): Promise<Pool[]> => {
  console.log("Loading pools for cluster", cluster);
  const connection = getConnection(cluster);
  const poolConfig = config[cluster];
  const swapProgramId = new PublicKey(poolConfig.swapProgramId);
  const tokenProgramId = new PublicKey(poolConfig.tokenProgramId);

  const poolPromises = poolConfig.pools.map((address: string) =>
    getPool(connection, new PublicKey(address), swapProgramId, tokenProgramId)
  );

  return Promise.all(poolPromises);
};

export const swap = async (
  tokenAAmount: number,
  tokenBAmount: number,
  tokenAAccount: TokenAccount,
  tokenBAccount: TokenAccount
): Promise<void> => {
  console.log("Swapping...", {
    tokenAAmount,
    tokenBAmount,
    tokenAAccount,
    tokenBAccount,
  });
  return;
};
