import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { SerializablePool } from "../../api/pool/Pool";
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
  fromTokenAccount?: SerializableTokenAccount;
  toTokenAccount?: SerializableTokenAccount;
  tokenAccounts: Array<SerializableTokenAccount>;
  selectFromTokenAccount: (
    selectedTokenAccount: SerializableTokenAccount
  ) => void;
  selectToTokenAccount: (
    selectedTokenAccount: SerializableTokenAccount
  ) => void;
  setFromAmount: (amount: number) => void;
  selectedPool?: SerializablePool;
};

export const TokenPairPanel: FC<TokenPairPanelProps> = (
  props: TokenPairPanelProps
) => {
  return (
    <>
      <TokenPairFromToken {...props} />
      <TokenPairToToken {...props} />
      <TokenPairPool {...props} />
      <TokenPairActions {...props} />
    </>
  );
};
