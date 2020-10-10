import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { TokenPairPanel } from "../../components/TokenPair/TokenPairPanel";
import { RootState } from "../../app/rootReducer";
import { TestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
import { usePoolFromLocation } from "../../utils/state";
import { selectTokenAccount, tokenPairSelector } from "../../utils/tokenPair";
import { updateTokenPairState } from "../TokenPairSlice";
import { executeSwap } from "./SwapSlice";

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
    availablePools,
  } = useSelector(tokenPairSelector);

  const { loading, availableTokens } = useSelector((state: RootState) => ({
    ...state.global,
    availableTokens: state.global.availableTokens.map(Token.from),
  }));

  const handleTokenSelectionChange = (key: "firstToken" | "secondToken") => (
    selectedToken: Token
  ) => {
    const tokenAccount = selectTokenAccount(selectedToken, tokenAccounts);
    dispatch(
      updateTokenPairState({
        [key]: selectedToken.serialize(),
        [key + "Account"]: tokenAccount?.serialize(),
      })
    );
  };

  const selectFirstTokenHandleChange = handleTokenSelectionChange("firstToken");
  const selectSecondTokenHandleChange = handleTokenSelectionChange(
    "secondToken"
  );

  const updateFirstAmount = (minorAmount: number) => {
    dispatch(updateTokenPairState({ firstAmount: minorAmount }));
  };

  const setMaxFirstAmount = () => {
    if (firstTokenAccount) updateFirstAmount(firstTokenAccount.balance);
  };

  usePoolFromLocation({
    selectedPool,
    availablePools,
    tokenAccounts,
    updateAction: updateTokenPairState,
  });

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
        updateState={updateTokenPairState}
        selectedPool={selectedPool}
        cardHeaderTitleFirst={intl.formatMessage({
          id: "tokenAmountField.from",
        })}
        cardHeaderTitleSecond={intl.formatMessage({
          id: "tokenAmountField.to",
        })}
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        availablePools={availablePools}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        setMaxFirstAmount={setMaxFirstAmount}
        updateFirstAmount={updateFirstAmount}
        isSwap={true}
      />
    </>
  );
};
