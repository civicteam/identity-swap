import { OptionsObject, SnackbarKey } from "notistack";
import { Optional } from "utility-types";
import { Cluster } from "@solana/web3.js";

/**
 * A type interface for any state that is loaded from some backend or async source.
 */
export interface Loadable {
  loading: boolean;
  error: string | null;
}

/**
 * A notification type used by notistack
 */
export interface Notification {
  key: SnackbarKey;
  message: string;
  options: OptionsObject;
  dismissed: boolean;
}

/**
 * A type used when creating a notification
 */
export type SparseNotification = Optional<
  Notification,
  "key" | "options" | "dismissed"
>;

// TODO will be removed
export interface Pool {
  address: string;
  tokenA: string;
  tokenB: string;
}

// Web3 does not recognise "localnet" as a clustser
export type ExtendedCluster = Cluster | "localnet";
