import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { TestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
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
  }));
  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectFirstTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const selectedToken = availableTokens.find(
      (token) => token.symbol === index
    );
    if (selectedToken) {
      dispatch(
        updateDepositState({
          firstToken: selectedToken.serialize(),
          tokenAccounts: tokenAccounts.map((tokenAccount) =>
            tokenAccount.serialize()
          ),
        })
      );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectSecondTokenHandleChange = (event: any) => {
    const index = event.target.value;
    const selectedToken = availableTokens.find(
      (token) => token.symbol === index
    );
    if (selectedToken) {
      dispatch(updateDepositState({ secondToken: selectedToken.serialize() }));
    }
  };

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateDepositState({ firstAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (firstTokenAccount) updateFromAmount(firstTokenAccount.balance);
  };

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
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFromAmount={setMaxFromAmount}
        updateFromAmount={updateFromAmount}
        errorHelperTextFromAmount={errorFirstTokenAccount}
        errorHelperTextToAmount={errorSecondTokenAccount}
        disableFromAmountField={disableFirstTokenField}
      />
    </>
  );
};
