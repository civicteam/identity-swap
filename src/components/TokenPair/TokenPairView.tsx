import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useIntl, FormattedMessage } from "react-intl";
import { Decimal } from "decimal.js";
import { makeStyles } from "@material-ui/core/styles";
import { RootState } from "../../app/rootReducer";
import { TestIds as SharedTestIds } from "../../utils/sharedTestIds";
import { Token } from "../../api/token/Token";
import { usePoolFromLocation } from "../../utils/state";
import { selectTokenAccount, tokenPairSelector } from "../../utils/tokenPair";
import { updateTokenPairState } from "../../features/TokenPairSlice";
import { TokenAccount } from "../../api/token/TokenAccount";
import { BalanceConstraints } from "../../utils/types";
import { TokenPairToken } from "./TokenPairToken";
import { TokenPairPool } from "./TokenPairPool";
import { TokenPairActions } from "./TokenPairActions";
import { TokenPairTransactionDetails } from "./TokenPairTransactionDetails";

export const tokenPairStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "none",
    padding: "15px",
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  selectTokenButton: {
    marginTop: "12px",
    fontSize: "9px",
  },
  formControl: {
    width: "100%",
  },
}));

enum TestIds {
  TOKEN_SELECTOR_FROM = "TOKEN_SELECTOR_FROM",
  TOKEN_SELECTOR_TO = "TOKEN_SELECTOR_TO",
}

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
  cardHeaderTitleFirst?: string;
  cardHeaderTitleSecond?: string;
  errorHelperTextFirstAmount?: string;
  errorHelperTextSecondAmount?: string;
  disableFirstAmountField?: boolean;
  disableSecondAmountField?: boolean;
  getTokenABalance?: () => Decimal;
  getTokenBBalance?: () => Decimal;
  setMaxFirstAmount?: () => void;
  constraints: BalanceConstraints;
};

export const TokenPairView: FC<TokenPairViewProps> = (
  props: TokenPairViewProps
) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const classes = tokenPairStyles();
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

  const {
    submitAction,
    excludeZeroBalanceFirstTokenAccount,
    excludeZeroBalanceSecondTokenAccount,
    allowEmptyFirstTokenAccount,
    allowEmptySecondTokenAccount,
    viewTitleKey,
    submitButtonTitleKey,
    enableFirstTokenAccountSelector,
    enableSecondTokenAccountSelector,
    isSwap,
    cardHeaderTitleFirst,
    cardHeaderTitleSecond,
    errorHelperTextFirstAmount,
    errorHelperTextSecondAmount,
    disableFirstAmountField,
    disableSecondAmountField,
    constraints,
  } = props;

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
      <h3 data-testid={SharedTestIds.PAGE_TITLE}>
        <FormattedMessage id={viewTitleKey} />
      </h3>
      <div className={classes.root}>
        <TokenPairToken
          cardHeaderTitle={cardHeaderTitleFirst}
          amount={firstAmount}
          selectTokenHandleChange={selectFirstTokenHandleChange}
          selectTokenAccountHandleChange={selectFirstTokenAccountHandleChange}
          enableTokenAccountSelector={enableFirstTokenAccountSelector}
          excludeZeroBalance={excludeZeroBalanceFirstTokenAccount}
          allowEmptyTokenAccount={allowEmptyFirstTokenAccount}
          showMaxButton={true}
          data-testid={TestIds.TOKEN_SELECTOR_FROM}
          token={firstToken}
          tokenAccount={firstTokenAccount}
          updateAmount={updateFirstAmount}
          setMaxAmount={
            props.setMaxFirstAmount
              ? props.setMaxFirstAmount
              : setMaxFirstAmount
          }
          helperTextAmount={errorHelperTextFirstAmount}
          forceDisableAmount={disableFirstAmountField}
          availablePools={availablePools}
          loading={!!loading}
          tokenAccounts={tokenAccounts}
          availableTokens={availableTokens}
          getTokenABalance={props.getTokenABalance}
          getTokenBBalance={props.getTokenBBalance}
          selectedPool={selectedPool}
        />
        <TokenPairToken
          cardHeaderTitle={cardHeaderTitleSecond}
          amount={secondAmount}
          selectTokenHandleChange={selectSecondTokenHandleChange}
          selectTokenAccountHandleChange={selectSecondTokenAccountHandleChange}
          enableTokenAccountSelector={enableSecondTokenAccountSelector}
          excludeZeroBalance={excludeZeroBalanceSecondTokenAccount}
          allowEmptyTokenAccount={allowEmptySecondTokenAccount}
          showMaxButton={false}
          data-testid={TestIds.TOKEN_SELECTOR_TO}
          token={secondToken}
          tokenAccount={secondTokenAccount}
          helperTextAmount={errorHelperTextSecondAmount}
          availablePools={availablePools}
          forceDisableAmount={disableSecondAmountField}
          tokenAccounts={tokenAccounts}
          availableTokens={availableTokens}
          loading={!!loading}
          getTokenABalance={props.getTokenABalance}
          getTokenBBalance={props.getTokenBBalance}
          selectedPool={selectedPool}
        />
      </div>
      <TokenPairPool
        isSwap={isSwap}
        loading={!!loading}
        selectedPool={selectedPool}
        firstAmount={firstAmount}
        firstToken={firstToken}
      />
      <TokenPairTransactionDetails isSwap={isSwap} loading={!!loading} />
      <TokenPairActions
        submitAction={submitAction}
        submitButtonText={intl.formatMessage({
          id: submitButtonTitleKey,
        })}
        loading={!!loading}
        firstAmount={firstAmount}
        secondAmount={secondAmount}
        constraints={{
          firstTokenBalance: constraints.firstTokenBalance,
          secondTokenBalance: constraints.secondTokenBalance,
        }}
        firstTokenAccount={firstTokenAccount}
        secondTokenAccount={secondTokenAccount}
      />
    </>
  );
};
