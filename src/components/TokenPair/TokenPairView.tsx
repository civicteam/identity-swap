import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { Decimal } from "decimal.js";
import { RootState } from "../../app/rootReducer";
import { TestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
import { usePoolFromLocation } from "../../utils/state";
import { selectTokenAccount, tokenPairSelector } from "../../utils/tokenPair";
import { updateTokenPairState } from "../../features/TokenPairSlice";
import { TokenAccount } from "../../api/token/TokenAccount";
import { TokenPairPanel } from "./TokenPairPanel";

type TokenPairViewProps = {
  submitAction: () => void;
  excludeZeroBalanceFirstTokenAccount?: boolean;
  excludeZeroBalanceSecondTokenAccount?: boolean;
  allowEmptyFirstTokenAccount?: boolean;
  allowEmptySecondTokenAccount?: boolean;
  viewTitleKey: string;
  submitButtonTitleKey: string;
  enableFirstTokenAccountSelector?: boolean;
  enableSecondTokenAccountSelector?: boolean;
  isSwap: boolean;
};

export const TokenPairView: FC<TokenPairViewProps> = (
  props: TokenPairViewProps
) => {
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

  const handleTokenAccountSelectionChange = (
    key: "firstTokenAccount" | "secondTokenAccount"
  ) => (selectedTokenAccount?: TokenAccount) => {
    dispatch(
      updateTokenPairState({
        [key]: selectedTokenAccount?.serialize(),
      })
    );
  };

  const selectFirstTokenAccountHandleChange = handleTokenAccountSelectionChange(
    "firstTokenAccount"
  );
  const selectSecondTokenAccountHandleChange = handleTokenAccountSelectionChange(
    "secondTokenAccount"
  );

  const updateFirstAmount = (minorAmount: Decimal) => {
    dispatch(updateTokenPairState({ firstAmount: minorAmount.toNumber() }));
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
        <FormattedMessage id={props.viewTitleKey} />
      </h3>
      <TokenPairPanel
        submitAction={props.submitAction}
        submitButtonText={intl.formatMessage({
          id: props.submitButtonTitleKey,
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
        cardHeaderTitleFirst=""
        cardHeaderTitleSecond=""
        constraints={{
          firstTokenBalance: true,
          secondTokenBalance: true,
        }}
        availableTokens={availableTokens}
        availablePools={availablePools}
        selectFirstTokenHandleChange={selectFirstTokenHandleChange}
        selectSecondTokenHandleChange={selectSecondTokenHandleChange}
        selectFirstTokenAccountHandleChange={
          selectFirstTokenAccountHandleChange
        }
        enableFirstTokenAccountSelector={props.enableFirstTokenAccountSelector}
        excludeZeroBalanceFirstTokenAccount={
          props.excludeZeroBalanceFirstTokenAccount
        }
        selectSecondTokenAccountHandleChange={
          selectSecondTokenAccountHandleChange
        }
        enableSecondTokenAccountSelector={
          props.enableSecondTokenAccountSelector
        }
        excludeZeroBalanceSecondTokenAccount={
          props.excludeZeroBalanceSecondTokenAccount
        }
        allowEmptyFirstTokenAccount={props.allowEmptyFirstTokenAccount}
        allowEmptySecondTokenAccount={props.allowEmptySecondTokenAccount}
        setMaxFirstAmount={setMaxFirstAmount}
        updateFirstAmount={updateFirstAmount}
        isSwap={props.isSwap}
      />
    </>
  );
};
