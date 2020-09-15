import { Cluster, clusterApiUrl } from "@solana/web3.js";
import { SolletWallet } from "./SolletWallet";
import { Wallet } from "./Wallet";

let wallet: Wallet | null;

export const connect = async (cluster: Cluster): Promise<Wallet> => {
  const network = clusterApiUrl(cluster);
  const newWallet = new SolletWallet(network);

  wallet = newWallet;

  return new Promise((resolve) => {
    newWallet.on("connect", () => resolve(newWallet));
  });
};

export const disconnect = (): void => wallet?.disconnect();
