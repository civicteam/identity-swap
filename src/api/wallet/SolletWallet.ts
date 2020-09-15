import SolletWalletAdapter from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "./Wallet";

const DEFAULT_PROVIDER = "https://www.sollet.io";

export class SolletWallet extends Wallet {
  private solletWallet: SolletWalletAdapter;

  constructor(network: string) {
    super(network);
    this.solletWallet = new SolletWalletAdapter(DEFAULT_PROVIDER, network);

    // once the sollet wallet emits a connect or disconnect event, pass it on
    this.solletWallet.on("connect", () => this.emit("connect"));
    this.solletWallet.on("disconnect", () => this.emit("disconnect"));

    this.solletWallet.connect();
  }

  get pubkey(): PublicKey {
    return this.solletWallet.publicKey;
  }

  disconnect(): void {
    this.solletWallet.disconnect();
  }
}
