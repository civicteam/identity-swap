import EventEmitter from "eventemitter3";
import { PublicKey, Transaction } from "@solana/web3.js";

export enum WalletEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
}

/**
 * Abstract wallet implmentation. Any wallet connection,
 * e.g. browser extension, hardware wallet, web wallet etc,
 * is a separate implementation of this.
 */
export abstract class Wallet extends EventEmitter {
  private network: string;

  constructor(network: string) {
    super();
    this.network = network;
  }

  abstract get pubkey(): PublicKey;

  abstract disconnect(): void;

  abstract signTransaction(transaction: Transaction): Promise<Transaction>;
}
