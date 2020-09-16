import {
  Cluster,
  clusterApiUrl,
  Connection,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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

const createWallet = (type: WalletType, network: string): Wallet => {
  switch (type) {
    case WalletType.LOCAL:
      return new LocalWallet(network);
    case WalletType.SOLLET:
      return new SolletWallet(network);
  }
};

export const connect = async (
  cluster: Cluster,
  type: WalletType
): Promise<Wallet> => {
  const network = clusterApiUrl(cluster);
  const newWallet = createWallet(type, network);

  // assign the singleton wallet.
  // Using a separate variable to simplify the type definitions
  wallet = newWallet;
  connection = new Connection(network);

  // connect is done once the wallet reports that it is connected.
  return new Promise((resolve) => {
    newWallet.on("connect", () => resolve(newWallet));
  });
};

export const disconnect = (): void => wallet?.disconnect();

export const sendTransaction = async (
  transaction: Transaction
): Promise<string> => {
  if (!wallet || !connection) throw new Error("Connect first");

  console.log("Sending signature request to wallet");
  const signed = await wallet.signTransaction(transaction);
  console.log("Got signature, submitting transaction");
  const signature = await connection.sendRawTransaction(signed.serialize());
  console.log("Submitted transaction " + signature + ", awaiting confirmation");
  await connection.confirmTransaction(signature, "recent");
  console.log("Transaction " + signature + " confirmed");

  return signature;
};

export const sendDummyTX = async (): Promise<string> => {
  if (!wallet || !connection) throw new Error("Connect first");
  const { blockhash } = await connection.getRecentBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    signatures: [{ publicKey: wallet.pubkey }],
  });
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.pubkey,
      toPubkey: wallet.pubkey,
      lamports: 100,
    })
  );

  return sendTransaction(transaction);
};
