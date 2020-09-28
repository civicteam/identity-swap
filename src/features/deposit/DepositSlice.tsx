import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { APIFactory, DepositParameters } from "../../api/pool";
import { APIFactory as TokenAPIFactory } from "../../api/token/";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { SerializableToken, Token } from "../../api/token/Token";

export interface DepositState {
  fromTokenAccount?: SerializableTokenAccount;
  fromAmount: number;
  toTokenAccount?: SerializableTokenAccount;
  toAmount: number;
  tokenAccounts: Array<SerializableTokenAccount>;
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
}
const initialState: DepositState = {
  tokenAccounts: [],
  availablePools: [],
  fromAmount: 0,
  toAmount: 0,
};

const getToAmount = (
  fromAmount: number,
  fromSerializableToken?: SerializableToken,
  serializablePool?: SerializablePool
) => {
  if (!serializablePool || !fromSerializableToken) return 0;

  const pool = Pool.from(serializablePool);
  const fromToken = Token.from(fromSerializableToken);
  return pool.calculateSwappedAmount(fromToken, fromAmount);
};

export const DEPOSIT_SLICE_NAME = "deposit";
export const getOwnedTokens = createAsyncThunk(
  DEPOSIT_SLICE_NAME + "/getOwnedTokens",
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

const matches = (
  fromTokenAccount: TokenAccount,
  toTokenAccount: TokenAccount
) => (pool: Pool): boolean => pool.matches(fromTokenAccount, toTokenAccount);

export const selectPoolForTokenPair = createAsyncThunk(
  DEPOSIT_SLICE_NAME + "/selectPoolForTokenPair",
  async (arg, thunkAPI): Promise<SerializablePool | null> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const {
      fromTokenAccount: serializedFromTokenAccount,
      toTokenAccount: serializedToTokenAccount,
    } = state.deposit;
    if (!serializedFromTokenAccount || !serializedToTokenAccount) return null;

    const fromTokenAccount = TokenAccount.from(serializedFromTokenAccount);
    const toTokenAccount = TokenAccount.from(serializedToTokenAccount);

    const pools = state.pool.availablePools.map((serializedPool) =>
      Pool.from(serializedPool)
    );
    const foundPool =
      pools.find(matches(fromTokenAccount, toTokenAccount)) || null;
    return foundPool && foundPool.serialize();
  }
);

export const executeDeposit = createAsyncThunk(
  DEPOSIT_SLICE_NAME + "/executeDeposit",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      fromTokenAccount: serializedFromTokenAccount,
      fromAmount,
      toTokenAccount: serializedToTokenAccount,
      selectedPool,
    } = state.deposit;
    const wallet = WalletAPI.getWallet();

    const PoolAPI = APIFactory(walletState.cluster);

    if (
      !serializedFromTokenAccount ||
      !serializedToTokenAccount ||
      !wallet ||
      !selectedPool
    )
      return "";

    const pool = Pool.from(selectedPool);
    // TODO how to select the pool token account for this user?
    const depositParameters: DepositParameters = {
      fromAAccount: TokenAccount.from(serializedFromTokenAccount),
      fromBAccount: TokenAccount.from(serializedToTokenAccount),
      fromAAmount: fromAmount,
      wallet,
      pool,
    };

    const transactionSignature = await PoolAPI.deposit(depositParameters).catch(
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

const normalize = (depositState: DepositState): DepositState => {
  const toAmount = getToAmount(
    depositState.fromAmount,
    depositState.fromTokenAccount?.mint,
    depositState.selectedPool
  );

  return {
    ...depositState,
    toAmount,
  };
};

const depositSlice = createSlice({
  name: DEPOSIT_SLICE_NAME,
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

    updateDepositState: (state, action: PayloadAction<Partial<DepositState>>) =>
      normalize({
        ...state,
        ...action.payload,
      }),
  },
  extraReducers: (builder) => {
    builder.addCase(executeDeposit.fulfilled, (state) => ({
      ...state,
    }));
    builder.addCase(getOwnedTokens.fulfilled, (state, action) => ({
      ...state,
      tokenAccounts: action.payload,
    }));
    builder.addCase(selectPoolForTokenPair.fulfilled, (state, action) => ({
      ...state,
      selectedPool: action.payload || undefined,
    }));
  },
});

export const {
  selectFromTokenAccount,
  selectToTokenAccount,
  setFromAmount,
  setToAmount,
} = depositSlice.actions;
export default depositSlice.reducer;
