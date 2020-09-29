import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cluster } from "@solana/web3.js";
import React from "react";
import * as WalletAPI from "../../api/wallet";
import { WalletType } from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import { getPools } from "../pool/PoolSlice";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { APIFactory as TokenAPIFactory } from "../../api/token";

const DEFAULT_CLUSTER: Cluster = "devnet";

export const WALLET_SLICE_NAME = "wallet";

export interface WalletsState {
  cluster: Cluster;
  connected: boolean;
  publicKey: string | null;
  type: WalletType;
  tokenAccounts: Array<SerializableTokenAccount>;
}

// The initial wallet state. No wallet is connected yet.
const initialState: WalletsState = {
  cluster: DEFAULT_CLUSTER,
  connected: false,
  publicKey: null,
  type: WalletType.SOLLET,
  tokenAccounts: [],
};

export const WALLET_SLICE_NAME = "wallet";

/**
 * Async action to disconnect from a wallet.
 */
export const disconnect = createAsyncThunk(
  WALLET_SLICE_NAME + "/disconnect",
  WalletAPI.disconnect
);

/**
 * Async action to connect to a wallet. Creates a new wallet instance,
 * connects to it, and connects action dispatchers, when a disconnect event
 * (e.g. the user closes the wallet tab) occurs.
 *
 * The output of the action is the user's public key in Base58 form,
 * so that the user can verify it.
 */
export const connect = createAsyncThunk(
  WALLET_SLICE_NAME + "/connect",
  async (arg, thunkAPI): Promise<string> => {
    const {
      wallet: { cluster, type },
    }: RootState = thunkAPI.getState() as RootState;
    const wallet = await WalletAPI.connect(cluster, type);

    wallet.on("disconnect", () => {
      thunkAPI.dispatch(disconnect());
      thunkAPI.dispatch(addNotification({ message: "Wallet disconnected" }));
    });

    thunkAPI.dispatch(addNotification({ message: "Wallet connected" }));

    // this need to be chained otherwise the loading state will be over randomly
    thunkAPI.dispatch(getOwnedTokens()).then(() => {
      thunkAPI.dispatch(getPools());
    });

    return wallet.pubkey.toBase58();
  }
);

export const send = createAsyncThunk(
  WALLET_SLICE_NAME + "/send",
  async (arg, thunkAPI): Promise<string> => {
    thunkAPI.dispatch(addNotification({ message: "Signing transaction..." }));
    const signature = await WalletAPI.sendDummyTX().catch(
      dispatchErrorNotification(thunkAPI.dispatch)
    );

    thunkAPI.dispatch(
      addNotification({
        message: "Transaction sent",
        options: {
          action: <ViewTxOnExplorer txSignature={signature} />,
        },
      })
    );
    return signature;
  }
);

export const getOwnedTokens = createAsyncThunk(
  WALLET_SLICE_NAME + "/getOwnedTokens",
  async (arg, thunkAPI): Promise<Array<SerializableTokenAccount>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const wallet = WalletAPI.getWallet();
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    if (wallet) {
      const accountsForWallet = await TokenAPI.getAccountsForWallet(wallet);

      return accountsForWallet.map((tokenAccount) => tokenAccount.serialize());
    }
    return [];
  }
);

/**
 * Redux slice containing the reducers for the wallet
 */
export const WALLET_SLICE_NAME = "wallet";
const walletSlice = createSlice({
  name: WALLET_SLICE_NAME,
  initialState,
  reducers: {
    selectCluster: (state, action: PayloadAction<Cluster>) => ({
      ...state,
      cluster: action.payload,
    }),
    selectType: (state, action: PayloadAction<WalletType>) => ({
      ...state,
      type: action.payload,
    }),
  },
  extraReducers: (builder) => {
    // Triggered when the connect async action is completed
    builder.addCase(connect.fulfilled, (state, action) => ({
      ...state,
      publicKey: action.payload,
      connected: true,
    }));
    // Triggered when the disconnect async action is completed
    builder.addCase(disconnect.fulfilled, (state) => ({
      ...state,
      publicKey: null,
      connected: false,
    }));
    builder.addCase(getOwnedTokens.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: action.payload,
    }));
  },
});
export const { selectCluster, selectType } = walletSlice.actions;
export default walletSlice.reducer;
