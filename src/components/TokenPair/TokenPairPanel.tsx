import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
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
  cardHeaderTitleFrom: string;
  cardHeaderTitleTo: string;
  constraints: BalanceConstraints;
  availableTokens: Array<Token>;
  setMaxFromAmount?: () => void;
  updateFromAmount?: (minorAmount: number) => void;
  errorHelperTextFromAmount?: string;
  errorHelperTextToAmount?: string;
  disableFromAmountField?: boolean;
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
    errorHelperTextFromAmount,
    errorHelperTextToAmount,
    disableFromAmountField,
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
        cardHeaderTitle={childProps.cardHeaderTitleFrom}
        amount={props.firstAmount}
        selectTokenHandleChange={props.selectFirstTokenHandleChange}
        showMaxButton={true}
        data-testid={TestIds.TOKEN_SELECTOR_FROM}
        token={firstToken}
        tokenAccount={firstTokenAccount}
        updateAmount={props.updateFromAmount}
        setMaxAmount={props.setMaxFromAmount}
        helperTextAmount={errorHelperTextFromAmount}
        forceDisableAmount={disableFromAmountField}
      />
      <TokenPairToken
        {...childProps}
        cardHeaderTitle={childProps.cardHeaderTitleTo}
        amount={props.secondAmount}
        selectTokenHandleChange={props.selectSecondTokenHandleChange}
        showMaxButton={false}
        data-testid={TestIds.TOKEN_SELECTOR_TO}
        token={secondToken}
        tokenAccount={secondTokenAccount}
        helperTextAmount={errorHelperTextToAmount}
      />
      <TokenPairPool {...childProps} />
      <TokenPairActions {...childProps} />
    </>
  );
};
