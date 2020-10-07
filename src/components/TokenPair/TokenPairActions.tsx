import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { TokenAccount } from "../../api/token/TokenAccount";
import { BalanceConstraints } from "../../utils/types";
import { tokenPairStyles } from "./TokenPairPanel";

type TokenPairActionsProps = {
  submitAction: () => void;
  submitButtonText: string;
  loading: boolean;
  firstAmount: number;
  secondAmount: number;
  firstTokenAccount?: TokenAccount;
  secondTokenAccount?: TokenAccount;
  constraints: BalanceConstraints;
};

enum TestIds {
  LOADING = "LOADING",
  ACTION = "ACTION",
}

export const TokenPairActions: FC<TokenPairActionsProps> = (
  props: TokenPairActionsProps
) => {
  const intl = useIntl();
  const classes = tokenPairStyles();
  const dispatch = useDispatch();

  const {
    loading,
    firstAmount,
    secondAmount,
    firstTokenAccount,
    secondTokenAccount,
    submitAction,
    submitButtonText,
    constraints,
  } = props;

  const submit = (event: React.FormEvent) => {
    dispatch(submitAction());
    event.preventDefault();
  };

  let tokenPairButtonText = submitButtonText;
  let disableTokenPairButton = false;
  if (!firstTokenAccount || !secondTokenAccount) {
    disableTokenPairButton = true;
  } else if (
    (constraints.firstTokenBalance &&
      firstAmount > firstTokenAccount.balance) ||
    (constraints.secondTokenBalance &&
      secondAmount > secondTokenAccount.balance)
  ) {
    tokenPairButtonText = intl.formatMessage({
      id: "tokenPairActions.insufficientBalance",
    });
    disableTokenPairButton = true;
  } else if (firstAmount === 0 || secondAmount === 0) {
    tokenPairButtonText = intl.formatMessage({
      id: "tokenPairActions.enterAmount",
    });
    disableTokenPairButton = true;
  }

  return (
    <>
      <form onSubmit={submit}>
        <div className={classes.root}>
          <Card className={classes.card}>
            <CardActions disableSpacing>
              <Button
                disabled={loading || disableTokenPairButton}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
                data-testid={TestIds.ACTION}
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
