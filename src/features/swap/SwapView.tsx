import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { TestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
import { executeSwap, updateSwapState } from "./SwapSlice";

export const SwapView: FC = () => {
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
  } = useSelector((state: RootState) => ({
    ...state.swap,
    firstToken: state.swap.firstToken && Token.from(state.swap.firstToken),
    secondToken: state.swap.secondToken && Token.from(state.swap.secondToken),
    firstTokenAccount:
      state.swap.firstTokenAccount &&
      TokenAccount.from(state.swap.firstTokenAccount),
    secondTokenAccount:
      state.swap.secondTokenAccount &&
      TokenAccount.from(state.swap.secondTokenAccount),
    selectedPool: state.swap.selectedPool && Pool.from(state.swap.selectedPool),
    tokenAccounts: state.swap.tokenAccounts.map(TokenAccount.from),
  }));

  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  const handleTokenSelectionChange = (key: "firstToken" | "secondToken") => (
    selectedToken: Token
  ) => {
    dispatch(
      updateSwapState({
        [key]: selectedToken.serialize(),
      })
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange("firstToken");
  const selectSecondTokenHandleChange = handleTokenSelectionChange(
    "secondToken"
  );

  const updateFromAmount = (minorAmount: number) => {
    dispatch(updateSwapState({ firstAmount: minorAmount }));
  };

  const setMaxFromAmount = () => {
    if (firstTokenAccount) updateFromAmount(firstTokenAccount.balance);
  };

  return (
    <>
      <h3 data-testid={TestIds.PAGE_TITLE}>
        <FormattedMessage id="swap.title" />
      </h3>
      <TokenPairPanel
        submitAction={executeSwap}
        submitButtonText={intl.formatMessage({
          id: "swap.action",
        })}
        loading={!!loading}
        firstAmount={firstAmount}
        secondAmount={secondAmount}
        firstToken={firstToken}
        secondToken={secondToken}
        firstTokenAccount={firstTokenAccount}
        secondTokenAccount={secondTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateSwapState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom={intl.formatMessage({
          id: "tokenAmountField.from",
        })}
        cardHeaderTitleTo={intl.formatMessage({ id: "tokenAmountField.to" })}
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFromAmount={setMaxFromAmount}
        updateFromAmount={updateFromAmount}
        isSwap={true}
      />
    </>
  );
};
