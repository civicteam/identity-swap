import React, { FC, useCallback } from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";
import { FormattedMessage } from "react-intl";
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
import { Actions } from "./PoolActions";

enum TestIds {
  LIQUIDITY_A = "LIQUIDITY_A",
  LIQUIDITY_B = "LIQUIDITY_B",
  USER_BALANCE = "USER_BALANCE",
  USER_SHARE = "USER_SHARE",
  POOLS = "POOLS",
  POOL = "POOL",
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
  userSupply: number;
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
  const userSupply = poolTokenAccounts
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
    userSupply,
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
          data-testId={TestIds.POOLS}
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
                <FormattedMessage id="pools.userBalance" />
              </StyledTableCell>
              <StyledTableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow
                key={row.pool.address.toBase58()}
                data-testId={TestIds.POOL}
              >
                <StyledTableCell component="th" scope="row">
                  {row.symbol}
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TokenAmountText
                    amount={row.liquidityA}
                    token={row.pool.tokenA.mint}
                    dataTestId={TestIds.LIQUIDITY_A}
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TokenAmountText
                    amount={row.liquidityB}
                    token={row.pool.tokenB.mint}
                    dataTestId={TestIds.LIQUIDITY_B}
                  />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TokenAmountText
                    amount={row.userPoolTokenBalance}
                    token={row.pool.poolToken}
                    dataTestId={TestIds.USER_BALANCE}
                  />{" "}
                  <span data-testid={TestIds.USER_SHARE}>
                    ({(row.userSupply * 100).toFixed(2)}%)
                  </span>
                </StyledTableCell>
                <TableCell>
                  <Actions {...row} />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
