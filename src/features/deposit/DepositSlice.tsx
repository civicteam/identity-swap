import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/rootReducer";
import { APIFactory, DepositParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { TokenAccount } from "../../api/token/TokenAccount";

import { getPoolTokenAccount } from "../../utils/tokenPair";

export const DEPOSIT_SLICE_NAME = "deposit";

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
      slippage,
    } = state.tokenPair;

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

    const poolTokenAccount = getPoolTokenAccount(
      pool,
      tokenAccounts.map(TokenAccount.from)
    );

    const depositParameters: DepositParameters = {
      fromAAccount,
      fromBAccount,
      fromAAmount,
      poolTokenAccount,
      pool,
      slippage,
    };

    return PoolAPI.deposit(depositParameters);
  }
);
