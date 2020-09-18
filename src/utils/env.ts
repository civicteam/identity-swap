export const isDev =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// Can be used in development mode only
export const localPrivateKey =
  isDev && process.env.REACT_APP_LOCAL_WALLET_PRIVATE_KEY;
