import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { APIFactory, DepositParameters } from "../../api/pool";
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

export interface DepositState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
}

const initialState: DepositState = {
  availablePools: [],
  fromAmount: 0,
  toAmount: 0,
};

export const DEPOSIT_SLICE_NAME = "deposit";

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

const matchesPool = (
  fromTokenAccount: TokenAccount,
  toTokenAccount: TokenAccount
) => (pool: Pool): boolean => pool.matches(fromTokenAccount, toTokenAccount);

const syncTokenAccounts = (
  depositState: DepositState,
  tokenAccounts: Array<SerializableTokenAccount>
): DepositState => ({
  ...depositState,
  fromTokenAccount:
    depositState.fromTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", depositState.fromTokenAccount),
      tokenAccounts
    ),
  toTokenAccount:
    depositState.toTokenAccount &&
    find(eqProps("address", depositState.toTokenAccount), tokenAccounts),
});

const syncPools = (
  depositState: DepositState,
  availablePools: Array<SerializablePool>
): DepositState => ({
  ...depositState,
  availablePools,
  selectedPool:
    depositState.selectedPool &&
    find(
      eqProps("address", depositState.selectedPool),
      depositState.availablePools
    ),
});

const selectPoolForTokenPair = (
  state: DepositState
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

const normalize = (depositState: DepositState): DepositState => {
  const selectedPool = selectPoolForTokenPair(depositState);

  const toAmount = getToAmount(
    depositState.fromAmount,
    depositState.fromTokenAccount?.mint,
    selectedPool
  );

  return {
    ...depositState,
    toAmount,
    selectedPool,
  };
};

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

const depositSlice = createSlice({
  name: DEPOSIT_SLICE_NAME,
  initialState,
  reducers: {
    updateDepositState: (state, action: PayloadAction<Partial<DepositState>>) =>
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

export const { updateDepositState } = depositSlice.actions;
export default depositSlice.reducer;
