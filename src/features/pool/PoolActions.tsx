import React, { FC } from "react";
import { useIntl } from "react-intl";
import { Button, IconButton, Link } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import Hidden from "@material-ui/core/Hidden";
import DepositIcon from "@material-ui/icons/SystemUpdateAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import WithdrawIcon from "@material-ui/icons/LocalAtm";
import AirdropIcon from "@material-ui/icons/Flight";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { MenuEntry } from "../../utils/types";
import { Pool } from "../../api/pool/Pool";
import { airdropKey } from "../../utils/env";
import { RootState } from "../../app/rootReducer";
import { Row } from "./PoolsTable";
import { airdrop } from "./PoolSlice";

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
    minWidth: "120px",
  },
  actionIconButton: {
    padding: "4px",
  },
  actionIconWrapper: {
    display: "inline-block",
  },
}));

type PoolMenuEntry = MenuEntry & {
  disabled: boolean;
  dataTestId: TestIds;
  pool: Pool;
};
const ButtonUI: FC<PoolMenuEntry> = ({
  text,
  route,
  action,
  icon,
  disabled,
  pool,
  dataTestId,
}: PoolMenuEntry) => {
  const intl = useIntl();
  const classes = useStyles();
  const intlText = intl.formatMessage({ id: text });

  const button = (
    <div className={classes.actionIconWrapper}>
      <Hidden lgUp implementation="css">
        {/*Show on small devices*/}
        <IconButton
          disabled={disabled}
          color="primary"
          className={classes.actionIconButton}
          data-testid={dataTestId}
          onClick={action}
        >
          {icon}
        </IconButton>
      </Hidden>
      {/*Show on large devices*/}
      <Hidden mdDown implementation="css">
        <Button
          disabled={disabled}
          variant="contained"
          color="primary"
          onClick={action}
          className={classes.actionButton}
          endIcon={icon}
          data-testid={dataTestId}
        >
          {intlText}
        </Button>
      </Hidden>
    </div>
  );

  return route ? (
    <Link
      className={classes.buttonLink}
      key={intlText}
      component={RouterLink}
      to={{
        pathname: route,
        state: { poolAddress: pool.address.toBase58() },
      }}
    >
      {button}
    </Link>
  ) : (
    button
  );
};
export const Actions: FC<Row> = (row: Row) => {
  const dispatch = useDispatch();
  const cluster = useSelector((state: RootState) => state.wallet.cluster);

  // can swap if we have both A and B
  const depositEnabled =
    row.userTokenABalance.gt(0) && row.userTokenBBalance.gt(0);
  // can swap if we have either A or B
  const swapEnabled =
    row.userTokenABalance.gt(0) || row.userTokenBBalance.gt(0);
  // can withdraw if we have pool tokens
  const withdrawEnabled = row.userPoolTokenBalance.gt(0);

  const airdropEnabled = !!airdropKey(cluster);
  const airdropAction = () => dispatch(airdrop(row.pool));

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
    airdrop: {
      text: "menu.airdrop",
      disabled: !airdropEnabled,
      action: airdropAction,
      pool: row.pool,
      dataTestId: TestIds.WITHDRAW,
      icon: <AirdropIcon />,
    },
  };

  return (
    <>
      <ButtonUI {...menuEntries.swap} />
      <ButtonUI {...menuEntries.deposit} />
      <ButtonUI {...menuEntries.withdraw} />
      <ButtonUI {...menuEntries.airdrop} />
    </>
  );
};
