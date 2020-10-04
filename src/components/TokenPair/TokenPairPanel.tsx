import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import {
  BalanceConstraints,
  TokenPairState,
  TokenPairUpdate,
} from "../../utils/types";
import { Token } from "../../api/token/Token";
import { filterOutMissingProps } from "../../utils/state";
import { TokenPairFromToken } from "./TokenPairFromToken";
import { TokenPairToToken } from "./TokenPairToToken";
import { TokenPairActions } from "./TokenPairActions";
import { TokenPairPool } from "./TokenPairPool";

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
  fromAmount: number;
  toAmount: number;
  fromToken?: Token;
  toToken?: Token;
  fromTokenAccount?: TokenAccount;
  toTokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  selectedPool?: Pool;
  updateState: (state: Partial<TokenPairState>) => void;
  cardHeaderTitleFrom: string;
  cardHeaderTitleTo: string;
  constraints: BalanceConstraints;
  getTokenABalance?: () => number;
  getTokenBBalance?: () => number;
};

export const TokenPairPanel: FC<TokenPairPanelProps> = (
  props: TokenPairPanelProps
) => {
  const updateState = (updatePayload: Partial<TokenPairUpdate>) =>
    props.updateState(
      // the update payload may or may not include fromTokenAccount and toTokenAccount.
      // ?.serialize() returns undefined, if they are missing
      // filterOutMissingProps removes these keys if their values are undefined
      filterOutMissingProps({
        ...updatePayload,
        fromTokenAccount: updatePayload.fromTokenAccount?.serialize(),
        toTokenAccount: updatePayload.toTokenAccount?.serialize(),
      })
    );

  const childProps = {
    ...props,
    updateState,
  };

  return (
    <>
      <TokenPairFromToken
        {...childProps}
        cardHeaderTitle={childProps.cardHeaderTitleFrom}
      />
      <TokenPairToToken
        {...childProps}
        cardHeaderTitle={childProps.cardHeaderTitleTo}
      />
      <TokenPairPool {...childProps} />
      <TokenPairActions {...childProps} />
    </>
  );
};
