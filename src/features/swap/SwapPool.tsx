import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { swapStyles } from "./SwapAdd";

export const SwapPool: FC = () => {
  const classes = swapStyles();

  const { poolAddress, poolRate, poolLiquidity } = useSelector(
    (state: RootState) => state.swap
  );

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
                value={poolAddress || ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField disabled label="Rate" value={poolRate || ""} />
            </Grid>
            <Grid item xs={6}>
              <TextField
                disabled
                label="Liquidity"
                value={poolLiquidity || ""}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
