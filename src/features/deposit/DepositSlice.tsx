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
  return pool.calculateAmountInOtherToken(fromToken, fromAmount, false);
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
      fromAmount: amountToDeposit,
      toTokenAccount: serializedToTokenAccount,
      selectedPool,
    } = state.deposit;

    const PoolAPI = APIFactory(walletState.cluster);

    if (
      !serializedFromTokenAccount ||
      !serializedToTokenAccount ||
      !selectedPool
    )
      return "";

    // TODO HE-29 will remove the from/to TokenAccount confusion
    // deserialize accounts 1 and 2 and the pool
    const account1 = TokenAccount.from(serializedFromTokenAccount);
    const account2 = TokenAccount.from(serializedToTokenAccount);
    const pool = Pool.from(selectedPool);

    // work out whether account1 is A or B in the pool
    const isReverse = pool.tokenA.sameToken(account2);
    const [fromAAccount, fromBAccount] = isReverse
      ? [account2, account1]
      : [account1, account2];
    const fromAAmount = isReverse
      ? pool.calculateTokenAAmount(amountToDeposit, false)
      : amountToDeposit;

    // TODO temporary until this is all combined with HE-53
    // fetch the pool token account with the highest balance that matches this pool
    const sortedPoolTokenAccounts = walletState.tokenAccounts
      .map(TokenAccount.from)
      .filter(
        (tokenAccount) =>
          tokenAccount.mint.equals(pool.poolToken) && tokenAccount.balance > 0
      )
      .sort((a1, a2) => a2.balance - a1.balance);
    const poolTokenAccount = head(sortedPoolTokenAccounts);

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

    thunkAPI.dispatch(getOwnedTokens());
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
