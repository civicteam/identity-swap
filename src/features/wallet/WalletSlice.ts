import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Loadable } from "../../utils/types";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { addNotification } from "../notification/NotificationSlice";
import { Cluster } from "@solana/web3.js";

export interface WalletsState extends Loadable {
  cluster: Cluster;
  connected: boolean;
  publicKey: string | null;
}

const initialState: WalletsState = {
  cluster: "devnet",
  connected: false,
  publicKey: null,
  loading: false,
  error: null,
};

const disconnectActions = () => WalletAPI.disconnect();

export const connect = createAsyncThunk(
  "wallet/connect",
  async (arg, thunkAPI): Promise<string> => {
    const {
      wallet: { cluster },
    }: RootState = thunkAPI.getState() as RootState;
    const wallet = await WalletAPI.connect(cluster);

    wallet.on("disconnect", () => {
      disconnectActions();
      thunkAPI.dispatch(addNotification({ message: "Wallet disconnected" }));
    });

    thunkAPI.dispatch(addNotification({ message: "Wallet connected" }));

    return wallet.pubkey.toBase58();
  }
);

export const disconnect = createAsyncThunk("wallet/disconnect", () =>
  disconnectActions()
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(connect.fulfilled, (state, action) => ({
      ...state,
      publicKey: action.payload,
      connected: true,
    }));
    builder.addCase(disconnect.fulfilled, (state) => ({
      ...state,
      publicKey: null,
      connected: false,
    }));
  },
});
export default walletSlice.reducer;
