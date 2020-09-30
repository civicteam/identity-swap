import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { SerializableToken, Token } from "../../api/token/Token";
import { getPools } from "../pool/PoolSlice";
import { getOwnedTokens } from "../wallet/WalletSlice";
import { TokenPairState } from "../../utils/types";

export interface SwapState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
}

const initialState: SwapState = {
  availablePools: [],
  fromAmount: 0,
  toAmount: 0,
};

export const SWAP_SLICE_NAME = "swap";

const getToAmount = (
  fromAmount: number,
  fromSerializableToken?: SerializableToken,
  serializablePool?: SerializablePool
) => {
  if (!serializablePool || !fromSerializableToken) return 0;

  const pool = Pool.from(serializablePool);
  const fromToken = Token.from(fromSerializableToken);
  return pool.calculateAmountInOtherToken(fromToken, fromAmount);
};

const matchesPool = (
  fromTokenAccount: TokenAccount,
  toTokenAccount: TokenAccount
) => (pool: Pool): boolean => pool.matches(fromTokenAccount, toTokenAccount);

const syncTokenAccounts = (
  swapState: SwapState,
  tokenAccounts: Array<SerializableTokenAccount>
): SwapState => ({
  ...swapState,
  fromTokenAccount:
    swapState.fromTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", swapState.fromTokenAccount),
      tokenAccounts
    ),
  toTokenAccount:
    swapState.toTokenAccount &&
    find(eqProps("address", swapState.toTokenAccount), tokenAccounts),
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

const selectPoolForTokenPair = (
  state: SwapState
): SerializablePool | undefined => {
  const {
    fromTokenAccount: serializedFromTokenAccount,
    toTokenAccount: serializedToTokenAccount,
  } = state;

  if (!serializedFromTokenAccount || !serializedToTokenAccount)
    return undefined;

  const fromTokenAccount = TokenAccount.from(serializedFromTokenAccount);
  const toTokenAccount = TokenAccount.from(serializedToTokenAccount);

  const pools = state.availablePools.map(Pool.from);
  const foundPool = pools.find(matchesPool(fromTokenAccount, toTokenAccount));
  return foundPool && foundPool.serialize();
};

const normalize = (swapState: SwapState): SwapState => {
  const selectedPool = selectPoolForTokenPair(swapState);

  const toAmount = getToAmount(
    swapState.fromAmount,
    swapState.fromTokenAccount?.mint,
    selectedPool
  );

  return {
    ...swapState,
    toAmount,
    selectedPool,
  };
};

export const executeSwap = createAsyncThunk(
  SWAP_SLICE_NAME + "/executeSwap",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      fromTokenAccount: serializedFromTokenAccount,
      fromAmount,
      toTokenAccount: serializedToTokenAccount,
      selectedPool,
    } = state.swap;
    const wallet = WalletAPI.getWallet();

    const PoolAPI = APIFactory(walletState.cluster);

    if (
      !serializedFromTokenAccount ||
      !serializedToTokenAccount ||
      !wallet ||
      !selectedPool
    )
      return "";

    const swapParameters: SwapParameters = {
      fromAccount: TokenAccount.from(serializedFromTokenAccount),
      toAccount: TokenAccount.from(serializedToTokenAccount),
      wallet,
      fromAmount,
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

    thunkAPI.dispatch(getOwnedTokens());
    thunkAPI.dispatch(getPools());

    return transactionSignature;
  }
);

const swapSlice = createSlice({
  name: SWAP_SLICE_NAME,
  initialState,
  reducers: {
    selectFromTokenAccount: (
      state,
      action: PayloadAction<SerializableTokenAccount>
    ) => ({
      ...state,
      fromTokenAccount: action.payload,
    }),
    selectToTokenAccount: (
      state,
      action: PayloadAction<SerializableTokenAccount>
    ) => ({
      ...state,
      toTokenAccount: action.payload,
    }),
    setFromAmount: (state, action: PayloadAction<number>) => ({
      ...state,
      fromAmount: action.payload,
    }),
    setToAmount: (state) => ({
      ...state,
      toAmount: getToAmount(
        state.fromAmount,
        state.fromTokenAccount?.mint,
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
    builder.addCase(getOwnedTokens.fulfilled, (state, action) =>
      syncTokenAccounts(state, action.payload)
    );

    builder.addCase(getPools.fulfilled, (state, action) =>
      syncPools(state, action.payload)
    );
  },
});

export const { updateSwapState } = swapSlice.actions;
export default swapSlice.reducer;
