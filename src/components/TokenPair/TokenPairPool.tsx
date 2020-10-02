import React, { FC, useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { useIntl } from "react-intl";
import { Pool } from "../../api/pool/Pool";
import { TokenAccount } from "../../api/token/TokenAccount";
import { tokenPairStyles } from "./TokenPairPanel";
import TokenAmountField from "./TokenAmountField";

enum TestIds {
  LIQUIDITY = "LIQUIDITY",
  RATE = "RATE",
}

type TokenPairPoolProps = {
  fromTokenAccount?: TokenAccount;
  fromAmount?: number;
  selectedPool?: Pool;
  loading: boolean;
};

export const TokenPairPool: FC<TokenPairPoolProps> = (
  props: TokenPairPoolProps
) => {
  const intl = useIntl();
  const classes = tokenPairStyles();

  const { selectedPool, fromTokenAccount, fromAmount } = props;

  const getImpliedRate = useCallback(() => {
    if (selectedPool && fromTokenAccount && fromAmount) {
      return selectedPool.impliedRate(fromTokenAccount.mint, fromAmount);
    }

    return null;
  }, [selectedPool, fromTokenAccount, fromAmount]);

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
            <Grid item xs={6}>
              <TextField
                disabled
                label={intl.formatMessage({ id: "tokenPairPool.rate" })}
                data-testid={TestIds.RATE}
                value={getImpliedRate() || ""}
              />
            </Grid>
            <Grid item xs={6}>
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
