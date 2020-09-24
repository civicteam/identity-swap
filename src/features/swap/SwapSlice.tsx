import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { Loadable } from "../../utils/types";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import {
  APIFactory as TokenAPIFactory,
  SerializableToken,
  toDeserializedVersion,
} from "../../api/token/";
import { Pool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";

// TODO resolve the serialization middleware
let selectedPool: Pool;

interface SwapState extends Loadable {
  fromToken?: SerializableToken;
  fromAmount: number;
  toToken?: SerializableToken;
  toAmount: number;
  tokens: Array<SerializableToken>;
  poolAddress: string | null;
  poolRate: number | null;
  poolLiquidity: number | null;
}

const initialState: SwapState = {
  tokens: [],
  fromAmount: 0,
  toAmount: 0,
  loading: false,
  error: null,
  poolAddress: null,
  poolRate: null,
  poolLiquidity: null,
};

export const getOwnedTokens = createAsyncThunk(
  "swap/getOwnedTokens",
  async (arg, thunkAPI): Promise<Array<SerializableToken>> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const wallet = WalletAPI.getWallet();
    const TokenAPI = TokenAPIFactory(walletState.cluster);

    if (wallet) {
      return TokenAPI.getOwnedTokens(wallet, walletState.cluster.toString());
    }
    return [];
  }
);

export const selectPoolForTokenPair = createAsyncThunk(
  "swap/selectPoolForTokenPair",
  async (
    arg,
    thunkAPI
  ): Promise<{
    poolAddress: string | null;
    poolRate: number | null;
    poolLiquidity: number | null;
  } | null> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const { fromToken, toToken } = state.swap;
    const walletState = state.wallet;

    const PoolAPI = APIFactory(walletState.cluster);
    const pools = await PoolAPI.getPools(false);

    if (fromToken && toToken) {
      for (const pool of pools) {
        if (
          pool.tokenA.mint.address.toBase58() === fromToken.mint &&
          pool.tokenB.mint.address.toBase58() === toToken.mint
        ) {
          selectedPool = pool;
          return {
            poolAddress: pool.address.toBase58(),
            poolRate: pool.getRate(),
            poolLiquidity: pool.getLiquidity(),
          };
        }
      }
    }

    return null;
  }
);

export const executeSwap = createAsyncThunk(
  "swap/executeSwap",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const { fromToken, fromAmount, toToken } = state.swap;
    const wallet = WalletAPI.getWallet();

    const PoolAPI = APIFactory(walletState.cluster);

    if (!fromToken || !toToken || !wallet) return "";

    const swapParameters: SwapParameters = {
      fromAccount: toDeserializedVersion(fromToken),
      toAccount: toDeserializedVersion(toToken),
      wallet,
      fromAmount,
      pool: selectedPool,
    };

    const transactionSignature = await PoolAPI.swap(swapParameters).catch(
      dispatchErrorNotification(thunkAPI.dispatch)
    );
    thunkAPI.dispatch(
      addNotification({
        message: "Transaction sent",
        options: {
          action: <ViewTxOnExplorer txSignature={transactionSignature} />,
        },
      })
    );

    return transactionSignature;
  }
);

const swapSlice = createSlice({
  name: "pool",
  initialState,
  reducers: {
    selectFromToken: (state, action: PayloadAction<SerializableToken>) => ({
      ...state,
      fromToken: action.payload,
    }),
    selectToToken: (state, action: PayloadAction<SerializableToken>) => ({
      ...state,
      toToken: action.payload,
    }),
    setFromAmount: (state, action: PayloadAction<number>) => ({
      ...state,
      fromAmount: action.payload,
    }),
    setToAmount: (state) => ({
      ...state,
      toAmount: (state.poolRate || 0) * state.fromAmount,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(selectPoolForTokenPair.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(executeSwap.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(executeSwap.rejected, (state) => ({
      ...state,
      loading: false,
    }));
    builder.addCase(getOwnedTokens.rejected, (state) => ({
      ...state,
      loading: false,
    }));
    builder.addCase(executeSwap.fulfilled, (state) => ({
      ...state,
      loading: false,
    }));
    builder.addCase(getOwnedTokens.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(getOwnedTokens.fulfilled, (state, action) => ({
      ...state,
      tokens: action.payload,
      loading: false,
    }));
    builder.addCase(selectPoolForTokenPair.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      poolAddress: action.payload ? action.payload.poolAddress : null,
      poolRate: action.payload ? action.payload.poolRate : null,
      poolLiquidity: action.payload ? action.payload.poolLiquidity : null,
    }));
  },
});

export const {
  selectFromToken,
  selectToToken,
  setFromAmount,
  setToAmount,
} = swapSlice.actions;
export default swapSlice.reducer;
