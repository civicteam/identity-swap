import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find, head } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { APIFactory, DepositParameters } from "../../api/pool";
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

export interface DepositState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
  tokenAccounts: Array<SerializableTokenAccount>;
  errorFirstTokenAccount?: string;
  errorSecondTokenAccount?: string;
  disableFirstTokenField: boolean;
}

const initialState: DepositState = {
  availablePools: [],
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  disableFirstTokenField: false,
};

export const DEPOSIT_SLICE_NAME = "deposit";

const syncTokenAccounts = (
  depositState: DepositState,
  tokenAccounts: Array<SerializableTokenAccount>
): DepositState => ({
  ...depositState,
  tokenAccounts,
  firstTokenAccount:
    depositState.firstTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", depositState.firstTokenAccount),
      tokenAccounts
    ),
  secondTokenAccount:
    depositState.secondTokenAccount &&
    find(eqProps("address", depositState.secondTokenAccount), tokenAccounts),
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

/**
 *
 * For Deposit (both) , it should:
 * a) find all token accounts that match the selected token
 * b) filter out all zero-balance token accounts
 * c) select the account with the highest balance from the remaining list.
 * d) if there is no non-zero token account that matches, show an error (invalidate the Token selector and add text saying something like "you have no XYZ tokens in this wallet"
 *
 * @param token
 * @param tokenAccounts
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
    true
  );

  if (sortedTokenAccounts.length > 0) return sortedTokenAccounts[0].serialize();

  // if there is no non-zero token account that matches,
  // show an error (invalidate the Token selector and add text saying something like "you have no XYZ tokens in this wallet"
  throw new Error("No Token Account found for this Token");
};

const normalize = (depositState: DepositState): DepositState => {
  let errorFirstTokenAccount;
  let firstTokenAccount;
  let disableFirstTokenField = false;
  try {
    firstTokenAccount = selectTokenAccount(
      depositState.firstToken,
      depositState.tokenAccounts
    );
  } catch (e) {
    errorFirstTokenAccount = "tokenPairToken.error.noTokenAccount";
    disableFirstTokenField = true;
  }

  let errorSecondTokenAccount;
  let secondTokenAccount;
  try {
    secondTokenAccount = selectTokenAccount(
      depositState.secondToken,
      depositState.tokenAccounts
    );
  } catch (e) {
    errorSecondTokenAccount = "tokenPairToken.error.noTokenAccount";
  }

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
    disableFirstTokenField,
    errorFirstTokenAccount,
    errorSecondTokenAccount,
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
      pool.poolToken.serialize(),
      tokenAccounts,
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
