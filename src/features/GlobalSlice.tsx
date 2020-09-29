import { createSlice } from "@reduxjs/toolkit";
import {
  isFulfilledAction,
  isPendingAction,
  isRejectedAction,
} from "../utils/redux";

export interface GlobalState {
  loading: boolean;
  error: string | null;
}

const initialState: GlobalState = {
  loading: false,
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
      loading: true,
    }));
    builder.addMatcher(isRejectedAction, (state, action) => ({
      ...state,
      loading: false,
      error: action.error.message,
    }));
    builder.addMatcher(isFulfilledAction, (state) => ({
      ...state,
      loading: false,
    }));
  },
});

export default globalSlice.reducer;
