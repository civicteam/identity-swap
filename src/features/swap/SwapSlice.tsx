import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Identity } from "../../api/identity/Identity";

export const SWAP_SLICE_NAME = "swap";

export const executeSwap = createAsyncThunk(
  SWAP_SLICE_NAME + "/executeSwap",
  async (arg, thunkAPI): Promise<string> => {
    const state: RootState = thunkAPI.getState() as RootState;
    const walletState = state.wallet;
    const {
      firstTokenAccount: serializedFirstTokenAccount,
      firstAmount,
      secondTokenAccount: serializedSecondTokenAccount,
      selectedPool,
      slippage,
    } = state.tokenPair;
    const { selectedIdentity } = state.identity;
    const PoolAPI = APIFactory(walletState.cluster);

    if (!serializedFirstTokenAccount || !selectedPool) return "";

    if (!selectedIdentity)
      throw new Error("notification.error.identity.missing");

    const swapParameters: SwapParameters = {
      fromAccount: TokenAccount.from(serializedFirstTokenAccount),
      toAccount:
        serializedSecondTokenAccount &&
        TokenAccount.from(serializedSecondTokenAccount),
      fromAmount: firstAmount,
      pool: Pool.from(selectedPool),
      identity: Identity.from(selectedIdentity),
      slippage,
    };

    return PoolAPI.swap(swapParameters);
  }
);
