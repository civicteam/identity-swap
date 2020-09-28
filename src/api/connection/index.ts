import { clusterApiUrl, Commitment, Connection } from "@solana/web3.js";
import { identity, memoizeWith } from "ramda";
import { ExtendedCluster } from "../../utils/types";
import { defaultCommitment } from "../../utils/env";
import { retryableProxy } from "../../utils/retryableProxy";

const LOCALNET_URL = "http://localhost:8899";

// The default time to wait when confirming a transaction.
export const DEFAULT_COMMITMENT: Commitment = defaultCommitment;

// Since connection objects include state, we memoise them here per network
const createConnection = memoizeWith<(network: string) => Connection>(
  identity,
  (network) => {
    const connection = new Connection(network, DEFAULT_COMMITMENT);

    // Due to an issue with the solana back-end relating to CORS headers on 429 responses
    // Rate-limiting responses are not retried correctly. Adding this proxy fixes this.
    connection.getAccountInfo = retryableProxy(connection.getAccountInfo);
    return connection;
  }
);

export const getNetwork = (cluster: ExtendedCluster): string =>
  cluster === "localnet" ? LOCALNET_URL : clusterApiUrl(cluster);

export const getConnection = (cluster: ExtendedCluster): Connection => {
  const network = getNetwork(cluster);
  return createConnection(network);
};
