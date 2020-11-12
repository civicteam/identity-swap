import React, { FC } from "react";
import { Decimal } from "decimal.js";
import { useDispatch, useSelector } from "react-redux";
import { tokenPairSelector } from "../../utils/tokenPair";
import { TokenPairView } from "../../components/TokenPair/TokenPairView";
import { updateTokenPairState } from "../TokenPairSlice";
import { toDecimal } from "../../utils/amount";
import { executeWithdrawal } from "./WithdrawSlice";

export const WithdrawView: FC = () => {
  const dispatch = useDispatch();

  const { firstTokenAccount, selectedPool, poolTokenAccount } = useSelector(
    tokenPairSelector
  );

  const updateFirstAmount = (minorAmount: number | Decimal) => {
    dispatch(
      updateTokenPairState({ firstAmount: toDecimal(minorAmount).toNumber() })
    );
  };

  const getTokenABalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenAValueOfPoolTokenAmount(poolTokenAccount.balance)
      : new Decimal(0);
  const getTokenBBalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenBValueOfPoolTokenAmount(poolTokenAccount.balance)
      : new Decimal(0);

  const setMaxFirstAmount = () => {
    if (selectedPool && firstTokenAccount) {
      const isReverse = selectedPool.tokenA.sameToken(firstTokenAccount);
      const maxAmount = isReverse ? getTokenABalance() : getTokenBBalance();
      if (firstTokenAccount) updateFirstAmount(maxAmount);
    }
  };

  return (
    <>
      <TokenPairView
        submitAction={executeWithdrawal}
        viewTitleKey="withdraw.title"
        submitButtonTitleKey="withdraw.action"
        isSwap={false}
        allowEmptySecondTokenAccount={true}
        getTokenABalance={getTokenABalance}
        getTokenBBalance={getTokenBBalance}
        setMaxFirstAmount={setMaxFirstAmount}
        constraints={{
          firstTokenBalance: false,
          secondTokenBalance: false,
        }}
      />
    </>
  );
};
