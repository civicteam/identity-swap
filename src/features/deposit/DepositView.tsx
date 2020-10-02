import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { executeDeposit, updateDepositState } from "./DepositSlice";
import { TestIds } from "../../utils/sharedTestIds";

export const DepositView: FC = () => {
  const intl = useIntl();

  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
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
  }));
  const { loading } = useSelector((state: RootState) => state.global);
  const tokenAccounts = useSelector((state: RootState) =>
    state.wallet.tokenAccounts.map(TokenAccount.from)
  );

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
