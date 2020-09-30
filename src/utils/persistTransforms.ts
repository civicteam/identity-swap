import { createTransform } from "redux-persist";
import { assoc } from "ramda";
import { WALLET_SLICE_NAME } from "../features/wallet/WalletSlice";
import { GLOBAL_SLICE_NAME } from "../features/GlobalSlice";

const stateDisconnected = assoc("connected", false);
const notLoading = assoc("loading", 0);

/**
 * A Redux-Persist transform to remove the wallet connection state from the state before persisting
 */
export const walletTransform = createTransform(
  (inboundState, key) =>
    key === WALLET_SLICE_NAME ? stateDisconnected(inboundState) : inboundState,
  (outboundState, key) =>
    key === WALLET_SLICE_NAME ? stateDisconnected(outboundState) : outboundState
);

export const loadingTransform = createTransform(
  (inboundState, key) =>
    key === GLOBAL_SLICE_NAME ? notLoading(inboundState) : inboundState,
  (outboundState, key) =>
    key === GLOBAL_SLICE_NAME ? notLoading(outboundState) : outboundState
);
