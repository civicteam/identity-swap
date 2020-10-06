import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { SerializableToken } from "../../api/token/Token";
import { getPools } from "../pool/PoolSlice";
import { getOwnedTokenAccounts } from "../wallet/WalletSlice";
import { TokenPairState } from "../../utils/types";
import {
  getSortedTokenAccountsByHighestBalance,
  getToAmount,
  selectPoolForTokenPair,
} from "../../utils/tokenPair";

export interface SwapState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
  tokenAccounts: Array<SerializableTokenAccount>;
}

const initialState: SwapState = {
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  availablePools: [],
};

export const SWAP_SLICE_NAME = "swap";

const syncTokenAccounts = (
  swapState: SwapState,
  tokenAccounts: Array<SerializableTokenAccount>
): SwapState => ({
  ...swapState,
  tokenAccounts,
  firstTokenAccount:
    swapState.firstTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", swapState.firstTokenAccount),
      tokenAccounts
    ),
  secondTokenAccount:
    swapState.secondTokenAccount &&
    find(eqProps("address", swapState.secondTokenAccount), tokenAccounts),
});

const syncPools = (
  swapState: SwapState,
  availablePools: Array<SerializablePool>
): SwapState => ({
  ...swapState,
  availablePools,
  selectedPool:
    swapState.selectedPool &&
    find(eqProps("address", swapState.selectedPool), swapState.availablePools),
});

/**
 *
 * For Swap FROM , it should:
 * a) find all token accounts that match the selected token
 * b) filter out all zero-balance token accounts
 * c) select the account with the highest balance from the remaining list.
 * d) if there is no non-zero token account that matches, show an error (invalidate the Token selector and add text saying something like "you have no XYZ tokens in this wallet"
 */
export const selectFirstTokenAccount = (
  token?: SerializableToken,
  tokenAccounts?: Array<SerializableTokenAccount>
): SerializableTokenAccount | undefined => {
  if (!token || !tokenAccounts) return undefined;

  // fetch the pool token account with the highest balance that matches this token
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    token,
    tokenAccounts,
    true
  );

  if (sortedTokenAccounts.length > 0) return sortedTokenAccounts[0].serialize();

  // TODO if there is no non-zero token account that matches, show an error (invalidate the Token selector and add text saying something like "you have no XYZ tokens in this wallet"
  return undefined;
};

/**
 * For Swap TO, it should
 * a) find all token accounts that match the selected token
 * b) select the account with the highest balance from the remaining list (even if zero).
 * If none is found, pass nothing (a token account will be created)
 */
export const selectSecondTokenAccount = (
  token?: SerializableToken,
  tokenAccounts?: Array<SerializableTokenAccount>
): SerializableTokenAccount | undefined => {
  if (!token || !tokenAccounts) return undefined;

  // fetch the pool token account with the highest balance that matches this token
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    token,
    tokenAccounts,
    true
  );

  if (sortedTokenAccounts.length > 0) return sortedTokenAccounts[0].serialize();
  return undefined;
};

const normalize = (swapState: SwapState): SwapState => {
  const firstTokenAccount = selectFirstTokenAccount(
    swapState.firstToken,
    swapState.tokenAccounts
  );
  const secondTokenAccount = selectSecondTokenAccount(
    swapState.secondToken,
    swapState.tokenAccounts
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

    if (
      !serializedFirstTokenAccount ||
      !serializedSecondTokenAccount ||
      !selectedPool
    )
      return "";

    const swapParameters: SwapParameters = {
      fromAccount: TokenAccount.from(serializedFirstTokenAccount),
      toAccount: TokenAccount.from(serializedSecondTokenAccount),
      firstAmount,
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
