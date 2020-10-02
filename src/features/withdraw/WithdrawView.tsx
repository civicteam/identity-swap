import React, { FC } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
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
    state.wallet.tokenAccounts.map(TokenAccount.from)
  );

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
