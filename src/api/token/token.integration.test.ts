import { Account } from "@solana/web3.js";
import * as WalletAPI from "../wallet/";
import { WalletType } from "../wallet/";
import { Wallet } from "../wallet/Wallet";
import { airdropTo } from "../../../test/utils/account";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { Token } from "./Token";
import { TokenAccount } from "./TokenAccount";
import { APIFactory } from "./index";

// Increase timeout for tests that send transactions
jest.setTimeout(240000);

const CLUSTER: ExtendedCluster = "localnet";
const API = APIFactory(CLUSTER);

describe("api/token integration test", () => {
  let wallet: Wallet;
  let token: Token;
  let tokenAccount: TokenAccount;

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);

    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
  });

  describe("createToken", () => {
    it("should create a token with the current wallet as the minter", async () => {
      token = await API.createToken(wallet);

      expect(token.mintAuthority).toEqual(wallet.pubkey);
    });

    it("should create a token with a different account as the minter", async () => {
      const mintAccount = new Account();

      const tokenWithExternalMinter = await API.createToken(
        wallet,
        mintAccount.publicKey
      );

      expect(tokenWithExternalMinter.mintAuthority).toEqual(
        mintAccount.publicKey
      );
    });
  });

  describe("createAccountForToken", () => {
    it("should create an account on the token", async () => {
      tokenAccount = await API.createAccountForToken(wallet, token);

      const walletAccounts = await API.getAccountsForToken(wallet, token);

      expect(walletAccounts).toEqual([tokenAccount]);
    });
  });

  describe("mint", () => {
    it("should mint tokens to the token account", async () => {
      const amount = 100;
      await API.mintTo(wallet, tokenAccount, amount);

      tokenAccount = (await API.tokenAccountInfo(
        tokenAccount.address
      )) as TokenAccount;

      expect(tokenAccount.balance).toEqual(amount);
    });
  });

  describe("getAccountsForToken", () => {
    it("should find the token account", async () => {
      const foundAccounts = await API.getAccountsForToken(wallet, token);
      expect(foundAccounts[0]).toEqual(tokenAccount);
    });
  });

  describe("getAccountsForWallet", () => {
    it("should include the token account", async () => {
      const foundAccounts = await API.getAccountsForWallet(wallet);
      expect(foundAccounts).toContainEqual(tokenAccount);
    });
  });
});
