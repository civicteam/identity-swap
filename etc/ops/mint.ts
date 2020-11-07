import dotenv from "dotenv";
dotenv.config({ path: "./.env.test" });

import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import { find } from "ramda";

import { APIFactory as TokenAPIFactory } from "../../src/api/token/index";
import { ExtendedCluster } from "../../src/utils/types";
import { getConnection } from "../../src/api/connection";
import * as WalletAPI from "../../src/api/wallet";
import { WalletType } from "../../src/api/wallet";
import { airdropTo } from "../../test/utils/account";
import { Token } from "../../src/api/token/Token";
import { sleep } from "../../src/utils/sleep";

const cluster = (process.env.CLUSTER || "devnet") as ExtendedCluster;

program
  .requiredOption(
    "-t, --token <symbol|name|address>",
    "The symbol, name or address of the token to mint"
  )
  .option(
    "-r, --recipient <address>",
    "The address of the recipient, defaults to the wallet"
  )
  .option(
    "-n, --new",
    "If true, create a new token account, if false, the recipient must be a token account",
    false
  )
  .option<number>(
    "--amount <number>",
    "The amount of the token to deposit",
    (val) => parseInt(val, 10),
    10000
  )
  .option(
    "--skip-airdrop",
    "if true, do not airdrop SOL to the wallet first",
    false
  );

program.parse(process.argv);

// use this when you don't know if the address is a public key
const safeToPublicKey = (potentialAddress: string) => {
  try {
    return new PublicKey(potentialAddress);
  } catch (error) {
    return null;
  }
};

const nullableEquals = (
  publicKey: PublicKey,
  nullablePublicKey: PublicKey | null
) => !!nullablePublicKey && publicKey.equals(nullablePublicKey);

const tokenMatches = (property: string) => (token: Token) =>
  token.symbol === property ||
  token.name === property ||
  nullableEquals(token.address, safeToPublicKey(property));

(async () => {
  const wallet = await WalletAPI.connect(cluster, WalletType.LOCAL);
  const tokenAPI = TokenAPIFactory(cluster);

  if (!program.skipAirdrop) {
    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(cluster), wallet.pubkey);
  }

  const tokens = await tokenAPI.getTokens();
  const tokenToMint = find(tokenMatches(program.token), tokens);

  if (!tokenToMint) throw new Error(`Token ${program.token} not recognised`);

  const recipientPublicKey = program.recipient
    ? new PublicKey(program.recipient)
    : wallet.pubkey;
  const tokenRecipient =
    program.new || !program.recipient
      ? await tokenAPI.createAccountForToken(tokenToMint, recipientPublicKey)
      : await tokenAPI.tokenAccountInfo(recipientPublicKey);

  await sleep(10000);

  if (!tokenRecipient)
    throw new Error("Error creating or getting the token recipient");

  console.log(`Minting to ${tokenRecipient.address.toBase58()}`);
  const mintResult = await tokenAPI.mintTo(tokenRecipient, program.amount);

  const tokenAccountInfo = await tokenAPI.tokenAccountInfo(
    tokenRecipient.address
  );

  console.log({
    tokenAccountInfo,
    mintResult,
    tokenRecipient: tokenRecipient.address.toBase58(),
  });
})().catch((error) => console.error(error));
