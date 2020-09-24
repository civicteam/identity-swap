import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { SwapFromToken } from "./SwapFromToken";
import { SwapToToken } from "./SwapToToken";
import { SwapActions } from "./SwapActions";
import { SwapPool } from "./SwapPool";

export const swapStyles = makeStyles((theme) => ({
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
  swapButton: {
    width: "100%",
  },
  formControl: {
    width: "100%",
  },
}));

export const SwapAdd: FC = () => {
  return (
    <>
      <SwapFromToken />
      <SwapToToken />
      <SwapPool />
      <SwapActions />
    </>
  );
};
