import { Cluster } from "@solana/web3.js";
import { SerializableToken, Token } from "../api/token/Token";
import { SerializablePool } from "../api/pool/Pool";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";

export type HasEqual<T> = { equals: (other: T) => boolean };

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
  poolTokenAccount?: SerializableTokenAccount;
  slippage?: number;
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

// Web3 does not recognise "localnet" as a cluster
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
  route?: string;
  action?: () => void;
  icon: JSX.Element;
};
