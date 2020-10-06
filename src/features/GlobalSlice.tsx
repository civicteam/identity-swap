import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  isFulfilledAction,
  isPendingAction,
  isRejectedAction,
} from "../utils/redux";
import * as tokenConfigJson from "../api/token/token.config.json";
import { SerializableToken } from "../api/token/Token";
import { RootState } from "../app/rootReducer";

export type TokenConfig = {
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
};

export interface GlobalState {
  loading: number;
  error: string | null;
  availableTokens: Array<SerializableToken>;
}

const initialState: GlobalState = {
  loading: 0,
  error: null,
  availableTokens: [],
};

export const GLOBAL_SLICE_NAME = "global";

/**
 * Fetch all available tokens from the configured sources. For now it is fetching from a local file, but will change
 * to fetch from remote APIs
 */
export const getAvailableTokens = createAsyncThunk(
  GLOBAL_SLICE_NAME + "/getAvailableTokens",
  async (arg, thunkAPI): Promise<Array<SerializableToken>> => {
    const {
      wallet: { cluster },
      pool: { availablePools },
    }: RootState = thunkAPI.getState() as RootState;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokensConfig: { [index: string]: any } = tokenConfigJson;
    const tokensConfigForCluster = tokensConfig.default[cluster];
    const allPoolTokens = availablePools.map((p) => p.poolToken);

    // TODO recover on-chain information
    const decimals = 2;
    const allTokens: Array<SerializableToken> = tokensConfigForCluster.map(
      (tokenConfig: TokenConfig) => ({
        address: tokenConfig.mintAddress,
        decimals,
        name: tokenConfig.tokenName,
        symbol: tokenConfig.tokenSymbol,
      })
    );

    return allTokens.filter(
      (token) =>
        !allPoolTokens.find((poolToken) => poolToken.address === token.address)
    );
  }
);

const globalSlice = createSlice({
  name: GLOBAL_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAvailableTokens.fulfilled, (state, action) => ({
      ...state,
      availableTokens: action.payload,
    }));
    builder.addMatcher(isPendingAction, (state) => ({
      ...state,
      loading: state.loading + 1,
    }));
    builder.addMatcher(isRejectedAction, (state, action) => ({
      ...state,
      loading: state.loading - 1,
      error: action.error.message,
    }));
    builder.addMatcher(isFulfilledAction, (state) => ({
      ...state,
      loading: state.loading - 1,
    }));
  },
});

export default globalSlice.reducer;
