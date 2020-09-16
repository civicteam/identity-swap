import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import { isDev } from "../utils/env";
import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
  // add middlewares via a callback, as recommended
  // here: https://redux-toolkit.js.org/api/configureStore#middleware
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    logger, // Note: logger must be the last middleware in chain, otherwise it will log thunk and promise, not actual actions
  ],
  devTools: isDev,
});

if (isDev && module.hot) {
  module.hot.accept("./rootReducer", () => {
    // Allow hot-loading of the root reloader, in development only.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const newRootReducer = require("./rootReducer").default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;

export default store;
