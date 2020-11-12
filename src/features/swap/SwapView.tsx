import React, { FC } from "react";
import { TokenPairView } from "../../components/TokenPair/TokenPairView";
import { executeSwap } from "./SwapSlice";

export const SwapView: FC = () => {
  return (
    <TokenPairView
      submitAction={executeSwap}
      viewTitleKey="swap.title"
      submitButtonTitleKey="swap.action"
      isSwap={true}
      enableFirstTokenAccountSelector={true}
      excludeZeroBalanceFirstTokenAccount={true}
      enableSecondTokenAccountSelector={true}
      excludeZeroBalanceSecondTokenAccount={false}
      allowEmptySecondTokenAccount={true}
      constraints={{
        firstTokenBalance: true,
        secondTokenBalance: false,
      }}
    />
  );
};
