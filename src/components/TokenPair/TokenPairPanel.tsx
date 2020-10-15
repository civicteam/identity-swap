import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { Decimal } from "decimal.js";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { BalanceConstraints, TokenPairState } from "../../utils/types";
import { Token } from "../../api/token/Token";
import { filterOutMissingProps } from "../../utils/state";
import { TokenPairActions } from "./TokenPairActions";
import { TokenPairPool } from "./TokenPairPool";
import { TokenPairToken } from "./TokenPairToken";

export const tokenPairStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: "none",
    padding: "15px",
  },
  card: {
    width: 450,
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
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: red[500],
  },
  maxButton: {
    color: "#DC004E",
    border: "1px solid rgb(220, 0, 78)",
    fontSize: "9px",
    marginTop: "18px",
  },
  selectTokenButton: {
    marginTop: "12px",
    fontSize: "9px",
  },
  submitButton: {
    width: "100%",
  },
  formControl: {
    width: "100%",
  },
}));

type TokenPairPanelProps = {
  submitAction: () => void;
  afterUpdateState?: () => void;
  submitButtonText: string;
  loading: boolean;
  firstAmount: number;
  secondAmount: number;
  firstToken?: Token;
  secondToken?: Token;
  firstTokenAccount?: TokenAccount;
  secondTokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  selectedPool?: Pool;
  updateState: (state: Partial<TokenPairState>) => void;
  selectFirstTokenHandleChange: (token: Token) => void;
  selectSecondTokenHandleChange: (token: Token) => void;
  selectFirstTokenAccountHandleChange?: (tokenAccount?: TokenAccount) => void;
  selectSecondTokenAccountHandleChange?: (tokenAccount?: TokenAccount) => void;
  enableFirstTokenAccountSelector?: boolean;
  enableSecondTokenAccountSelector?: boolean;
  excludeZeroBalanceFirstTokenAccount?: boolean;
  excludeZeroBalanceSecondTokenAccount?: boolean;
  allowEmptyFirstTokenAccount?: boolean;
  allowEmptySecondTokenAccount?: boolean;
  cardHeaderTitleFirst: string;
  cardHeaderTitleSecond: string;
  constraints: BalanceConstraints;
  getTokenABalance?: () => Decimal;
  getTokenBBalance?: () => Decimal;
  availableTokens: Array<Token>;
  availablePools: Array<Pool>;
  setMaxFirstAmount?: () => void;
  updateFirstAmount?: (minorAmount: Decimal) => void;
  errorHelperTextFirstAmount?: string;
  errorHelperTextSecondAmount?: string;
  disableFirstAmountField?: boolean;
  isSwap: boolean;
};

enum TestIds {
  TOKEN_SELECTOR_FROM = "TOKEN_SELECTOR_FROM",
  TOKEN_SELECTOR_TO = "TOKEN_SELECTOR_TO",
}

export const TokenPairPanel: FC<TokenPairPanelProps> = (
  props: TokenPairPanelProps
) => {
  const {
    firstTokenAccount,
    firstToken,
    secondToken,
    secondTokenAccount,
    errorHelperTextFirstAmount,
    errorHelperTextSecondAmount,
    disableFirstAmountField,
    excludeZeroBalanceFirstTokenAccount,
    excludeZeroBalanceSecondTokenAccount,
  } = props;

  const updateState = (updatePayload: Partial<TokenPairState>) =>
    props.updateState(
      // the update payload may or may not include firstTokenAccount and secondTokenAccount.
      // ?.serialize() returns undefined, if they are missing
      // filterOutMissingProps removes these keys if their values are undefined
      filterOutMissingProps({
        ...updatePayload,
        firstTokenAccount: updatePayload.firstTokenAccount,
        firstToken: updatePayload.firstToken,
        secondTokenAccount: updatePayload.secondTokenAccount,
        secondToken: updatePayload.secondToken,
      })
    );

  const childProps = {
    ...props,
    updateState,
  };

  return (
    <>
      <TokenPairToken
        {...childProps}
        cardHeaderTitle={childProps.cardHeaderTitleFirst}
        amount={props.firstAmount}
        selectTokenHandleChange={props.selectFirstTokenHandleChange}
        selectTokenAccountHandleChange={
          props.selectFirstTokenAccountHandleChange
        }
        enableTokenAccountSelector={props.enableFirstTokenAccountSelector}
        excludeZeroBalance={excludeZeroBalanceFirstTokenAccount}
        allowEmptyTokenAccount={props.allowEmptyFirstTokenAccount}
        showMaxButton={true}
        data-testid={TestIds.TOKEN_SELECTOR_FROM}
        token={firstToken}
        tokenAccount={firstTokenAccount}
        updateAmount={props.updateFirstAmount}
        setMaxAmount={props.setMaxFirstAmount}
        helperTextAmount={errorHelperTextFirstAmount}
        forceDisableAmount={disableFirstAmountField}
        availablePools={props.availablePools}
      />
      <TokenPairToken
        {...childProps}
        cardHeaderTitle={childProps.cardHeaderTitleSecond}
        amount={props.secondAmount}
        selectTokenHandleChange={props.selectSecondTokenHandleChange}
        selectTokenAccountHandleChange={
          props.selectSecondTokenAccountHandleChange
        }
        enableTokenAccountSelector={props.enableSecondTokenAccountSelector}
        excludeZeroBalance={excludeZeroBalanceSecondTokenAccount}
        allowEmptyTokenAccount={props.allowEmptySecondTokenAccount}
        showMaxButton={false}
        data-testid={TestIds.TOKEN_SELECTOR_TO}
        token={secondToken}
        tokenAccount={secondTokenAccount}
        helperTextAmount={errorHelperTextSecondAmount}
        availablePools={props.availablePools}
      />
      <TokenPairPool {...childProps} />
      <TokenPairActions {...childProps} />
    </>
  );
};
