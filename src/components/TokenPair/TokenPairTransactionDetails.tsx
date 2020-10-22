import React, { FC, useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import FormattedNumberField from "../FormattedNumberField";
import { tokenPairSelector } from "../../utils/tokenPair";
import { adjustForSlippage } from "../../api/pool/Pool";
import { formatValueWithDecimals } from "../../utils/amount";
import TokenAmountField from "./TokenAmountField";
import { SlippageSelector } from "./SlippageSelector";

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
  title: {
    fontSize: "14px",
  },
  helpIcon: {
    marginTop: "20px",
  },
}));

enum TestIds {
  RATE = "RATE",
  FEE = "FEE",
  MINIMUM_AMOUNT = "MINIMUM_AMOUNT",
}

type TokenPairTransactionDetailsProps = {
  loading: boolean;
  isSwap: boolean;
  showPoolTokenAmount?: boolean;
};

export const TokenPairTransactionDetails: FC<TokenPairTransactionDetailsProps> = (
  props: TokenPairTransactionDetailsProps
) => {
  const intl = useIntl();
  const classes = useStyles();

  const { isSwap } = props;

  const {
    selectedPool,
    firstToken,
    secondToken,
    firstAmount,
    secondAmount,
    slippage,
    poolTokenAccount,
  } = useSelector(tokenPairSelector);

  const getImpliedRate = useCallback(() => {
    if (selectedPool && firstToken && firstAmount) {
      return selectedPool.impliedRate(firstToken, firstAmount);
    }
    return undefined;
  }, [selectedPool, firstToken, firstAmount]);

  const getFeeProperties = useCallback(() => {
    if (isSwap && selectedPool && firstToken && firstAmount) {
      return {
        amount: selectedPool.impliedFee(firstToken, firstAmount),
        token: selectedPool.otherToken(firstToken),
      };
    }
    return undefined;
  }, [isSwap, selectedPool, firstToken, firstAmount]);

  const formatValue = useCallback(
    (value: string, decimals: number): string => {
      const formattedValueString = formatValueWithDecimals(value, decimals);
      // amount is always respecting the decimals from the token, so we have to format the value accordingly
      return intl.formatNumber(Number(formattedValueString));
    },
    [intl]
  );

  const getFormattedAmountsWithSlippage = useCallback(() => {
    if (selectedPool && poolTokenAccount && firstAmount && firstToken) {
      const poolTokenAmount = selectedPool.getPoolTokenValueOfTokenAAmount(
        firstAmount
      );
      const calculatedAmount = selectedPool.calculateAmountsWithSlippage(
        poolTokenAmount,
        "down",
        slippage
      );

      return {
        poolTokenAmount: formatValue(
          calculatedAmount.poolTokenAmount.toString(),
          firstToken.decimals
        ),
        tokenAAmount: formatValue(
          calculatedAmount.tokenAAmount.toString(),
          firstToken.decimals
        ),
        tokenBAmount: formatValue(
          calculatedAmount.tokenBAmount.toString(),
          firstToken.decimals
        ),
      };
    }
    return undefined;
  }, [
    selectedPool,
    poolTokenAccount,
    firstAmount,
    firstToken,
    formatValue,
    slippage,
  ]);

  const getFormattedAmountWithSlippageForSwap = useCallback(() => {
    if (selectedPool && secondAmount && firstToken) {
      const adjustedAmount = adjustForSlippage(
        secondAmount,
        "down",
        slippage
      ).toString();
      return formatValue(adjustedAmount, firstToken.decimals);
    }
    return undefined;
  }, [selectedPool, firstToken, formatValue, secondAmount, slippage]);

  let amountsWithSlippage;
  if (!isSwap) amountsWithSlippage = getFormattedAmountsWithSlippage();

  return (
    <div className={classes.root}>
      <Card className={classes.card}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            {intl.formatMessage({
              id: "tokenPairTransactionDetails.title",
            })}
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <FormattedNumberField
                label="tokenPairTransactionDetails.exchangeRate"
                value={getImpliedRate()}
                dataTestId={TestIds.RATE}
              />
            </Grid>
            {isSwap && (
              <>
                <Grid item xs={12}>
                  <TokenAmountField
                    label="tokenPairPool.fee"
                    amount={getFeeProperties()?.amount}
                    token={getFeeProperties()?.token}
                    dataTestId={TestIds.FEE}
                    inputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    className={classes.formControl}
                    disabled={true}
                    value={getFormattedAmountWithSlippageForSwap() || ""}
                    label={intl.formatMessage({
                      id: "tokenPairTransactionDetails.minimumAmount",
                    })}
                  />
                </Grid>
                <Grid item xs={2} className={classes.helpIcon}>
                  <SlippageSelector />
                </Grid>
              </>
            )}
            {!isSwap && (
              <>
                <Grid item xs={10}>
                  <TextField
                    className={classes.formControl}
                    disabled={true}
                    value={amountsWithSlippage?.tokenAAmount || ""}
                    label={intl.formatMessage(
                      {
                        id: "tokenPairTransactionDetails.minimumTokenAmount",
                      },
                      { token: firstToken?.symbol }
                    )}
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    className={classes.formControl}
                    disabled={true}
                    value={amountsWithSlippage?.tokenBAmount || ""}
                    label={intl.formatMessage(
                      {
                        id: "tokenPairTransactionDetails.minimumTokenAmount",
                      },
                      { token: secondToken?.symbol }
                    )}
                  />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    className={classes.formControl}
                    disabled={true}
                    value={amountsWithSlippage?.poolTokenAmount || ""}
                    label={intl.formatMessage({
                      id: "tokenPairTransactionDetails.minimumPoolTokenAmount",
                    })}
                  />
                </Grid>
                <Grid item xs={2} className={classes.helpIcon}>
                  <SlippageSelector />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
