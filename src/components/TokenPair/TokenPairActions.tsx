import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import { makeStyles } from "@material-ui/core/styles";
import { TokenAccount } from "../../api/token/TokenAccount";
import { BalanceConstraints } from "../../utils/types";
import { toDecimal } from "../../utils/amount";

export const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "none",
    padding: "15px",
  },
  card: {
    width: 335,
    marginRight: "30px",
  },
  submitButton: {
    width: "100%",
  },
}));

type TokenPairActionsProps = {
  submitAction: () => void;
  submitButtonText: string;
  loading: boolean;
  firstAmount: number;
  secondAmount: number;
  firstTokenAccount?: TokenAccount;
  secondTokenAccount?: TokenAccount;
  constraints: BalanceConstraints;
  afterUpdateState?: () => void;
  allowEmptyFirstTokenAccount?: boolean;
  allowEmptySecondTokenAccount?: boolean;
};

enum TestIds {
  LOADING = "LOADING",
  ACTION = "ACTION",
}

export const TokenPairActions: FC<TokenPairActionsProps> = (
  props: TokenPairActionsProps
) => {
  const intl = useIntl();
  const classes = useStyles();
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
    afterUpdateState,
    allowEmptyFirstTokenAccount,
    allowEmptySecondTokenAccount,
  } = props;

  const submit = (event: React.FormEvent) => {
    dispatch(submitAction());
    if (afterUpdateState) afterUpdateState();
    event.preventDefault();
  };

  const shouldDisableInsufficientBalanceFirstTokenAccount =
    !allowEmptyFirstTokenAccount &&
    firstTokenAccount &&
    constraints.firstTokenBalance &&
    toDecimal(firstAmount).gt(firstTokenAccount.balance);

  const shouldDisableInsufficientBalanceSecondTokenAccount =
    !allowEmptySecondTokenAccount &&
    secondTokenAccount &&
    constraints.secondTokenBalance &&
    toDecimal(secondAmount).gt(secondTokenAccount?.balance);

  let tokenPairButtonText = submitButtonText;
  let disableTokenPairButton = false;

  if (
    (!firstTokenAccount && !allowEmptyFirstTokenAccount) ||
    (!secondTokenAccount && !allowEmptySecondTokenAccount)
  ) {
    // if the first and second token accounts are not selected
    // this logic is changed by the flag allowing one of the token account to be empty
    // useful in cases where the token pair view allows for on of the token accounts to be null, as it will be created
    // at runtime
    disableTokenPairButton = true;
  } else if (
    shouldDisableInsufficientBalanceFirstTokenAccount ||
    shouldDisableInsufficientBalanceSecondTokenAccount
  ) {
    // if the first token account can be empty and the amount is not higher the the account balance
    // the same rule applies to the second token account
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
