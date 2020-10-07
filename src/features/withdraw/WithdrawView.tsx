import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { Token } from "../../api/token/Token";
import { TestIds } from "../../utils/sharedTestIds";
import { usePoolFromLocation } from "../../utils/state";
import { executeWithdrawal, updateWithdrawalState } from "./WithdrawSlice";

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
    poolTokenAccount,
    selectedPool,
    tokenAccounts,
    availablePools,
  } = useSelector((state: RootState) => ({
    ...state.withdraw,
    firstToken:
      state.withdraw.firstToken && Token.from(state.withdraw.firstToken),
    secondToken:
      state.withdraw.secondToken && Token.from(state.withdraw.secondToken),
    firstTokenAccount:
      state.withdraw.firstTokenAccount &&
      TokenAccount.from(state.withdraw.firstTokenAccount),
    secondTokenAccount:
      state.withdraw.secondTokenAccount &&
      TokenAccount.from(state.withdraw.secondTokenAccount),
    selectedPool:
      state.withdraw.selectedPool && Pool.from(state.withdraw.selectedPool),
    tokenAccounts: state.withdraw.tokenAccounts.map(TokenAccount.from),
    poolTokenAccount:
      state.withdraw.fromPoolTokenAccount &&
      TokenAccount.from(state.withdraw.fromPoolTokenAccount),
    availablePools: state.withdraw.availablePools.map(Pool.from),
  }));
  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  const handleTokenSelectionChange = (key: "firstToken" | "secondToken") => (
    selectedToken: Token
  ) => {
    dispatch(
      updateWithdrawalState({
        [key]: selectedToken.serialize(),
      })
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange("firstToken");
  const selectSecondTokenHandleChange = handleTokenSelectionChange(
    "secondToken"
  );

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateWithdrawalState({ firstAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (firstTokenAccount) updateFromAmount(firstTokenAccount.balance);
  };

  const getTokenABalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenAValueOfPoolTokenAmount(poolTokenAccount.balance)
      : 0;
  const getTokenBBalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenBValueOfPoolTokenAmount(poolTokenAccount.balance)
      : 0;

  usePoolFromLocation({
    selectedPool,
    availablePools,
    updateAction: updateWithdrawalState,
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
        updateState={updateWithdrawalState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom=""
        cardHeaderTitleTo=""
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFromAmount={setMaxFromAmount}
        updateFromAmount={updateFromAmount}
        isSwap={false}
      />
    </>
  );
};
