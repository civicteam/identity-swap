import React, { ChangeEvent, FC } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { FormattedMessage } from "react-intl";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Token } from "../../api/token/Token";
import { tokenPairStyles } from "./TokenPairPanel";
import TokenAmountField from "./TokenAmountField";

// The change event value cannot be assigned a type
// without casting. See: https://stackoverflow.com/a/58676067
type TokenSelectionEvent = ChangeEvent<{
  name?: string | undefined;
  value: unknown;
}>;

type TokenPairTokenProps = {
  token?: Token;
  tokenAccount?: TokenAccount;
  amount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectTokenHandleChange: (event: any) => void;
  setMaxAmount?: () => void;
  updateAmount?: (minorAmount: number) => void;
  showMaxButton: boolean;
  cardHeaderTitle: string;
  loading: boolean;
  availableTokens: Array<Token>;
  "data-testid": string;
  helperTextAmount?: string;
  forceDisableAmount?: boolean;
};
export const TokenPairToken: FC<TokenPairTokenProps> = (
  props: TokenPairTokenProps
) => {
  const classes = tokenPairStyles();

  const {
    token,
    tokenAccount,
    amount,
    showMaxButton,
    cardHeaderTitle,
    loading,
    availableTokens,
    updateAmount,
    helperTextAmount,
    forceDisableAmount,
    "data-testid": dataTestId,
  } = props;

  const handleTokenChangeEvent = (event: TokenSelectionEvent) =>
    props.selectTokenHandleChange(
      availableTokens.find(
        (token) => token.address.toBase58() === (event.target.value as string)
      )
    );

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        {cardHeaderTitle && <CardHeader title={cardHeaderTitle} />}
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <InputLabel>
                  <FormattedMessage id="tokenPairToken.token" />
                </InputLabel>
                <Select
                  required={true}
                  disabled={loading}
                  value={token?.address.toBase58() || ""}
                  onChange={handleTokenChangeEvent}
                  data-testid={dataTestId}
                >
                  <MenuItem key="" value="" />
                  {availableTokens &&
                    availableTokens.map((token: Token) => {
                      return (
                        <MenuItem
                          key={token.symbol || token.address.toBase58()}
                          value={token.address.toBase58()}
                          data-testid={dataTestId + "_ELEMENT_" + token.symbol}
                        >
                          {token.symbol}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TokenAmountField
                token={token}
                label="tokenPairToken.balance"
                amount={tokenAccount?.balance}
                dataTestId={dataTestId + "_BALANCE"}
              />
            </Grid>
            <Grid item xs={6}>
              <TokenAmountField
                amount={amount}
                token={token}
                label={
                  updateAmount ? undefined : "tokenPairToken.convertedAmount"
                }
                updateAmount={updateAmount}
                dataTestId={dataTestId + "_AMOUNT"}
                inputLabelProps={{ shrink: true }}
                disabled={forceDisableAmount}
                helperText={helperTextAmount}
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
