import dotenv from "dotenv";
dotenv.config({ path: "./.env.test" });

import { program } from "commander";

import { ExtendedCluster } from "../../src/utils/types";
import { getConnection } from "../../src/api/connection";
import * as WalletAPI from "../../src/api/wallet";
import { WalletType } from "../../src/api/wallet";
import { airdropTo } from "../../test/utils/account";
import { createToken } from "../../test/utils/token";

const cluster = (process.env.CLUSTER || "devnet") as ExtendedCluster;

program
  .option(
    "-d, --decimals <number>",
    "the number of decimal places the currency should have",
    (val) => parseInt(val, 10),
    2
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
  }

  const [token] = await createToken({ cluster, decimals: program.decimals });
  console.log(token.address.toBase58());
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
