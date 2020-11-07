import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";
import walletSliceReducer from "../features/wallet/WalletSlice";
import globalReducer from "../features/GlobalSlice";
import tokenPairReducer from "../features/TokenPairSlice";
import identityReducer from "../features/identity/IdentitySlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
  wallet: walletSliceReducer,
  global: globalReducer,
  tokenPair: tokenPairReducer,
  identity: identityReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
