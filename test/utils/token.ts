import { WalletType, connect } from "../../src/api/wallet/";
import { APIFactory as TokenAPIFactory } from "../../src/api/token/";
import { ExtendedCluster } from "../../src/utils/types";
import { Token } from "../../src/api/token/Token";
import { TokenAccount } from "../../src/api/token/TokenAccount";

const cluster: ExtendedCluster =
  (process.env.CLUSTER as ExtendedCluster) || "localnet";

export const MINT_AMOUNT = 100000000;

type CreateTokenParameters = {
  sendTokens?: boolean;
};

/**
 * Create a token, an account for the token, and mint some initial tokens
 * @param sendTokens If true, send some initial tokens to the generated token account
 */
export const createToken = async ({
  sendTokens = false,
}: CreateTokenParameters): Promise<[Token, TokenAccount]> => {
  const wallet = await connect(cluster, WalletType.LOCAL);

  const tokenAPI = TokenAPIFactory(cluster);
  const token = await tokenAPI.createToken(wallet);

  console.log("creating token account");
  const tokenAccount = await tokenAPI.createAccountForToken(wallet, token);

  if (sendTokens) {
    console.log("minting tokens");
    await tokenAPI.mintTo(wallet, tokenAccount, MINT_AMOUNT);
  }

  // once the transactions have been sent, get the latest token supply and account balance
  const updatedToken = await tokenAPI.tokenInfo(token.address);
  const updatedTokenAccount = await tokenAPI.tokenAccountInfo(
    tokenAccount.address
  );

  if (!updatedTokenAccount) throw new Error("Unable to retrieve token account");

  return [updatedToken, updatedTokenAccount];
};
