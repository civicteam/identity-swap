export interface DevWindow extends Window {
  Cypress: unknown;
  store: Store;
  // used to override the browser language during e2e tests
  userLanguage: string;
}
