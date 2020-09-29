import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { Pool, SerializablePool } from "../../api/pool/Pool";
import { tokenPairStyles } from "./TokenPairPanel";

type TokenPairPoolProps = {
  selectedPool?: SerializablePool;
  loading: boolean;
};

export const TokenPairPool = (props: TokenPairPoolProps): JSX.Element => {
  const classes = tokenPairStyles();

  const { selectedPool } = props;

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
                value={pool?.getLiquidity() || ""}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
