import { OptionsObject, SnackbarKey } from "notistack";
import { Optional } from "utility-types";
import { Cluster } from "@solana/web3.js";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";

export interface TokenPairState {
  fromTokenAccount?: SerializableTokenAccount;
  fromAmount: number;
  toTokenAccount?: SerializableTokenAccount;
  toAmount: number;
}

// Represents an update to the state. Contains non-serializeable objects that must be
// serialized before being added to the TokenPairState
export interface TokenPairUpdate {
  fromTokenAccount?: TokenAccount;
  fromAmount: number;
  toTokenAccount?: TokenAccount;
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

export type BalanceConstraints = {
  // the balance must be <= the fromTokenAccount balance (TODO HE-29 rename to token1Account or similar)
  fromTokenBalance: boolean;
  // the balance must be <= the toTokenAccount balance (TODO HE-29 rename to token1Account or similar)
  toTokenBalance: boolean;
};

export type MenuEntry = {
  text: string;
  route: string;
  icon: JSX.Element;
};
