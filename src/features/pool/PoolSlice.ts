import {
  createAsyncThunk,
  createSlice,
  Draft,
  PayloadAction,
} from "@reduxjs/toolkit";
import { RootState } from "../../app/rootReducer";
import { APIFactory } from "../../api/pool";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import { updateEntityArray } from "../../utils/tokenPair";

interface PoolsState {
  availablePools: Array<SerializablePool>;
}

const initialState: PoolsState = {
  availablePools: [],
};

export const POOL_SLICE_NAME = "pool";

const updateReducer = (
  state: Draft<PoolsState>,
  action: PayloadAction<SerializablePool>
) => {
  // find and replace the pool in the list with the pool in the action
  const updatedPools = updateEntityArray(
    Pool.from(action.payload),
    state.availablePools.map(Pool.from)
  );

  return {
    ...state,
    availablePools: updatedPools.map((pool) => pool.serialize()),
  };
};

export const getPools = createAsyncThunk(
  POOL_SLICE_NAME + "/getPools",
  async (arg, thunkAPI): Promise<Array<SerializablePool>> => {
    const state: RootState = thunkAPI.getState() as RootState;

    const PoolAPI = APIFactory(state.wallet.cluster);
    const pools = await PoolAPI.getPools();

    PoolAPI.listenToPoolChanges(pools, (pool) => {
      thunkAPI.dispatch(poolSlice.actions.update(pool.serialize()));
    });

    return pools.map((pool) => pool.serialize());
  }
);

const poolSlice = createSlice({
  name: POOL_SLICE_NAME,
  initialState,
  reducers: {
    update: updateReducer,
  },
  extraReducers: (builder) => {
    builder.addCase(getPools.fulfilled, (state, action) => ({
      ...state,
      availablePools: action.payload,
    }));
  },
});

export const { update: updatePool } = poolSlice.actions;
export default poolSlice.reducer;
