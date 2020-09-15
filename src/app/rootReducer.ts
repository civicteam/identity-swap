import { combineReducers } from "@reduxjs/toolkit";

import poolSliceReducer from "../features/pool/PoolSlice";
import notificationSliceReducer from "../features/notification/NotificationSlice";

const rootReducer = combineReducers({
  pool: poolSliceReducer,
  notification: notificationSliceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
