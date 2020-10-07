import React, { FC, useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { useIntl } from "react-intl";
import { Pool } from "../../api/pool/Pool";
import { Token } from "../../api/token/Token";
import FormattedNumberField from "../FormattedNumberField";
import { tokenPairStyles } from "./TokenPairPanel";
import TokenAmountField from "./TokenAmountField";

enum TestIds {
  LIQUIDITY = "LIQUIDITY",
  RATE = "RATE",
  FEE = "FEE",
}

type TokenPairPoolProps = {
  firstToken?: Token;
  firstAmount?: number;
  selectedPool?: Pool;
  loading: boolean;
  isSwap: boolean;
};

export const TokenPairPool: FC<TokenPairPoolProps> = (
  props: TokenPairPoolProps
) => {
  const intl = useIntl();
  const classes = tokenPairStyles();

  const { selectedPool, firstToken, firstAmount, isSwap } = props;

  const getImpliedRate = useCallback(() => {
    if (selectedPool && firstToken && firstAmount) {
      return selectedPool.impliedRate(firstToken, firstAmount);
    }
    return undefined;
  }, [selectedPool, firstToken, firstAmount]);

  const getFeeProperties = useCallback(() => {
    if (isSwap && selectedPool && firstToken && firstAmount) {
      return {
        amount: selectedPool.impliedFee(firstToken, firstAmount),
        token: selectedPool.otherToken(firstToken),
      };
    }
    return undefined;
  }, [isSwap, selectedPool, firstToken, firstAmount]);

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                className={classes.formControl}
                disabled
                label={intl.formatMessage({ id: "tokenPairPool.pool" })}
                value={selectedPool?.address || ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs>
              <FormattedNumberField
                label="tokenPairPool.rate"
                value={getImpliedRate()}
                dataTestId={TestIds.RATE}
              />
            </Grid>
            {isSwap && (
              <Grid item xs>
                <TokenAmountField
                  label="tokenPairPool.fee"
                  amount={getFeeProperties()?.amount}
                  token={getFeeProperties()?.token}
                  dataTestId={TestIds.FEE}
                  inputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs>
              <TokenAmountField
                label="tokenPairPool.liquidity"
                token={selectedPool?.poolToken}
                amount={selectedPool?.getLiquidity()}
                dataTestId={TestIds.LIQUIDITY}
                inputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
