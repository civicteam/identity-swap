import { LinearProgress } from "@material-ui/core";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { TestIds } from "../utils/sharedTestIds";
import { RootState } from "../app/rootReducer";

const LoadingIndicator: FC = () => {
  const loading = useSelector((state: RootState) => !!state.global.loading);

  return <>{loading && <LinearProgress data-testid={TestIds.LOADING} />}</>;
};

export default LoadingIndicator;
