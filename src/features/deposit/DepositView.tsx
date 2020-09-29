import React, { FC } from "react";
import { useSelector } from "react-redux";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { executeDeposit, updateDepositState } from "./DepositSlice";

export const DepositView: FC = () => {
  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => state.deposit);
  const { loading } = useSelector((state: RootState) => state.global);

  const { tokenAccounts } = useSelector((state: RootState) => state.wallet);

  return (
    <>
      <h3>DEPOSIT</h3>
      <TokenPairPanel
        submitAction={executeDeposit}
        submitButtonText="DEPOSIT"
        loading={!!loading}
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateDepositState}
        selectedPool={selectedPool}
      />
    </>
  );
};
