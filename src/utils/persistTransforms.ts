import { createTransform } from "redux-persist";
import { assoc } from "ramda";
import { WALLET_SLICE_NAME } from "../features/wallet/WalletSlice";

const stateDisconnected = assoc("connected", false);

/**
 * A Redux-Persist transform to remove the wallet connection state from the state before persisting
 */
export const walletTransform = createTransform(
  (inboundState, key) =>
    key === WALLET_SLICE_NAME ? stateDisconnected(inboundState) : inboundState,
  (outboundState, key) =>
    key === WALLET_SLICE_NAME ? stateDisconnected(outboundState) : outboundState
);
