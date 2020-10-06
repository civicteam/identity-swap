import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, WithdrawalParameters } from "../../api/pool";
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

export interface WithdrawalState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
  tokenAccounts: Array<SerializableTokenAccount>;
}

const initialState: WithdrawalState = {
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  availablePools: [],
};

export const WITHDRAWAL_SLICE_NAME = "withdrawal";

const syncTokenAccounts = (
  withdrawState: WithdrawalState,
  tokenAccounts: Array<SerializableTokenAccount>
): WithdrawalState => ({
  ...withdrawState,
  tokenAccounts,
  firstTokenAccount:
    withdrawState.firstTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", withdrawState.firstTokenAccount),
      tokenAccounts
    ),
  secondTokenAccount:
    withdrawState.secondTokenAccount &&
    find(eqProps("address", withdrawState.secondTokenAccount), tokenAccounts),
});

const syncPools = (
  withdrawalState: WithdrawalState,
  availablePools: Array<SerializablePool>
): WithdrawalState => ({
  ...withdrawalState,
  availablePools,
  selectedPool:
    withdrawalState.selectedPool &&
    find(
      eqProps("address", withdrawalState.selectedPool),
      withdrawalState.availablePools
    ),
});

/**
 * Logic to select tokens in Withdrawal (both), it should
 * a) find all token accounts that match the selected token
 * b) select the account with the highest balance from the remaining list (even if zero).
 * If none is found, pass nothing (a token account will be created)
 */
export const selectTokenAccount = (
  token?: SerializableToken,
  tokenAccounts?: Array<SerializableTokenAccount>
): SerializableTokenAccount | undefined => {
  if (!token || !tokenAccounts) return undefined;

  // fetch the pool token account with the highest balance that matches this token
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    token,
    tokenAccounts,
    false
  );

  if (sortedTokenAccounts.length > 0) return sortedTokenAccounts[0].serialize();
  return undefined;
};

const normalize = (withdrawalState: WithdrawalState): WithdrawalState => {
  const firstTokenAccount = selectTokenAccount(
    withdrawalState.firstToken,
    withdrawalState.tokenAccounts
  );
  const secondTokenAccount = selectTokenAccount(
    withdrawalState.secondToken,
    withdrawalState.tokenAccounts
  );

  const selectedPool = selectPoolForTokenPair(
    withdrawalState.availablePools,
    firstTokenAccount,
    secondTokenAccount
  );

  const secondAmount = getToAmount(
    withdrawalState.firstAmount,
    withdrawalState.firstToken,
    selectedPool
  );

  return {
    ...withdrawalState,
    secondAmount,
    selectedPool,
    firstTokenAccount,
    secondTokenAccount,
  };
};

export const executeWithdrawal = createAsyncThunk(
  WITHDRAWAL_SLICE_NAME + "/executeWithdrawal",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      firstTokenAccount: serializedFirstTokenAccount,
      secondTokenAccount: serializedSecondTokenAccount,
      selectedPool,
      firstAmount: amountToWithdraw,
      tokenAccounts,
    } = state.withdraw;
    const PoolAPI = APIFactory(walletState.cluster);

    if (!selectedPool) return "";

    // TODO HE-29 will remove the from/to TokenAccount confusion
    // deserialize accounts 1 and 2 (if present) and the pool
    const account1 =
      serializedFirstTokenAccount &&
      TokenAccount.from(serializedFirstTokenAccount);
    const account2 =
      serializedSecondTokenAccount &&
      TokenAccount.from(serializedSecondTokenAccount);
    const pool = Pool.from(selectedPool);

    // work out whether account1 is A or B in the pool
    const isReverse =
      (account1 && pool.tokenB.sameToken(account1)) ||
      (account2 && pool.tokenA.sameToken(account2));
    const toAAccount = isReverse ? account2 : account1;
    const toBAccount = isReverse ? account1 : account2;
    // TODO HE-29 Inside the components, the max amount should be set
    // and prevent this from ever being higher than poolTokenAccount.balance
    // later, we may allow combining of multiple pool token accounts, in one transaction
    const poolTokenAmount = isReverse
      ? pool.getPoolTokenValueOfTokenBAmount(amountToWithdraw)
      : pool.getPoolTokenValueOfTokenAAmount(amountToWithdraw);

    // fetch the pool token account with the highest balance that matches this pool
    const sortedPoolTokenAccounts = tokenAccounts
      .map(TokenAccount.from)
      .filter(
        (tokenAccount) =>
          tokenAccount.mint.equals(pool.poolToken) && tokenAccount.balance > 0
      )
      .sort((a1, a2) => a2.balance - a1.balance);

    if (!sortedPoolTokenAccounts.length)
      throw Error("notification.error.noPoolTokenAccount");

    const poolTokenAccount = sortedPoolTokenAccounts[0];
    const withdrawalParameters: WithdrawalParameters = {
      fromPoolTokenAccount: poolTokenAccount,
      fromPoolTokenAmount: poolTokenAmount,
      toAAccount,
      toBAccount,
      pool: Pool.from(selectedPool),
    };

    const transactionSignature = await PoolAPI.withdraw(
      withdrawalParameters
    ).catch(dispatchErrorNotification(thunkAPI.dispatch));
    thunkAPI.dispatch(
      addNotification({
        message: "notification.info.transactionSent",
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

const withdrawSlice = createSlice({
  name: WITHDRAWAL_SLICE_NAME,
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

    updateWithdrawalState: (
      state,
      action: PayloadAction<Partial<WithdrawalState>>
    ) =>
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

export const {
  updateWithdrawalState,
  selectSecondTokenAccount,
  selectFirstTokenAccount,
} = withdrawSlice.actions;
export default withdrawSlice.reducer;
