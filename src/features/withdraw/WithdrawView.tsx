import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { Token } from "../../api/token/Token";
import { TestIds } from "../../utils/sharedTestIds";
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
    selectedPool,
    tokenAccounts,
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
        updateWithdrawalState({
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
      dispatch(
        updateWithdrawalState({ secondToken: selectedToken.serialize() })
      );
    }
  };

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateWithdrawalState({ firstAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (firstTokenAccount) updateFromAmount(firstTokenAccount.balance);
  };

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
      />
    </>
  );
};
