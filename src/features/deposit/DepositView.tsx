import React, { FC } from "react";
import { TokenPairView } from "../../components/TokenPair/TokenPairView";
import { executeDeposit } from "./DepositSlice";

export const DepositView: FC = () => {
  return (
    <>
      <TokenPairView
        submitAction={executeDeposit}
        viewTitleKey="deposit.title"
        submitButtonTitleKey="deposit.action"
        isSwap={false}
        enableFirstTokenAccountSelector={true}
        excludeZeroBalanceFirstTokenAccount={true}
        enableSecondTokenAccountSelector={true}
        excludeZeroBalanceSecondTokenAccount={true}
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
      />
    </>
  );
};
