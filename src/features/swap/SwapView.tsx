import React, { FC } from "react";
import { useSelector } from "react-redux";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
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

  const setFromAmount = (amount: number) =>
    updateSwapState({ fromAmount: amount });

  const selectFromTokenAccount = (
    selectedTokenAccount: SerializableTokenAccount
  ) => updateSwapState({ fromTokenAccount: selectedTokenAccount });

  const selectToTokenAccount = (
    selectedTokenAccount: SerializableTokenAccount
  ) => updateSwapState({ toTokenAccount: selectedTokenAccount });

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
        selectFromTokenAccount={selectFromTokenAccount}
        selectToTokenAccount={selectToTokenAccount}
        setFromAmount={setFromAmount}
        selectedPool={selectedPool}
      />
    </>
  );
};
