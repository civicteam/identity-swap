import EventEmitter from "eventemitter3";
import { PublicKey } from "@solana/web3.js";

export abstract class Wallet extends EventEmitter {
  private network: string;

  constructor(network: string) {
    super();
    this.network = network;
  }

  abstract get pubkey(): PublicKey;

  abstract disconnect(): void;
}
