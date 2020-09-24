import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";
import notificationSliceReducer from "../features/notification/NotificationSlice";
import walletSliceReducer from "../features/wallet/WalletSlice";
import swapReducer from "../features/swap/SwapSlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
  notification: notificationSliceReducer,
  wallet: walletSliceReducer,
  swap: swapReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
