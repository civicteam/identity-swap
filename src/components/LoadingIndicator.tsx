import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { TestIds } from "../utils/sharedTestIds";
import { RootState } from "../app/rootReducer";

const useStyles = makeStyles((theme) => ({
  card: {},
}));

const LoadingIndicator = () => {
  const loading = useSelector((state: RootState) => !!state.global.loading);
  const classes = useStyles();

  return <>{loading && <LinearProgress data-testid={TestIds.LOADING} />}</>;
};

export default LoadingIndicator;
