import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Decimal } from "decimal.js";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";

import { Token } from "../../api/token/Token";
import { TestIds } from "../../utils/sharedTestIds";
import { usePoolFromLocation } from "../../utils/state";
import { selectTokenAccount, tokenPairSelector } from "../../utils/tokenPair";
import { updateTokenPairState } from "../TokenPairSlice";
import { toDecimal } from "../../utils/amount";
import { executeWithdrawal } from "./WithdrawSlice";

export const WithdrawView: FC = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const {
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    firstToken,
    secondToken,
    selectedPool,
    tokenAccounts,
    availablePools,
    poolTokenAccount,
  } = useSelector(tokenPairSelector);

  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  const handleTokenSelectionChange = (key: "firstToken" | "secondToken") => (
    selectedToken: Token
  ) => {
    const tokenAccount = selectTokenAccount(
      selectedToken,
      tokenAccounts,
      false
    );

    dispatch(
      updateTokenPairState({
        [key]: selectedToken.serialize(),
        [key + "Account"]: tokenAccount?.serialize(),
      })
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange("firstToken");
  const selectSecondTokenHandleChange = handleTokenSelectionChange(
    "secondToken"
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

  usePoolFromLocation({
    selectedPool,
    availablePools,
    tokenAccounts,
    updateAction: updateTokenPairState,
  });

  return (
    <>
      <h3 data-testid={TestIds.PAGE_TITLE}>
        <FormattedMessage id="withdraw.title" />
      </h3>
      <TokenPairPanel
        submitAction={executeWithdrawal}
        submitButtonText={intl.formatMessage({
          id: "withdraw.action",
        })}
        loading={!!loading}
        firstAmount={firstAmount}
        secondAmount={secondAmount}
        firstToken={firstToken}
        secondToken={secondToken}
        firstTokenAccount={firstTokenAccount}
        secondTokenAccount={secondTokenAccount}
        getTokenABalance={getTokenABalance}
        getTokenBBalance={getTokenBBalance}
        tokenAccounts={tokenAccounts}
        availablePools={availablePools}
        updateState={updateTokenPairState}
        selectedPool={selectedPool}
        cardHeaderTitleFirst=""
        cardHeaderTitleSecond=""
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFirstAmount={setMaxFirstAmount}
        updateFirstAmount={updateFirstAmount}
        isSwap={false}
      />
    </>
  );
};
