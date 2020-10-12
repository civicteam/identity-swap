import { createAsyncThunk } from "@reduxjs/toolkit";
import React from "react";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, WithdrawalParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { ViewTxOnExplorer } from "../../components/ViewTxOnExplorer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { getPoolTokenAccount } from "../../utils/tokenPair";

export const WITHDRAWAL_SLICE_NAME = "withdrawal";

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
    } = state.tokenPair;
    const PoolAPI = APIFactory(walletState.cluster);

    if (!selectedPool) return "";

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

    const poolTokenAmount = isReverse
      ? pool.getPoolTokenValueOfTokenBAmount(amountToWithdraw)
      : pool.getPoolTokenValueOfTokenAAmount(amountToWithdraw);

    // fetch the pool token account with the highest balance that matches this pool
    const poolTokenAccount = getPoolTokenAccount(
      pool,
      tokenAccounts.map(TokenAccount.from)
    );

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

    return transactionSignature;
  }
);
