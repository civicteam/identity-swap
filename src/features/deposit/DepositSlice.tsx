import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { head } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, DepositParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { getPools } from "../pool/PoolSlice";
import { getOwnedTokenAccounts } from "../wallet/WalletSlice";
import { TokenPairState } from "../../utils/types";
import {
  getSortedTokenAccountsByHighestBalance,
  getToAmount,
  selectPoolForTokenPair,
  syncPools,
  syncTokenAccounts,
  syncTokenAccount,
} from "../../utils/tokenPair";

export type DepositState = TokenPairState;

const initialState: DepositState = {
  availablePools: [],
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
};

export const DEPOSIT_SLICE_NAME = "deposit";

const normalize = (depositState: DepositState): DepositState => {
  const firstTokenAccount = syncTokenAccount(
    depositState.tokenAccounts,
    depositState.firstTokenAccount
  );
  const secondTokenAccount = syncTokenAccount(
    depositState.tokenAccounts,
    depositState.secondTokenAccount
  );

  const selectedPool = selectPoolForTokenPair(
    depositState.availablePools,
    firstTokenAccount,
    secondTokenAccount
  );

  const secondAmount = getToAmount(
    depositState.firstAmount,
    depositState.firstToken,
    selectedPool
  );

  return {
    ...depositState,
    secondAmount,
    selectedPool,
    firstTokenAccount,
    secondTokenAccount,
  };
};

export const executeDeposit = createAsyncThunk(
  DEPOSIT_SLICE_NAME + "/executeDeposit",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      firstTokenAccount: serializedFirstTokenAccount,
      firstAmount: amountToDeposit,
      secondTokenAccount: serializedSecondTokenAccount,
      selectedPool,
      tokenAccounts,
    } = state.deposit;

    const PoolAPI = APIFactory(walletState.cluster);

    if (
      !serializedFirstTokenAccount ||
      !serializedSecondTokenAccount ||
      !selectedPool
    )
      return "";

    // deserialize accounts 1 and 2 and the pool
    const account1 = TokenAccount.from(serializedFirstTokenAccount);
    const account2 = TokenAccount.from(serializedSecondTokenAccount);
    const pool = Pool.from(selectedPool);

    // work out whether account1 is A or B in the pool
    const isReverse = pool.tokenA.sameToken(account2);
    const [fromAAccount, fromBAccount] = isReverse
      ? [account2, account1]
      : [account1, account2];
    const fromAAmount = isReverse
      ? pool.calculateTokenAAmount(amountToDeposit, false)
      : amountToDeposit;

    // fetch the pool token account with the highest balance that matches this pool
    const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
      pool.poolToken,
      tokenAccounts.map(TokenAccount.from),
      true
    );
    const poolTokenAccount = head(sortedTokenAccounts);

    const depositParameters: DepositParameters = {
      fromAAccount,
      fromBAccount,
      fromAAmount,
      poolTokenAccount,
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

    thunkAPI.dispatch(getOwnedTokenAccounts());
    thunkAPI.dispatch(getPools());

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
    builder.addCase(getOwnedTokenAccounts.fulfilled, (state, action) =>
      syncTokenAccounts(state, action.payload)
    );

    builder.addCase(getPools.fulfilled, (state, action) =>
      syncPools(state, action.payload)
    );
  },
});

export const { updateDepositState } = depositSlice.actions;
export default depositSlice.reducer;
