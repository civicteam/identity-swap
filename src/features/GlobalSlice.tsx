import { createSlice } from "@reduxjs/toolkit";
import {
  isFulfilledAction,
  isPendingAction,
  isRejectedAction,
} from "../utils/redux";

export interface GlobalState {
  loading: number;
  error: string | null;
}

const initialState: GlobalState = {
  loading: 0,
  error: null,
};

export const GLOBAL_SLICE_NAME = "global";

const globalSlice = createSlice({
  name: GLOBAL_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
