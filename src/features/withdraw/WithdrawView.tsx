import React, { FC } from "react";
import { useSelector } from "react-redux";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { executeWithdrawal, updateWithdrawalState } from "./WithdrawSlice";

export const WithdrawView: FC = () => {
  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => state.withdraw);

  const { loading } = useSelector((state: RootState) => state.global);

  const { tokenAccounts } = useSelector((state: RootState) => state.wallet);

  return (
    <>
      <h3>WITHDRAW</h3>
      <TokenPairPanel
        submitAction={executeWithdrawal}
        submitButtonText="WITHDRAW"
        loading={!!loading}
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateWithdrawalState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom=""
        cardHeaderTitleTo=""
      />
    </>
  );
};
