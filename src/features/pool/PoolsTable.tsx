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

import { add, prop } from "ramda";
import { Token } from "../../api/token/Token";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import TokenAmountText from "../../components/TokenPair/TokenAmountText";
import { minorAmountToMajor } from "../../utils/amount";
import { Actions } from "./PoolActions";

enum TestIds {
  LIQUIDITY_A = "LIQUIDITY_A",
  LIQUIDITY_B = "LIQUIDITY_B",
  USER_BALANCE = "USER_BALANCE",
  USER_SHARE = "USER_SHARE",
  POOLS = "POOLS",
  POOL = "POOL",
  FEE = "FEE",
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    padding: theme.spacing(2),
  },
  tableContainer: {
    width: theme.spacing(120),
  },
  table: {
    minWidth: 650,
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
  liquidityA: number;
  liquidityB: number;
  userPoolTokenBalance: number;
  userTokenABalance: number;
  userTokenBBalance: number;
  userShare: number;
};
const poolToRow = (tokenAccounts: Array<TokenAccount>) => (pool: Pool): Row => {
  const accountsForToken = (token: Token) =>
    tokenAccounts.filter((tokenAccount) => tokenAccount.mint.equals(token));
  const sumBalance = (tokenAccounts: Array<TokenAccount>) =>
    tokenAccounts.map(prop("balance")).reduce(add, 0);

  const poolTokenAccounts = accountsForToken(pool.poolToken);
  const tokenAAccounts = accountsForToken(pool.tokenA.mint);
  const tokenBAccounts = accountsForToken(pool.tokenB.mint);

  const userPoolTokenBalance = sumBalance(poolTokenAccounts);
  const userTokenABalance = sumBalance(tokenAAccounts);
  const userTokenBBalance = sumBalance(tokenBAccounts);
  const userShare = poolTokenAccounts
    .map((account) => account.proportionOfTotalSupply())
    .reduce(add, 0);

  return {
    pool,
    symbol: pool.tokenA.mint.symbol + "/" + pool.tokenB.mint.symbol,
    liquidityA: pool.tokenA.balance,
    liquidityB: pool.tokenB.balance,
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
