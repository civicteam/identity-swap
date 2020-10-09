import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, WithdrawalParameters } from "../../api/pool";
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
  selectTokenAccount,
  syncPools,
  syncTokenAccount,
  syncTokenAccounts as syncTokenPairTokenAccounts,
} from "../../utils/tokenPair";
import { Token } from "../../api/token/Token";

export interface WithdrawalState extends TokenPairState {
  fromPoolTokenAccount?: SerializableTokenAccount;
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
  ...syncTokenPairTokenAccounts(withdrawState, tokenAccounts),
  fromPoolTokenAccount: syncTokenAccount(
    tokenAccounts,
    withdrawState.fromPoolTokenAccount
  ),
});

const normalize = (withdrawalState: WithdrawalState): WithdrawalState => {
  const firstTokenAccount = syncTokenAccount(
    withdrawalState.tokenAccounts,
    withdrawalState.firstTokenAccount
  );
  const secondTokenAccount = syncTokenAccount(
    withdrawalState.tokenAccounts,
    withdrawalState.secondTokenAccount
  );

  // TODO HE-53 The pool should be selected by the tokens,
  // not the token accounts (which may not exist)
  const selectedPool = selectPoolForTokenPair(
    withdrawalState.availablePools,
    firstTokenAccount,
    secondTokenAccount
  );

  const fromPoolTokenAccount = selectedPool
    ? selectTokenAccount(
        Token.from(selectedPool.poolToken),
        withdrawalState.tokenAccounts.map(TokenAccount.from),
        false
      )
    : undefined;

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
    fromPoolTokenAccount: fromPoolTokenAccount?.serialize(),
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

export const { updateWithdrawalState } = withdrawSlice.actions;
export default withdrawSlice.reducer;
