import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Loadable, SerializablePool } from "../../utils/types";
import { RootState } from "../../app/rootReducer";
import { APIFactory } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";

const toSerializedVersion = (pool: Pool): SerializablePool => ({
  tokenA: pool.tokenA.address.toBase58(),
  tokenB: pool.tokenB.address.toBase58(),
  address: pool.address.toBase58(),
});

interface PoolsState extends Loadable {
  pools: Array<SerializablePool>;
}

const initialState: PoolsState = {
  pools: [],
  loading: false,
  error: null,
};

export const getPools = createAsyncThunk(
  "pool/getPools",
  async (arg, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const pools = await PoolAPI.getPools(true);

    return pools.map(toSerializedVersion);
  }
);

const poolSlice = createSlice({
  name: "pool",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<SerializablePool>) => ({
      ...state,
      pools: [...state.pools, action.payload],
    }),
  },
});

export const { add: addPool } = poolSlice.actions;
export default poolSlice.reducer;
