import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import { isDev, isTest } from "../utils/env";
import { DevWindow } from "../types/global";
import { gaMiddleware } from "../features/analytics/googleAnalytics";
import { segmentMiddleware } from "../features/analytics/segment";
import rootReducer from "./rootReducer";

declare let window: DevWindow;

// disable analytics when running tests
// Note - this does not apply to e2e tests
const analyticsMiddleware = isTest ? [] : [gaMiddleware, segmentMiddleware];

const store = configureStore({
  reducer: rootReducer,
  // add middlewares via a callback, as recommended
  // here: https://redux-toolkit.js.org/api/configureStore#middleware
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    ...analyticsMiddleware,
    logger, // Note: logger must be the last middleware in chain, otherwise it will log thunk and promise, not actual actions
  ],
  devTools: isDev,
});

if (isDev) {
  if (module.hot) {
    module.hot.accept("./rootReducer", () => {
      // Allow hot-loading of the root reloader, in development only.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const newRootReducer = require("./rootReducer").default;
      store.replaceReducer(newRootReducer);
    });
  }
}

if (window.Cypress) {
  console.log("Adding redux store to window object");
  window.store = store;
}

export type AppDispatch = typeof store.dispatch;

export { store };
