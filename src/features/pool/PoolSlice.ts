import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Loadable } from "../../utils/types";
import { RootState } from "../../app/rootReducer";
import { APIFactory } from "../../api/pool";
import { SerializablePool } from "../../api/pool/Pool";

interface PoolsState extends Loadable {
  availablePools: Array<SerializablePool>;
}

const initialState: PoolsState = {
  availablePools: [],
  loading: false,
  error: null,
};

export const POOL_SLICE_NAME = "pool";
export const getPools = createAsyncThunk(
  POOL_SLICE_NAME + "/getPools",
  async (arg, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const pools = await PoolAPI.getPools();

    return pools.map((pool) => pool.serialize());
  }
);

const poolSlice = createSlice({
  name: POOL_SLICE_NAME,
  initialState,
  reducers: {
    add: (state, action: PayloadAction<SerializablePool>) => ({
      ...state,
      availablePools: [...state.availablePools, action.payload],
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(getPools.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      availablePools: action.payload,
    }));
  },
});

export const { add: addPool } = poolSlice.actions;
export default poolSlice.reducer;
