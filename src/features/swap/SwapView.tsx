import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { executeSwap, updateSwapState } from "./SwapSlice";
import { TestIds } from "../../utils/sharedTestIds";

export const SwapView: FC = () => {
  const intl = useIntl();

  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => ({
    ...state.swap,
    fromTokenAccount:
      state.swap.fromTokenAccount &&
      TokenAccount.from(state.swap.fromTokenAccount),
    toTokenAccount:
      state.swap.toTokenAccount && TokenAccount.from(state.swap.toTokenAccount),
    selectedPool: state.swap.selectedPool && Pool.from(state.swap.selectedPool),
  }));
  const { loading } = useSelector((state: RootState) => state.global);

  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map(TokenAccount.from)
  );

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
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromToken={fromTokenAccount?.mint}
        // TODO HE-29 it is possible for this account not to exist, but the toToken still to be chosen
        // in this case, the toToken will be passed from the state
        toToken={toTokenAccount?.mint}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateSwapState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom={intl.formatMessage({
          id: "tokenAmountField.from",
        })}
        cardHeaderTitleTo={intl.formatMessage({ id: "tokenAmountField.to" })}
        constraints={{
          fromTokenBalance: true,
          toTokenBalance: false,
        }}
      />
    </>
  );
};
