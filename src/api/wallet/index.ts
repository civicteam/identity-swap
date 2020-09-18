import {
  Account,
  Commitment,
  Connection,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import { DEFAULT_COMMITMENT, getConnection, getNetwork } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { SolletWallet } from "./SolletWallet";
import { Wallet } from "./Wallet";
import { LocalWallet } from "./LocalWallet";

/**
 * API for connecting to and interacting with a wallet
 */

// singleton wallet for the app.
// A user can be connected to only one wallet at a time.
let wallet: Wallet | null;
let connection: Connection | null;

export enum WalletType {
  SOLLET,
  LOCAL,
}

const createWallet = (type: WalletType, cluster: ExtendedCluster): Wallet => {
  const network = getNetwork(cluster);
  switch (type) {
    case WalletType.LOCAL:
      return new LocalWallet(network);
    case WalletType.SOLLET:
      return new SolletWallet(network);
  }
};

export const connect = async (
  cluster: ExtendedCluster,
  type: WalletType
): Promise<Wallet> => {
  const newWallet = createWallet(type, cluster);

  // assign the singleton wallet.
  // Using a separate variable to simplify the type definitions
  wallet = newWallet;
  connection = getConnection(cluster);

  // connect is done once the wallet reports that it is connected.
  return new Promise((resolve) => {
    newWallet.on("connect", () => resolve(newWallet));
  });
};

export const disconnect = (): void => wallet?.disconnect();

export const makeTransaction = async (
  instructions: (TransactionInstruction | TransactionInstructionCtorFields)[],
  signers: Account[] = []
): Promise<Transaction> => {
  if (!wallet || !connection) throw new Error("Connect first");

  const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

  const signatures = [{ publicKey: wallet.pubkey }, ...signers];
  const transaction = new Transaction({
    recentBlockhash,
    signatures,
  });
  transaction.add(...instructions);

  // if there are any cosigners (other than the current wallet)
  // sign the transaction
  if (signers.length > 0) transaction.partialSign(...signers);

  return transaction;
};

export const sendTransaction = async (
  transaction: Transaction,
  commitment: Commitment = DEFAULT_COMMITMENT
): Promise<string> => {
  if (!wallet || !connection) throw new Error("Connect first");

  console.log("Sending signature request to wallet");
  const signed = await wallet.sign(transaction);
  console.log("Got signature, submitting transaction");
  const signature = await connection.sendRawTransaction(signed.serialize());
  console.log("Submitted transaction " + signature + ", awaiting confirmation");
  await connection.confirmTransaction(signature, commitment);
  console.log("Transaction " + signature + " confirmed");

  return signature;
};

export const sendDummyTX = async (): Promise<string> => {
  if (!wallet) throw new Error("Connect first");
  const transaction = await makeTransaction([
    SystemProgram.transfer({
      fromPubkey: wallet.pubkey,
      toPubkey: wallet.pubkey,
      lamports: 100,
    }),
  ]);

  return sendTransaction(transaction);
};
