import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import { useDispatch } from "react-redux";
import { LinearProgress } from "@material-ui/core";
import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { tokenPairStyles } from "./TokenPairPanel";

type TokenPairActionsProps = {
  submitAction: () => void;
  submitButtonText: string;
  loading: boolean;
  fromAmount: number;
  toAmount: number;
  fromTokenAccount?: SerializableTokenAccount;
  toTokenAccount?: SerializableTokenAccount;
};

export const TokenPairActions = (props: TokenPairActionsProps): JSX.Element => {
  const classes = tokenPairStyles();
  const dispatch = useDispatch();

  const {
    loading,
    fromAmount,
    toAmount,
    fromTokenAccount,
    toTokenAccount,
    submitAction,
    submitButtonText,
  } = props;

  const submit = (event: React.FormEvent) => {
    dispatch(submitAction());
    event.preventDefault();
  };

  let tokenPairButtonText = submitButtonText;
  let disableTokenPairButton = false;
  if (!fromTokenAccount || !toTokenAccount) {
    disableTokenPairButton = true;
  } else if (
    fromAmount > fromTokenAccount.balance ||
    toAmount > toTokenAccount.balance
  ) {
    tokenPairButtonText = "INSUFFICIENT BALANCE";
    disableTokenPairButton = true;
  } else if (fromAmount === 0 || toAmount === 0) {
    tokenPairButtonText = "ENTER AMOUNT";
    disableTokenPairButton = true;
  }
  return (
    <>
      <form onSubmit={submit}>
        <div className={classes.root}>
          <Card className={classes.card}>
            {loading && <LinearProgress />}
            <CardActions disableSpacing>
              <Button
                disabled={loading || disableTokenPairButton}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
              >
                {tokenPairButtonText}
              </Button>
            </CardActions>
          </Card>
        </div>
      </form>
    </>
  );
};
