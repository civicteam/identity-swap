import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { memoizeWith, identity } from "ramda";

// Since connection objects
const createConnection = memoizeWith<(network: string) => Connection>(
  identity,
  (network) => new Connection(network)
);

export const getConnection = (cluster: Cluster): Connection => {
  const network = clusterApiUrl(cluster);
  return createConnection(network);
};
