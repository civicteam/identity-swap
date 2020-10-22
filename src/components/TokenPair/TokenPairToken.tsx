import React, { ChangeEvent, FC, useCallback } from "react";
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
import { Decimal } from "decimal.js";
import { makeStyles } from "@material-ui/core/styles";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Token } from "../../api/token/Token";
import { Pool } from "../../api/pool/Pool";
import {
  getSortedTokenAccountsByHighestBalance,
  withoutPoolTokens,
} from "../../utils/tokenPair";
import TokenAmountField from "./TokenAmountField";
import { TokenAccountSelector } from "./TokenAccountSelector";

export const useStyles = makeStyles(() => ({
  card: {
    width: 335,
    marginRight: "30px",
    marginBottom: "30px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  },
  maxButton: {
    color: "#DC004E",
    border: "none",
    fontSize: "9px",
    marginTop: "18px",
    width: "20px",
  },
  formControl: {
    width: "100%",
  },
}));

enum TestIds {
  MAX_BUTTON = "MAX_BUTTON",
}

// The change event value cannot be assigned a type
// without casting. See: https://stackoverflow.com/a/58676067
type TokenSelectionEvent = ChangeEvent<{
  name?: string | undefined;
  value: unknown;
}>;

type TokenPairTokenProps = {
  token?: Token;
  tokenAccount?: TokenAccount;
  tokenAccounts: Array<TokenAccount>;
  amount: number;
  selectTokenHandleChange: (token: Token) => void;
  selectTokenAccountHandleChange?: (tokenAccount?: TokenAccount) => void;
  enableTokenAccountSelector?: boolean;
  excludeZeroBalance?: boolean;
  allowEmptyTokenAccount?: boolean;
  setMaxAmount?: () => void;
  updateAmount?: (minorAmount: Decimal) => void;
  showMaxButton: boolean;
  cardHeaderTitle?: string;
  loading: boolean;
  availableTokens: Array<Token>;
  selectedPool?: Pool;
  availablePools: Array<Pool>;
  getTokenABalance?: () => Decimal;
  getTokenBBalance?: () => Decimal;
  "data-testid": string;
  helperTextAmount?: string;
  forceDisableAmount?: boolean;
};
export const TokenPairToken: FC<TokenPairTokenProps> = (
  props: TokenPairTokenProps
) => {
  const classes = useStyles();

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
    selectedPool,
    availablePools,
    getTokenABalance,
    getTokenBBalance,
    "data-testid": dataTestId,
    tokenAccounts,
    selectTokenAccountHandleChange,
    enableTokenAccountSelector,
    excludeZeroBalance,
    allowEmptyTokenAccount,
  } = props;

  const selectableTokens = useCallback(
    () => withoutPoolTokens(availablePools, availableTokens),
    [availablePools, availableTokens]
  );

  const handleTokenChangeEvent = (event: TokenSelectionEvent) => {
    const selectedToken = availableTokens.find(
      (token) => token.address.toBase58() === (event.target.value as string)
    );

    // this will only happen if a token selection event is triggered
    // for a token that is not in the availableTokens list
    // but since the dropdown is populated from that list, we can ignore this here.
    if (!selectedToken) return;

    props.selectTokenHandleChange(selectedToken);
  };

  const getBalance = useCallback(() => {
    // the balance is just based on the balance of the token account
    if (!getTokenABalance || !getTokenBBalance) {
      return tokenAccount ? tokenAccount.balance.toNumber() : undefined;
    }

    if (selectedPool && token) {
      if (selectedPool.tokenA.mint.equals(token)) {
        return getTokenABalance();
      }

      if (selectedPool.tokenB.mint.equals(token)) {
        return getTokenBBalance();
      }
    }

    return 0;
  }, [token, tokenAccount, selectedPool, getTokenABalance, getTokenBBalance]);

  const getFilteredTokenAccounts = useCallback(() => {
    return (
      token &&
      getSortedTokenAccountsByHighestBalance(
        token,
        tokenAccounts,
        excludeZeroBalance || false
      )
    );
  }, [token, tokenAccounts, excludeZeroBalance]);

  const filteredTokenAccounts = getFilteredTokenAccounts();

  return (
    <Card className={classes.card}>
      {cardHeaderTitle && <CardHeader title={cardHeaderTitle} />}
      <CardContent>
        <Grid container spacing={1}>
          <Grid
            item
            xs={
              enableTokenAccountSelector &&
              filteredTokenAccounts &&
              filteredTokenAccounts.length > 1
                ? 10
                : 12
            }
          >
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
                {selectableTokens().map((token: Token) => {
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
          {enableTokenAccountSelector &&
            selectTokenAccountHandleChange &&
            filteredTokenAccounts &&
            filteredTokenAccounts.length > 1 && (
              <Grid item xs={2}>
                <TokenAccountSelector
                  tokenAccounts={filteredTokenAccounts || []}
                  selectTokenAccountHandleChange={
                    selectTokenAccountHandleChange
                  }
                  selectedTokenAccount={tokenAccount}
                  allowEmptyTokenAccount={allowEmptyTokenAccount}
                  data-testid={dataTestId + "_ACCOUNT"}
                />
              </Grid>
            )}
          <Grid item xs={4}>
            <TokenAmountField
              token={token}
              label="tokenPairToken.balance"
              amount={getBalance()}
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
                data-testid={TestIds.MAX_BUTTON}
              >
                MAX
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
