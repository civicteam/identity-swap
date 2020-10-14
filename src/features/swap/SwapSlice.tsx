import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/rootReducer";
import { APIFactory, SwapParameters } from "../../api/pool";
import { Pool } from "../../api/pool/Pool";
import { TokenAccount } from "../../api/token/TokenAccount";

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
    } = state.tokenPair;
    const PoolAPI = APIFactory(walletState.cluster);

    if (!serializedFirstTokenAccount || !selectedPool) return "";

    const swapParameters: SwapParameters = {
      fromAccount: TokenAccount.from(serializedFirstTokenAccount),
      toAccount:
        serializedSecondTokenAccount &&
        TokenAccount.from(serializedSecondTokenAccount),
      fromAmount: firstAmount,
      pool: Pool.from(selectedPool),
    };

    return PoolAPI.swap(swapParameters);
  }
);
