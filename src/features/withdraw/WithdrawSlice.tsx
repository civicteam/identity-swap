import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { eqProps, find } from "ramda";
import {
  addNotification,
  dispatchErrorNotification,
} from "../notification/NotificationSlice";
import * as WalletAPI from "../../api/wallet";
import { RootState } from "../../app/rootReducer";
import { APIFactory, WithdrawalParameters } from "../../api/pool";
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

export interface WithdrawalState extends TokenPairState {
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
}

const initialState: WithdrawalState = {
  availablePools: [],
  fromAmount: 0,
  toAmount: 0,
};

export const WITHDRAWAL_SLICE_NAME = "withdrawal";

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
  withdrawalState: WithdrawalState,
  tokenAccounts: Array<SerializableTokenAccount>
): WithdrawalState => ({
  ...withdrawalState,
  fromTokenAccount:
    withdrawalState.fromTokenAccount &&
    find(
      // use eqProps here because we are comparing SerializableTokenAccounts,
      // which have no equals() function
      eqProps("address", withdrawalState.fromTokenAccount),
      tokenAccounts
    ),
  toTokenAccount:
    withdrawalState.toTokenAccount &&
    find(eqProps("address", withdrawalState.toTokenAccount), tokenAccounts),
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

const selectPoolForTokenPair = (
  state: WithdrawalState
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

const normalize = (withdrawalState: WithdrawalState): WithdrawalState => {
  const selectedPool = selectPoolForTokenPair(withdrawalState);

  const toAmount = getToAmount(
    withdrawalState.fromAmount,
    withdrawalState.fromTokenAccount?.mint,
    selectedPool
  );

  return {
    ...withdrawalState,
    toAmount,
    selectedPool,
  };
};

export const executeWithdrawal = createAsyncThunk(
  WITHDRAWAL_SLICE_NAME + "/executeWithdrawal",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      fromTokenAccount: serializedFromTokenAccount,
      toTokenAccount: serializedToTokenAccount,
      selectedPool,
      fromAmount: amountToWithdraw,
    } = state.withdraw;
    const wallet = WalletAPI.getWallet();

    const PoolAPI = APIFactory(walletState.cluster);

    if (!wallet || !selectedPool) return "";

    // TODO HE-29 will remove the from/to TokenAccount confusion
    // deserialize accounts 1 and 2 (if present) and the pool
    const account1 =
      serializedFromTokenAccount &&
      TokenAccount.from(serializedFromTokenAccount);
    const account2 =
      serializedToTokenAccount && TokenAccount.from(serializedToTokenAccount);
    const pool = Pool.from(selectedPool);

    // work out whether account1 is A or B in the pool
    const isReverse =
      (account1 && pool.tokenB.mint.equals(account1.mint)) ||
      (account2 && pool.tokenA.mint.equals(account2.mint));
    const toAAccount = isReverse ? account2 : account1;
    const toBAccount = isReverse ? account1 : account2;
    // TODO HE-29 Inside the components, the max amount should be set
    // and prevent this from ever being higher than poolTokenAccount.balance
    // later, we may allow combining of multiple pool token accounts, in one transaction
    const poolTokenAmount = isReverse
      ? pool.getPoolTokenValueOfTokenBAmount(amountToWithdraw)
      : pool.getPoolTokenValueOfTokenAAmount(amountToWithdraw);

    // fetch the first pool token account that matches this pool
    let serializablePoolTokenAccount;
    for (const tokenAccount of walletState.tokenAccounts) {
      if (
        tokenAccount.mint.address === selectedPool.poolToken.address &&
        tokenAccount.balance > 0
      ) {
        serializablePoolTokenAccount = tokenAccount;
        break;
      }
    }

    if (serializablePoolTokenAccount) {
      const poolTokenAccount = TokenAccount.from(serializablePoolTokenAccount);
      const withdrawalParameters: WithdrawalParameters = {
        fromPoolTokenAccount: poolTokenAccount,
        fromPoolTokenAmount: poolTokenAmount,
        toAAccount,
        toBAccount,
        wallet,
        pool: Pool.from(selectedPool),
      };

      console.log("PARAMETERS");
      console.log(withdrawalParameters);
      const transactionSignature = await PoolAPI.withdraw(
        withdrawalParameters
      ).catch(dispatchErrorNotification(thunkAPI.dispatch));
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
    return "";
  }
);

const withdrawSlice = createSlice({
  name: WITHDRAWAL_SLICE_NAME,
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
    builder.addCase(getOwnedTokens.fulfilled, (state, action) =>
      syncTokenAccounts(state, action.payload)
    );

    builder.addCase(getPools.fulfilled, (state, action) =>
      syncPools(state, action.payload)
    );
  },
});

export const { updateWithdrawalState } = withdrawSlice.actions;
export default withdrawSlice.reducer;
