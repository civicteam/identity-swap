import { WalletType, connect } from "../../src/api/wallet/";
import { APIFactory as TokenAPIFactory } from "../../src/api/token/";
import { ExtendedCluster } from "../../src/utils/types";
import { Token } from "../../src/api/token/Token";
import { TokenAccount } from "../../src/api/token/TokenAccount";

const defaultCluster: ExtendedCluster =
  (process.env.CLUSTER as ExtendedCluster) || "localnet";

export const MINT_AMOUNT = 100000000;

type CreateTokenParameters = {
  sendTokens?: boolean;
  cluster?: ExtendedCluster;
  decimals?: number;
};

/**
 * Create a token, an account for the token, and mint some initial tokens
 * @param sendTokens If true, send some initial tokens to the generated token account
 * @param cluster The solana cluster to connect to
 * @param decimals The number of decimal places the coin should have
 */
export const createToken = async ({
  sendTokens = false,
  cluster = defaultCluster,
  decimals = 2,
}: CreateTokenParameters): Promise<[Token, TokenAccount]> => {
  await connect(cluster, WalletType.LOCAL);

  const tokenAPI = TokenAPIFactory(cluster);
  const token = await tokenAPI.createToken(decimals);

  console.log("creating token account");
  const tokenAccount = await tokenAPI.createAccountForToken(token);

  if (sendTokens) {
    console.log("minting tokens");
    await tokenAPI.mintTo(tokenAccount, MINT_AMOUNT);
  }

  // once the transactions have been sent, get the latest token supply and account balance
  const updatedToken = await tokenAPI.tokenInfo(token.address);
  const updatedTokenAccount = await tokenAPI.tokenAccountInfo(
    tokenAccount.address
  );

  if (!updatedTokenAccount) throw new Error("Unable to retrieve token account");

  return [updatedToken, updatedTokenAccount];
};
