import { Persistor } from "redux-persist/es/types";

export interface DevWindow extends Window {
  persistor: Persistor;
  Cypress: unknown;
  store: Store;
}
