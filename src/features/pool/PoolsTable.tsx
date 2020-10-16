import React, { FC, useCallback } from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { Decimal } from "decimal.js";

import { add, prop } from "ramda";
import { Token } from "../../api/token/Token";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import TokenAmountText from "../../components/TokenPair/TokenAmountText";
import { minorAmountToMajor, toDecimal } from "../../utils/amount";
import { Actions } from "./PoolActions";
import { SimpleRateChangeIndicator } from "./SimpleRateChangeIndicator";

enum TestIds {
  LIQUIDITY_A = "LIQUIDITY_A",
  LIQUIDITY_B = "LIQUIDITY_B",
  USER_BALANCE = "USER_BALANCE",
  USER_SHARE = "USER_SHARE",
  POOLS = "POOLS",
  POOL = "POOL",
  FEE = "FEE",
  RATE = "RATE",
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    padding: theme.spacing(2),
  },
  tableContainer: {},
  table: {
    minWidth: 650,
  },
  changeIndicator: {
    width: 20,
    padding: "0px",
    display: "inline-block",
    "text-align": "left",
  },
}));

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
    },
    head: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

export type Row = {
  pool: Pool;
  symbol: string;
  liquidityA: Decimal;
  liquidityB: Decimal;
  userPoolTokenBalance: Decimal;
  userTokenABalance: Decimal;
  userTokenBBalance: Decimal;
  simpleRate: Decimal;
  previousSimpleRate?: Decimal;
  rateAge: number;
  userShare: number;
};
const poolToRow = (tokenAccounts: Array<TokenAccount>) => (pool: Pool): Row => {
  const accountsForToken = (token: Token) =>
    tokenAccounts.filter((tokenAccount) => tokenAccount.mint.equals(token));
  const sumBalance = (tokenAccounts: Array<TokenAccount>) =>
    tokenAccounts
      .map(prop("balance"))
      .map(toDecimal)
      .reduce((d1, d2) => d1.add(d2), new Decimal(0));

  const poolTokenAccounts = accountsForToken(pool.poolToken);
  const tokenAAccounts = accountsForToken(pool.tokenA.mint);
  const tokenBAccounts = accountsForToken(pool.tokenB.mint);

  const userPoolTokenBalance = sumBalance(poolTokenAccounts);
  const userTokenABalance = sumBalance(tokenAAccounts);
  const userTokenBBalance = sumBalance(tokenBAccounts);
  const simpleRate = pool.simpleRate();
  const previousSimpleRate = pool.getPrevious()?.simpleRate();
  const rateAge =
    pool.lastUpdatedSlot -
    (pool.getPrevious()?.lastUpdatedSlot || pool.lastUpdatedSlot);
  const userShare = poolTokenAccounts
    .map((account) => account.proportionOfTotalSupply())
    .reduce(add, 0);

  return {
    pool,
    symbol: pool.tokenA.mint.symbol + "/" + pool.tokenB.mint.symbol,
    liquidityA: toDecimal(pool.tokenA.balance),
    liquidityB: toDecimal(pool.tokenB.balance),
    simpleRate,
    previousSimpleRate,
    rateAge,
    userPoolTokenBalance,
    userTokenABalance,
    userTokenBBalance,
    userShare,
  };
};

type Props = {
  pools: Array<Pool>;
  tokenAccounts: Array<TokenAccount>;
};
export const PoolsTable: FC<Props> = ({ pools, tokenAccounts }: Props) => {
  const classes = useStyles();

  const getRows = useCallback(() => pools.map(poolToRow(tokenAccounts)), [
    pools,
    tokenAccounts,
  ]);

  const rows = getRows();

  return (
    <div className={classes.root}>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          className={classes.table}
          aria-label="Pool table"
          data-testid={TestIds.POOLS}
        >
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <FormattedMessage id="pools.symbol" />
              </StyledTableCell>
              <StyledTableCell align="right">
                <FormattedMessage id="pools.liquidityA" />
              </StyledTableCell>
              <StyledTableCell align="right">
                <FormattedMessage id="pools.liquidityB" />
              </StyledTableCell>
              <StyledTableCell align="right">
                <FormattedMessage id="pools.fees" />
              </StyledTableCell>
              <StyledTableCell align="right">
                <FormattedMessage id="pools.simpleRate" />
              </StyledTableCell>
              <StyledTableCell align="right">
                <FormattedMessage id="pools.userBalance" />
              </StyledTableCell>
              <StyledTableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow
                key={row.pool.address.toBase58()}
                data-testid={TestIds.POOL}
              >
                <StyledTableCell component="th" scope="row">
                  {row.symbol}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <span
                    data-testid={TestIds.LIQUIDITY_A}
                    data-value={row.liquidityA}
                  >
                    <TokenAmountText
                      amount={row.liquidityA}
                      token={row.pool.tokenA.mint}
                    />
                  </span>
                  {" " + row.pool.tokenA.mint.symbol}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <span
                    data-testid={TestIds.LIQUIDITY_B}
                    data-value={row.liquidityB}
                  >
                    <TokenAmountText
                      amount={row.liquidityB}
                      token={row.pool.tokenB.mint}
                    />
                  </span>
                  {" " + row.pool.tokenB.mint.symbol}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <FormattedNumber
                    // Workaround for https://github.com/formatjs/formatjs/issues/785#issuecomment-269006163
                    style={`percent`}
                    value={row.pool.feeRatio}
                    data-testid={TestIds.FEE}
                    maximumFractionDigits={2}
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <div className={classes.changeIndicator}>
                    <SimpleRateChangeIndicator pool={row.pool} />
                  </div>
                  <FormattedNumber
                    value={row.simpleRate.toNumber()}
                    data-testid={TestIds.RATE}
                    maximumFractionDigits={6}
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <span
                    data-testid={TestIds.USER_BALANCE}
                    data-value={minorAmountToMajor(
                      row.userPoolTokenBalance,
                      row.pool.poolToken
                    )}
                  >
                    <TokenAmountText
                      amount={row.userPoolTokenBalance}
                      token={row.pool.poolToken}
                    />
                  </span>{" "}
                  (
                  <span
                    data-testid={TestIds.USER_SHARE}
                    data-value={row.userShare}
                  >
                    <FormattedNumber
                      // Workaround for https://github.com/formatjs/formatjs/issues/785#issuecomment-269006163
                      style={`percent`}
                      maximumFractionDigits={2}
                      value={row.userShare}
                    />
                  </span>
                  )
                </StyledTableCell>
                <StyledTableCell>
                  <Actions {...row} />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
