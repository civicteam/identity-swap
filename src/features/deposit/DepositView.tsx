import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { TestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
import { usePoolFromLocation } from "../../utils/state";
import { executeDeposit, updateDepositState } from "./DepositSlice";

export const DepositView: FC = () => {
  const intl = useIntl();

  const dispatch = useDispatch();
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
    errorFirstTokenAccount,
    errorSecondTokenAccount,
    disableFirstTokenField,
  } = useSelector((state: RootState) => ({
    ...state.deposit,
    firstToken:
      state.deposit.firstToken && Token.from(state.deposit.firstToken),
    secondToken:
      state.deposit.secondToken && Token.from(state.deposit.secondToken),
    firstTokenAccount:
      state.deposit.firstTokenAccount &&
      TokenAccount.from(state.deposit.firstTokenAccount),
    secondTokenAccount:
      state.deposit.secondTokenAccount &&
      TokenAccount.from(state.deposit.secondTokenAccount),
    selectedPool:
      state.deposit.selectedPool && Pool.from(state.deposit.selectedPool),
    tokenAccounts: state.deposit.tokenAccounts.map(TokenAccount.from),
    availablePools: state.deposit.availablePools.map(Pool.from),
  }));
  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  const handleTokenSelectionChange = (key: "firstToken" | "secondToken") => (
    selectedToken: Token
  ) => {
    dispatch(
      updateDepositState({
        [key]: selectedToken.serialize(),
      })
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange("firstToken");
  const selectSecondTokenHandleChange = handleTokenSelectionChange(
    "secondToken"
  );

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateDepositState({ firstAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (firstTokenAccount) updateFromAmount(firstTokenAccount.balance);
  };

  usePoolFromLocation({
    selectedPool,
    availablePools,
    updateAction: updateDepositState,
  });

  return (
    <>
      <h3 data-testid={TestIds.PAGE_TITLE}>
        <FormattedMessage id="deposit.title" />
      </h3>
      <TokenPairPanel
        submitAction={executeDeposit}
        submitButtonText={intl.formatMessage({
          id: "deposit.action",
        })}
        loading={!!loading}
        firstAmount={firstAmount}
        secondAmount={secondAmount}
        firstToken={firstToken}
        secondToken={secondToken}
        firstTokenAccount={firstTokenAccount}
        secondTokenAccount={secondTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateDepositState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom=""
        cardHeaderTitleTo=""
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        availablePools={availablePools}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFromAmount={setMaxFromAmount}
        updateFromAmount={updateFromAmount}
        errorHelperTextFromAmount={errorFirstTokenAccount}
        errorHelperTextToAmount={errorSecondTokenAccount}
        disableFromAmountField={disableFirstTokenField}
        isSwap={false}
      />
    </>
  );
};
