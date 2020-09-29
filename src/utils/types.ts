import { OptionsObject, SnackbarKey } from "notistack";
import { Optional } from "utility-types";
import { Cluster } from "@solana/web3.js";
import { SerializableTokenAccount } from "../api/token/TokenAccount";

export interface TokenPairState {
  fromTokenAccount?: SerializableTokenAccount;
  fromAmount: number;
  toTokenAccount?: SerializableTokenAccount;
  toAmount: number;
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

// Web3 does not recognise "localnet" as a clustser
export type ExtendedCluster = Cluster | "localnet";

export interface Serializable<T> {
  serialize(): T;
}
