import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";
import notificationSliceReducer from "../features/notification/NotificationSlice";
import walletSliceReducer from "../features/wallet/WalletSlice";
import globalReducer from "../features/GlobalSlice";
import tokenPairReducer from "../features/TokenPairSlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
  notification: notificationSliceReducer,
  wallet: walletSliceReducer,
  global: globalReducer,
  tokenPair: tokenPairReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
