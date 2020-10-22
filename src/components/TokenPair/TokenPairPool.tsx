import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { useIntl } from "react-intl";
import { makeStyles } from "@material-ui/core/styles";
import { Pool } from "../../api/pool/Pool";
import { Token } from "../../api/token/Token";
import TokenAmountField from "./TokenAmountField";

const useStyles = makeStyles(() => ({
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
  selectTokenButton: {
    marginTop: "12px",
    fontSize: "9px",
  },
  formControl: {
    width: "100%",
  },
}));

enum TestIds {
  LIQUIDITY = "LIQUIDITY",
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
  const classes = useStyles();

  const { selectedPool } = props;

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
