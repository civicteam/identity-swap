import { OptionsObject, SnackbarKey } from "notistack";
import { Optional } from "utility-types";
import { Cluster } from "@solana/web3.js";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";
import { SerializableToken, Token } from "../api/token/Token";
import { SerializablePool } from "../api/pool/Pool";

export interface TokenPairState {
  firstTokenAccount?: SerializableTokenAccount;
  firstToken?: SerializableToken;
  firstAmount: number;
  secondTokenAccount?: SerializableTokenAccount;
  secondToken?: SerializableToken;
  secondAmount: number;
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
  tokenAccounts: Array<SerializableTokenAccount>;
}

// Represents an update to the state. Contains non-serializeable objects that must be
// serialized before being added to the TokenPairState
export interface TokenPairUpdate {
  firstToken?: Token;
  secondToken?: Token;
  firstTokenAccount?: TokenAccount;
  firstAmount: number;
  secondTokenAccount?: TokenAccount;
  secondAmount: number;
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
  // the balance must be <= the firstTokenAccount balance (TODO HE-29 rename to token1Account or similar)
  firstTokenBalance: boolean;
  // the balance must be <= the secondTokenAccount balance (TODO HE-29 rename to token1Account or similar)
  secondTokenBalance: boolean;
};

export type MenuEntry = {
  text: string;
  route: string;
  icon: JSX.Element;
};
