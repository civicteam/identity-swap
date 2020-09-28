import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import {
  persistStore,
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import { PersistConfig } from "redux-persist/es/types";
import { isDev } from "../utils/env";
import { NOTIFICATION_SLICE_NAME } from "../features/notification/NotificationSlice";
import { DevWindow } from "../types/global";
import { WALLET_SLICE_NAME } from "../features/wallet/WalletSlice";
import rootReducer, { RootState } from "./rootReducer";

declare let window: DevWindow;

// Configuration for redux-persist
const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage,
  blacklist: [
    // do not persist notifications
    // they will likely be confusing and irrelevant when
    // rehydrating
    NOTIFICATION_SLICE_NAME,
    WALLET_SLICE_NAME + ".connected",
  ],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  // add middlewares via a callback, as recommended
  // here: https://redux-toolkit.js.org/api/configureStore#middleware
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // needed to avoid warnings for redux-persist
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
        // allows the inclusion of UI components in notifications
        ignoredPaths: [NOTIFICATION_SLICE_NAME],
      },
    }),
    logger, // Note: logger must be the last middleware in chain, otherwise it will log thunk and promise, not actual actions
  ],
  devTools: isDev,
});

const persistor = persistStore(store);

if (isDev) {
  // use this in dev mode to call persistor.purge() from the console and purge local storage.
  window.persistor = persistor;

  if (module.hot) {
    module.hot.accept("./rootReducer", () => {
      // Allow hot-loading of the root reloader, in development only.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newRootReducer = require("./rootReducer").default;
      store.replaceReducer(persistReducer(persistConfig, newRootReducer));
    });
  }
}

if (window.Cypress) {
  console.log("Adding redux store to window object");
  window.store = store;
}

export type AppDispatch = typeof store.dispatch;

export { store, persistor };
