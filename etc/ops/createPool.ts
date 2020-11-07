/**
 * Creates a new pool for two tokens
 *
 * Usage:
 *
 * Create a new pool between USDC and CVC
 *  yarn op createPool -a <address> -b <address>
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env.test" });

import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import { APIFactory as PoolAPIFactory } from "../../src/api/pool/index";
import { APIFactory as TokenAPIFactory } from "../../src/api/token/index";
import { ExtendedCluster } from "../../src/utils/types";
import { getConnection } from "../../src/api/connection";
import * as WalletAPI from "../../src/api/wallet";
import { WalletType } from "../../src/api/wallet";
import { airdropTo } from "../../test/utils/account";

const cluster = (process.env.CLUSTER || "devnet") as ExtendedCluster;

program
  .requiredOption(
    "-a, --accountA <address>",
    "The address of an account containing token A"
  )
  .requiredOption(
    "-b, --accountB <address>",
    "The address of an account containing token B"
  )
  .option<number>(
    "--amountA <number>",
    "The amount of token A to deposit",
    (val) => parseInt(val, 10)
  )
  .option<number>(
    "--amountB <number>",
    "The amount of token B to deposit",
    (val) => parseInt(val, 10)
  )
  .option<number>(
    "-f, --fee <number>",
    "The fee rate as a decimal (e.g. 0.01 = 1%). Default 0.003 (0.3%)",
    (val) => parseInt(val, 10),
    0.003
  )
  .option(
    "--skip-airdrop",
    "if true, do not airdrop SOL to the wallet first",
    false
  );

program.parse(process.argv);

(async () => {
  const wallet = await WalletAPI.connect(cluster, WalletType.LOCAL);

  if (!program.skipAirdrop) {
    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(cluster), wallet.pubkey);
    await airdropTo(getConnection(cluster), wallet.pubkey);
    await airdropTo(getConnection(cluster), wallet.pubkey);
  }

  const poolAPI = PoolAPIFactory(cluster);
  const tokenAPI = TokenAPIFactory(cluster);

  const donorAccountA = await tokenAPI.tokenAccountInfo(
    new PublicKey(program.accountA)
  );

  const donorAccountB = await tokenAPI.tokenAccountInfo(
    new PublicKey(program.accountB)
  );

  if (!donorAccountA || !donorAccountB)
    throw new Error("Donor account(s) not found");

  const tokenAAmount = program.amountA || donorAccountA?.balance;
  const tokenBAmount = program.amountB || donorAccountB?.balance;

  const pool = await poolAPI.createPool({
    donorAccountA,
    donorAccountB,
    feeDenominator: 1000,
    feeNumerator: program.fee * 1000,
    tokenAAmount,
    tokenBAmount,
  });

  console.log("Pool");
  console.log(pool.toString());
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
