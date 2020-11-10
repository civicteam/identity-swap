import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Cluster } from "@solana/web3.js";
import * as WalletAPI from "../../api/wallet";
import { WalletType } from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { getPools } from "../pool/PoolSlice";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { APIFactory as TokenAPIFactory } from "../../api/token";
import { getAvailableTokens, updateEpochInfo } from "../GlobalSlice";
import { updateEntityArray } from "../../utils/tokenPair";
import { WalletEvent } from "../../api/wallet/Wallet";
import { notify, notifyTransaction } from "../../components/notify";
import { listenToEpoch } from "../../api/connection";
import { getIdentities } from "../identity/IdentitySlice";

export const DEFAULT_CLUSTER: Cluster = "devnet";
export const WALLET_SLICE_NAME = "wallet";

/**
 * If true, listen to epoch updates from the chain.
 * Disabled by default due to performance concerns.
 */
const EPOCH_LISTENING_ENABLED = false;

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
  () => {
    WalletAPI.disconnect();
    notify("notification.info.walletDisconnected", { type: "info" });
  }
);

export const getOwnedTokenAccounts = createAsyncThunk(
  WALLET_SLICE_NAME + "/getOwnedTokenAccounts",
  async (arg, thunkAPI): Promise<Array<SerializableTokenAccount>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    const accountsForWallet = await TokenAPI.getAccountsForWallet();

    TokenAPI.listenToTokenAccountChanges(accountsForWallet, (tokenAccount) => {
      thunkAPI.dispatch(updateAccount(tokenAccount.serialize()));
    });

    return accountsForWallet.map((tokenAccount) => tokenAccount.serialize());
  }
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

    wallet.on(WalletEvent.DISCONNECT, () => {
      thunkAPI.dispatch(disconnect());
      notify("notification.info.walletDisconnected", { type: "info" });
    });

    wallet.on(WalletEvent.CONFIRMED, ({ transactionSignature }) =>
      notifyTransaction(transactionSignature)
    );

    notify("notification.info.walletConnected", { type: "info" });

    if (EPOCH_LISTENING_ENABLED) {
      // start subscription to epoch info events
      listenToEpoch(cluster, (epochInfo) => {
        thunkAPI.dispatch(updateEpochInfo(epochInfo));
      });
    }

    // Get tokens first before getting accounts and pools,
    // to avail of the token caching feature
    await thunkAPI.dispatch(getAvailableTokens());
    thunkAPI.dispatch(getOwnedTokenAccounts());
    thunkAPI.dispatch(getPools());
    thunkAPI.dispatch(getIdentities());

    return wallet.pubkey.toBase58();
  }
);

const updateAccountReducer = (
  state: Draft<WalletsState>,
  action: PayloadAction<SerializableTokenAccount>
) => {
  // find and replace the pool in the list with the pool in the action
  const updatedAccounts = updateEntityArray(
    TokenAccount.from(action.payload),
    state.tokenAccounts.map(TokenAccount.from)
  );

  return {
    ...state,
    tokenAccounts: updatedAccounts.map((account) => account.serialize()),
  };
};

/**
 * Redux slice containing the reducers for the wallet
 */
const walletSlice = createSlice({
  name: WALLET_SLICE_NAME,
  initialState,
  reducers: {
    updateAccount: updateAccountReducer,
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
export const { selectCluster, selectType, updateAccount } = walletSlice.actions;
export default walletSlice.reducer;
