import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { executeSwap, updateSwapState } from "./SwapSlice";

export const SwapView: FC = () => {
  const {
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    selectedPool,
  } = useSelector((state: RootState) => state.swap);
  const intl = useIntl();

  const { loading } = useSelector((state: RootState) => state.global);

  const { tokenAccounts } = useSelector((state: RootState) => state.wallet);

  return (
    <>
      <h3>
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
        fromTokenAccount={fromTokenAccount}
        toTokenAccount={toTokenAccount}
        tokenAccounts={tokenAccounts}
        updateState={updateSwapState}
        selectedPool={selectedPool}
        cardHeaderTitleFrom="From"
        cardHeaderTitleTo=""
      />
    </>
  );
};
