declare module "@project-serum/sol-wallet-adapter" {
  import EventEmitter = NodeJS.EventEmitter;
  import { PublicKey } from "@solana/web3.js";

  class Wallet extends EventEmitter {
    constructor(providerUrl: string, network: string);
    connect(): Promise<void>;
    disconnect(): void;
    publicKey: PublicKey;
  }

  export = Wallet;
}
