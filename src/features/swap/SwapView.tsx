import React, { FC } from "react";
import { useSelector } from "react-redux";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { executeSwap, updateSwapState } from "./SwapSlice";

export const SwapView: FC = () => {
  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => state.swap);

  const { loading } = useSelector((state: RootState) => state.global);

  const { tokenAccounts } = useSelector((state: RootState) => state.wallet);

  return (
    <>
      <h3>SWAP</h3>
      <TokenPairPanel
        submitAction={executeSwap}
        submitButtonText="SWAP"
        loading={!!loading}
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateSwapState}
        selectedPool={selectedPool}
      />
    </>
  );
};
