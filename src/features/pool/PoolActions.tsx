import React, { FC } from "react";
import { useIntl } from "react-intl";
import { Button, IconButton, Link } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import Hidden from "@material-ui/core/Hidden";
import DepositIcon from "@material-ui/icons/SystemUpdateAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import WithdrawIcon from "@material-ui/icons/LocalAtm";
import { makeStyles } from "@material-ui/core/styles";
import { MenuEntry } from "../../utils/types";
import { Pool } from "../../api/pool/Pool";
import { Row } from "./PoolsTable";

enum TestIds {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  SWAP = "SWAP",
}

const useStyles = makeStyles((theme) => ({
  buttonLink: {
    display: "inline-block",
    padding: theme.spacing(1),
  },
  actionButton: {
    width: "150px",
  },
  actionIconButton: {},
}));

type PoolMenuEntry = MenuEntry & {
  disabled: boolean;
  dataTestId: TestIds;
  pool: Pool;
};
const ButtonUI: FC<PoolMenuEntry> = ({
  text,
  route,
  icon,
  disabled,
  pool,
  dataTestId,
}: PoolMenuEntry) => {
  const intl = useIntl();
  const classes = useStyles();
  const intlText = intl.formatMessage({ id: text });
  return (
    <Link
      className={classes.buttonLink}
      key={intlText}
      component={RouterLink}
      to={{
        pathname: route,
        state: { poolAddress: pool.address.toBase58() },
      }}
    >
      <Hidden mdUp implementation="css">
        {/*Show on small devices*/}
        <IconButton
          disabled={disabled}
          color="primary"
          className={classes.actionIconButton}
          data-testId={dataTestId}
        >
          {icon}
        </IconButton>
      </Hidden>
      {/*Show on large devices*/}
      <Hidden smDown implementation="css">
        <Button
          disabled={disabled}
          variant="contained"
          color="primary"
          className={classes.actionButton}
          endIcon={icon}
          data-testId={dataTestId}
        >
          {intlText}
        </Button>
      </Hidden>
    </Link>
  );
};
export const Actions: FC<Row> = (row: Row) => {
  // can swap if we have both A and B
  const depositEnabled = row.userTokenABalance > 0 && row.userTokenBBalance > 0;
  // can swap if we have either A or B
  const swapEnabled = row.userTokenABalance > 0 || row.userTokenBBalance > 0;
  // can withdraw if we have pool tokens
  const withdrawEnabled = row.userPoolTokenBalance > 0;

  const menuEntries: Record<string, PoolMenuEntry> = {
    deposit: {
      text: "menu.deposit",
      route: "deposit",
      disabled: !depositEnabled,
      pool: row.pool,
      dataTestId: TestIds.DEPOSIT,
      icon: <DepositIcon />,
    },
    swap: {
      text: "menu.swap",
      route: "swap",
      disabled: !swapEnabled,
      pool: row.pool,
      dataTestId: TestIds.SWAP,
      icon: <SwapIcon />,
    },
    withdraw: {
      text: "menu.withdraw",
      route: "withdraw",
      disabled: !withdrawEnabled,
      pool: row.pool,
      dataTestId: TestIds.WITHDRAW,
      icon: <WithdrawIcon />,
    },
  };

  return (
    <>
      <ButtonUI {...menuEntries.swap} />
      <ButtonUI {...menuEntries.deposit} />
      <ButtonUI {...menuEntries.withdraw} />
    </>
  );
};
