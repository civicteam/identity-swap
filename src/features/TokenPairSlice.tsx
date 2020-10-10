import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";
import { TokenPairState } from "../utils/types";
import {
  getToAmount,
  selectPoolForTokenPair,
  selectTokenAccount,
  syncPools,
  syncTokenAccount,
  syncTokenAccounts,
} from "../utils/tokenPair";
import { Token } from "../api/token/Token";
import { getPools } from "./pool/PoolSlice";
import { getOwnedTokenAccounts } from "./wallet/WalletSlice";

const initialState: TokenPairState = {
  firstAmount: 0,
  secondAmount: 0,
  tokenAccounts: [],
  availablePools: [],
};

export const TOKEN_PAIR_SLICE_NAME = "tokenPair";

const normalize = (tokenPairState: TokenPairState): TokenPairState => {
  const firstTokenAccount = syncTokenAccount(
    tokenPairState.tokenAccounts,
    tokenPairState.firstTokenAccount
  );
  const secondTokenAccount = syncTokenAccount(
    tokenPairState.tokenAccounts,
    tokenPairState.secondTokenAccount
  );

  const selectedPool = selectPoolForTokenPair(
    tokenPairState.availablePools,
    firstTokenAccount,
    secondTokenAccount
  );

  const poolTokenAccount = selectedPool
    ? selectTokenAccount(
        Token.from(selectedPool.poolToken),
        tokenPairState.tokenAccounts.map(TokenAccount.from),
        false
      )
    : undefined;

  const secondAmount = getToAmount(
    tokenPairState.firstAmount,
    tokenPairState.firstToken,
    selectedPool
  );

  return {
    ...tokenPairState,
    secondAmount,
    selectedPool,
    firstTokenAccount,
    secondTokenAccount,
    poolTokenAccount: poolTokenAccount?.serialize(),
  };
};

const tokenPairSlice = createSlice({
  name: TOKEN_PAIR_SLICE_NAME,
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

    updateTokenPairState: (
      state,
      action: PayloadAction<Partial<TokenPairState>>
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

export const { updateTokenPairState } = tokenPairSlice.actions;
export default tokenPairSlice.reducer;
