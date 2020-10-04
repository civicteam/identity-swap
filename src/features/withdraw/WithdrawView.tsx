import React, { FC } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { propEq, find, prop } from "ramda";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { TestIds } from "../../utils/sharedTestIds";
import { executeWithdrawal, updateWithdrawalState } from "./WithdrawSlice";

export const WithdrawView: FC = () => {
  const intl = useIntl();
  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => ({
    ...state.withdraw,
    fromTokenAccount:
      state.withdraw.fromTokenAccount &&
      TokenAccount.from(state.withdraw.fromTokenAccount),
    toTokenAccount:
      state.withdraw.toTokenAccount &&
      TokenAccount.from(state.withdraw.toTokenAccount),
    selectedPool:
      state.withdraw.selectedPool && Pool.from(state.withdraw.selectedPool),
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
            state.withdraw.availablePools.map(Pool.from).map(prop("poolToken"))
          )
      )
  );

  const poolTokenAccount = find(
    propEq("mint", selectedPool?.poolToken),
    tokenAccounts
  );

  const getTokenABalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenAValueOfPoolTokenAmount(poolTokenAccount.balance)
      : 0;
  const getTokenBBalance = () =>
    poolTokenAccount && selectedPool
      ? selectedPool.getTokenBValueOfPoolTokenAmount(poolTokenAccount.balance)
      : 0;

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
        fromAmount={fromAmount}
        toAmount={toAmount}
        // TODO HE-29 it is possible for this account not to exist, but the fromToken still to be chosen
        // in this case, the fromToken (to be renamed) will be passed from the state
        fromToken={fromTokenAccount?.mint}
        // TODO HE-29 likewise for the toToken
        toToken={toTokenAccount?.mint}
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateWithdrawalState}
        getTokenABalance={getTokenABalance}
        getTokenBBalance={getTokenBBalance}
        selectedPool={selectedPool}
        cardHeaderTitleFrom=""
        cardHeaderTitleTo=""
        constraints={{
          // TODO Temporary - re-enable when the balance constraints accurately check the pool token amount
          // instead of owned token amount
          fromTokenBalance: false,
          toTokenBalance: false,
        }}
      />
    </>
  );
};
