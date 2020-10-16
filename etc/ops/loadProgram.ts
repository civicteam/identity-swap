import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env.test" });

import { program } from "commander";

import {
  Account,
  BPF_LOADER_PROGRAM_ID,
  BpfLoader,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { createAndFundAccount } from "../../test/utils/account";
import { DEFAULT_COMMITMENT } from "../../src/api/connection";
import { url } from "./utils/url";

program.option(
  "-p, --path <path>",
  "Input the program path to be loaded",
  "/tmp/spl_token_swap.so"
);

program.parse(process.argv);

if (!program.path) {
  console.error("Program path to be loaded is required");
  process.exit();
}

async function loadProgram(
  connection: Connection,
  path: string
): Promise<PublicKey> {
  const NUM_RETRIES = 500; /* allow some number of retries */
  const data = fs.readFileSync(path);
  const { feeCalculator } = await connection.getRecentBlockhash();

  const balanceNeeded =
    feeCalculator.lamportsPerSignature *
      (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES) +
    (await connection.getMinimumBalanceForRentExemption(data.length));

  const from = await createAndFundAccount(connection, balanceNeeded);
  const program_account = new Account();

  await BpfLoader.load(
    connection,
    from,
    program_account,
    data,
    BPF_LOADER_PROGRAM_ID
  );

  return program_account.publicKey;
}

(async () => {
  const connection = await new Connection(url, DEFAULT_COMMITMENT);

  const tokenSwapProgramId = await loadProgram(connection, program.path);

  console.log(tokenSwapProgramId.toBase58());
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
