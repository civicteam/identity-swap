import { Persistor } from "redux-persist/es/types";

export interface DevWindow extends Window {
  persistor: Persistor;
  Cypress: unknown;
  store: Store;
  // used to override the browser language during e2e tests
  userLanguage: string;
}
