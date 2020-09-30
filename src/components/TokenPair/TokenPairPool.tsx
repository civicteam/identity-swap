import React, { FC, useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../../api/token/TokenAccount";
import { tokenPairStyles } from "./TokenPairPanel";

enum TestIds {
  LIQUIDITY = "LIQUIDITY",
  RATE = "RATE",
}

type TokenPairPoolProps = {
  fromTokenAccount?: SerializableTokenAccount;
  fromAmount?: number;
  selectedPool?: SerializablePool;
  loading: boolean;
};

export const TokenPairPool: FC<TokenPairPoolProps> = (
  props: TokenPairPoolProps
) => {
  const classes = tokenPairStyles();

  const {
    selectedPool: serializedPool,
    fromTokenAccount: serializedFromTokenAccounts,
    fromAmount,
  } = props;

  const pool = serializedPool && Pool.from(serializedPool);
  const fromTokenAccount =
    serializedFromTokenAccounts &&
    TokenAccount.from(serializedFromTokenAccounts);

  const getImpliedRate = useCallback(() => {
    if (pool && fromTokenAccount && fromAmount) {
      return pool.impliedRate(fromTokenAccount.mint, fromAmount);
    }

    return null;
  }, [pool, fromTokenAccount, fromAmount]);

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                className={classes.formControl}
                disabled
                label="Pool"
                value={pool?.address || ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                disabled
                label="Rate"
                data-testid={TestIds.RATE}
                value={getImpliedRate() || ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                disabled
                label="Liquidity"
                data-testid={TestIds.LIQUIDITY}
                value={pool?.getLiquidity() || ""}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
