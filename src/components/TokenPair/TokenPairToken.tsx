import React, { FC } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { SerializableTokenAccount } from "../../api/token/TokenAccount";
import { tokenPairStyles } from "./TokenPairPanel";

type TokenPairTokenProps = {
  tokenAccount?: SerializableTokenAccount;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectTokenHandleChange: (event: any) => void;
  setMaxAmount?: () => void;
  updateAmount?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showMaxButton: boolean;
  cardHeaderTitle: string;
  disableAmountInput: boolean;
  loading: boolean;
  tokenAccounts: Array<SerializableTokenAccount>;
  "data-testid": string;
};

export const TokenPairToken: FC<TokenPairTokenProps> = (
  props: TokenPairTokenProps
) => {
  const classes = tokenPairStyles();

  const {
    tokenAccount,
    amount,
    showMaxButton,
    cardHeaderTitle,
    disableAmountInput,
    loading,
    tokenAccounts,
    "data-testid": dataTestId,
  } = props;
  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        {cardHeaderTitle && <CardHeader title={cardHeaderTitle} />}
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
                  data-testid={dataTestId}
                >
                  <MenuItem key="0" value="" />
                  {tokenAccounts &&
                    tokenAccounts.map(
                      (token: SerializableTokenAccount, index: number) => {
                        return (
                          <MenuItem
                            key={index + 1}
                            value={token.mint.symbol}
                            data-testid={dataTestId + "_ELEMENT"}
                          >
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
                data-testid={dataTestId + "_BALANCE"}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Enter amount to deposit"
                disabled={loading || disableAmountInput}
                required={true}
                value={amount}
                onChange={props.updateAmount}
                InputLabelProps={{ shrink: true }}
                data-testid={dataTestId + "_AMOUNT"}
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
