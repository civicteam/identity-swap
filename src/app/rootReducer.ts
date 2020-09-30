import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";
import notificationSliceReducer from "../features/notification/NotificationSlice";
import walletSliceReducer from "../features/wallet/WalletSlice";
import swapReducer from "../features/swap/SwapSlice";
import depositReducer from "../features/deposit/DepositSlice";
import withdrawReducer from "../features/withdraw/WithdrawSlice";
import globalReducer from "../features/GlobalSlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
  notification: notificationSliceReducer,
  wallet: walletSliceReducer,
  swap: swapReducer,
  deposit: depositReducer,
  withdraw: withdrawReducer,
  global: globalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
