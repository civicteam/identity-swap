import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import { useDispatch, useSelector } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import { RootState } from "../../app/rootReducer";
import { swapStyles } from "./SwapAdd";

import { executeSwap } from "./SwapSlice";

enum TestIds {
  LOADING = "LOADING",
  ACTION = "ACTION",
}

export const SwapActions: FC = () => {
  const classes = swapStyles();
  const dispatch = useDispatch();

  const {
    loading,
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
  } = useSelector((state: RootState) => state.swap);

  const submit = (event: React.FormEvent) => {
    dispatch(executeSwap());
    event.preventDefault();
  };

  let swapButtonText = "SWAP";
  let disableSwapButton = false;
  if (!fromTokenAccount || !toTokenAccount) {
    disableSwapButton = true;
  } else if (
    fromAmount > fromTokenAccount.balance ||
    toAmount > toTokenAccount.balance
  ) {
    swapButtonText = "INSUFFICIENT BALANCE";
    disableSwapButton = true;
  } else if (fromAmount === 0 || toAmount === 0) {
    swapButtonText = "ENTER AMOUNT";
    disableSwapButton = true;
  }
  return (
    <>
      <form onSubmit={submit}>
        <div className={classes.root}>
          <Card className={classes.card}>
            {loading && <LinearProgress data-testid={TestIds.LOADING} />}
            <CardActions disableSpacing>
              <Button
                disabled={loading || disableSwapButton}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.swapButton}
                data-testid={TestIds.ACTION}
              >
                {swapButtonText}
              </Button>
            </CardActions>
          </Card>
        </div>
      </form>
    </>
  );
};
