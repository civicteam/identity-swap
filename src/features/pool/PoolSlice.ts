import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Pool } from "../../api/swap";
import { Loadable } from "../../utils/types";

interface PoolsState extends Loadable {
  pools: Array<Pool>;
}

const initialState: PoolsState = {
  pools: [],
  loading: false,
  error: null,
};

const poolSlice = createSlice({
  name: "pool",
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Pool>) => ({
      ...state,
      pools: [...state.pools, action.payload],
    }),
  },
});

export const { add: poolAdd } = poolSlice.actions;
export default poolSlice.reducer;
