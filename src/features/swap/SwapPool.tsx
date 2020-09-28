import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { Pool } from "../../api/pool/Pool";
import { swapStyles } from "./SwapAdd";

enum TestIds {
  SWAP_LIQUIDITY = "SWAP_LIQUIDITY",
}

export const SwapPool: FC = () => {
  const classes = swapStyles();

  const { selectedPool } = useSelector((state: RootState) => state.swap);

  let pool;
  if (selectedPool) pool = Pool.from(selectedPool);

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
                value={selectedPool?.address || ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField disabled label="Rate" value={pool?.getRate() || ""} />
            </Grid>
            <Grid item xs={6}>
              <TextField
                disabled
                label="Liquidity"
                data-testid={TestIds.SWAP_LIQUIDITY}
                value={pool?.getLiquidity() || ""}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
