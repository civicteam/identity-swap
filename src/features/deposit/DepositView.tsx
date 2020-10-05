import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { prop } from "ramda";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { TestIds } from "../../utils/sharedTestIds";
import { usePoolFromLocation } from "../../utils/state";
import { executeDeposit, updateDepositState } from "./DepositSlice";

export const DepositView: FC = () => {
  const intl = useIntl();

  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
    availablePools,
  } = useSelector((state: RootState) => ({
    ...state.deposit,
    fromTokenAccount:
      state.deposit.fromTokenAccount &&
      TokenAccount.from(state.deposit.fromTokenAccount),
    toTokenAccount:
      state.deposit.toTokenAccount &&
      TokenAccount.from(state.deposit.toTokenAccount),
    selectedPool:
      state.deposit.selectedPool && Pool.from(state.deposit.selectedPool),
    availablePools: state.deposit.availablePools.map(Pool.from),
  }));
  const { loading } = useSelector((state: RootState) => state.global);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts
      .map(TokenAccount.from)
      // TODO HE-53 should remove this as the view is not dealing with tokenAccounts any more
      // Added temporarily to ensure the UI always uses the largest one
      .sort((a1, a2) => a2.balance - a1.balance)
      // TODO HE-53 will remove the duplication here between Withdrawal, Deposit and swap
      .filter(
        (tokenAccount) =>
          !tokenAccount.isAccountFor(
            state.deposit.availablePools.map(Pool.from).map(prop("poolToken"))
          )
      )
  );

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
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromToken={fromTokenAccount?.mint}
        toToken={toTokenAccount?.mint}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateDepositState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom=""
        cardHeaderTitleTo=""
        constraints={{
          fromTokenBalance: true,
          toTokenBalance: true,
        }}
      />
    </>
  );
};
