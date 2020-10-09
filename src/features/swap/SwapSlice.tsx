import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { getPools } from "../pool/PoolSlice";
import { getOwnedTokenAccounts } from "../wallet/WalletSlice";
import { TokenPairState } from "../../utils/types";
import {
  getToAmount,
  selectPoolForTokenPair,
  syncPools,
  syncTokenAccount,
  syncTokenAccounts,
} from "../../utils/tokenPair";

export type SwapState = TokenPairState;

const initialState: SwapState = {
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  availablePools: [],
};

export const SWAP_SLICE_NAME = "swap";

const normalize = (swapState: SwapState): SwapState => {
  const firstTokenAccount = syncTokenAccount(
    swapState.tokenAccounts,
    swapState.firstTokenAccount
  );
  const secondTokenAccount = syncTokenAccount(
    swapState.tokenAccounts,
    swapState.secondTokenAccount
  );

  const selectedPool = selectPoolForTokenPair(
    swapState.availablePools,
    firstTokenAccount,
    secondTokenAccount
  );

  const secondAmount = getToAmount(
    swapState.firstAmount,
    swapState.firstToken,
    selectedPool
  );

  return {
    ...swapState,
    secondAmount,
    selectedPool,
    firstTokenAccount,
    secondTokenAccount,
  };
};

export const executeSwap = createAsyncThunk(
  SWAP_SLICE_NAME + "/executeSwap",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      firstTokenAccount: serializedFirstTokenAccount,
      firstAmount,
      secondTokenAccount: serializedSecondTokenAccount,
      selectedPool,
    } = state.swap;
    const PoolAPI = APIFactory(walletState.cluster);

    if (!serializedFirstTokenAccount || !selectedPool) return "";

    const swapParameters: SwapParameters = {
      fromAccount: TokenAccount.from(serializedFirstTokenAccount),
      toAccount:
        serializedSecondTokenAccount &&
        TokenAccount.from(serializedSecondTokenAccount),
      fromAmount: firstAmount,
      pool: Pool.from(selectedPool),
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

    thunkAPI.dispatch(getOwnedTokenAccounts());
    thunkAPI.dispatch(getPools());

    return transactionSignature;
  }
);

const swapSlice = createSlice({
  name: SWAP_SLICE_NAME,
  initialState,
  reducers: {
    selectFirstTokenAccount: (
      state,
      action: PayloadAction<SerializableTokenAccount>
    ) => ({
      ...state,
      firstTokenAccount: action.payload,
    }),
    selectSecondTokenAccount: (
      state,
      action: PayloadAction<SerializableTokenAccount>
    ) => ({
      ...state,
      secondTokenAccount: action.payload,
    }),
    setFromAmount: (state, action: PayloadAction<number>) => ({
      ...state,
      firstAmount: action.payload,
    }),
    setToAmount: (state) => ({
      ...state,
      secondAmount: getToAmount(
        state.firstAmount,
        state.firstTokenAccount?.mint,
        state.selectedPool
      ),
    }),

    updateSwapState: (state, action: PayloadAction<Partial<SwapState>>) =>
      normalize({
        ...state,
        ...action.payload,
      }),
  },
  extraReducers: (builder) => {
    builder.addCase(getOwnedTokenAccounts.fulfilled, (state, action) =>
      syncTokenAccounts(state, action.payload)
    );

    builder.addCase(getPools.fulfilled, (state, action) =>
      syncPools(state, action.payload)
    );
  },
});

export const { updateSwapState } = swapSlice.actions;
export default swapSlice.reducer;
