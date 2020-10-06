import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cluster } from "@solana/web3.js";
import * as WalletAPI from "../../api/wallet";
import { WalletType } from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { addNotification } from "../notification/NotificationSlice";
import { getPools } from "../pool/PoolSlice";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { APIFactory as TokenAPIFactory } from "../../api/token";
import { getAvailableTokens } from "../GlobalSlice";

const DEFAULT_CLUSTER: Cluster = "testnet";

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
      thunkAPI.dispatch(
        addNotification({ message: "notification.info.walletDisconnected" })
      );
    });

    thunkAPI.dispatch(
      addNotification({ message: "notification.info.walletConnected" })
    );

    thunkAPI.dispatch(getOwnedTokenAccounts());
    // we have to wait getting the pools, otherwise the call to fill the tokens will be wrong
    await thunkAPI.dispatch(getPools());
    thunkAPI.dispatch(getAvailableTokens());

    return wallet.pubkey.toBase58();
  }
);

export const getOwnedTokenAccounts = createAsyncThunk(
  WALLET_SLICE_NAME + "/getOwnedTokenAccounts",
  async (arg, thunkAPI): Promise<Array<SerializableTokenAccount>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    return accountsForWallet.map((tokenAccount) => tokenAccount.serialize());
  }
);

/**
 * Redux slice containing the reducers for the wallet
 */
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
    builder.addCase(getOwnedTokenAccounts.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: action.payload,
    }));
  },
});
export const { selectCluster, selectType } = walletSlice.actions;
export default walletSlice.reducer;
