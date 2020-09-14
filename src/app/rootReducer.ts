import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
