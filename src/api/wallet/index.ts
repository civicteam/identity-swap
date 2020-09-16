import { Cluster, clusterApiUrl } from "@solana/web3.js";
import { SolletWallet } from "./SolletWallet";
import { Wallet } from "./Wallet";

/**
 * API for connecting to and interacting with a wallet
 */

// singleton wallet for the app.
// A user can be connected to only one wallet at a time.
let wallet: Wallet | null;

export const connect = async (cluster: Cluster): Promise<Wallet> => {
  const network = clusterApiUrl(cluster);
  const newWallet = new SolletWallet(network);

  // assign the singleton wallet.
  // Using a separate variable to simplify the type definitions
  wallet = newWallet;

  // connect is done once the wallet reports that it is connected.
  return new Promise((resolve) => {
    newWallet.on("connect", () => resolve(newWallet));
  });
};

export const disconnect = (): void => wallet?.disconnect();
