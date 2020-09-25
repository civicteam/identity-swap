import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import { useSelector } from "react-redux";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { RootState } from "../../app/rootReducer";

import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { swapStyles } from "./SwapAdd";

type SwapTokenProps = {
  tokenAccount?: SerializableTokenAccount;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectTokenHandleChange: (event: any) => void;
  setMaxAmount?: () => void;
  updateAmount?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showMaxButton: boolean;
  cardHeaderTitle: string;
  disableAmountInput: boolean;
};

export const SwapToken = (props: SwapTokenProps): JSX.Element => {
  const classes = swapStyles();

  const { loading, tokenAccounts } = useSelector(
    (state: RootState) => state.swap
  );
  const {
    tokenAccount,
    amount,
    showMaxButton,
    cardHeaderTitle,
    disableAmountInput,
  } = props;
  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardHeader title={cardHeaderTitle} />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <InputLabel>Token</InputLabel>
                <Select
                  required={true}
                  disabled={loading}
                  value={tokenAccount ? tokenAccount.mint.symbol : ""}
                  onChange={props.selectTokenHandleChange}
                >
                  <MenuItem key="0" value="" />
                  {tokenAccounts &&
                    tokenAccounts.map(
                      (token: SerializableTokenAccount, index: number) => {
                        return (
                          <MenuItem key={index + 1} value={token.mint.symbol}>
                            {token.mint.symbol}
                          </MenuItem>
                        );
                      }
                    )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                disabled
                label="Balance"
                value={tokenAccount ? tokenAccount.balance : 0}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Enter amount to swap"
                disabled={loading || disableAmountInput}
                required={true}
                value={amount}
                onChange={props.updateAmount}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {showMaxButton && (
              <Grid item xs={2}>
                <Button
                  disabled={loading}
                  variant="outlined"
                  className={classes.maxButton}
                  onClick={props.setMaxAmount}
                >
                  MAX
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
