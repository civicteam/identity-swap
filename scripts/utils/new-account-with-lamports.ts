import { Account, Connection } from "@solana/web3.js";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function airdropTo(
  connection: Connection,
  account: Account,
  lamports = 1000000
): Promise<void> {
  let retries = 60;

  const oldBalance = await connection.getBalance(account.publicKey);

  await connection.requestAirdrop(account.publicKey, lamports);
  for (;;) {
    await sleep(500);
    const newBalance = await connection.getBalance(account.publicKey);
    if (lamports == newBalance - oldBalance) {
      return;
    }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`);
}

export async function newAccountWithLamports(
  connection: Connection,
  lamports: number
): Promise<Account> {
  const account = new Account();

  await airdropTo(connection, account, lamports);

  return account;
}
