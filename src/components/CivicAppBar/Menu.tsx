import { createStyles, Divider, Link, List, Theme } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import React, { FC } from "react";
import PoolsIcon from "@material-ui/icons/Layers";
import DepositIcon from "@material-ui/icons/SystemUpdateAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import WithdrawIcon from "@material-ui/icons/LocalAtm";
import { makeStyles } from "@material-ui/core/styles";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { MenuEntry } from "../../utils/types";
import WalletView from "../../features/wallet/WalletView";
import IdentitySectionView from "../../features/identity/IdentitySectionView";
import { RootState } from "../../app/rootReducer";
import { drawerWidth } from "./CivicAppBar";
import MenuEntryUI from "./MenuEntryUI";

enum TestIds {
  POOLS_MENU_ITEM = "POOLS_MENU_ITEM",
  DEPOSIT_MENU_ITEM = "DEPOSIT_MENU_ITEM",
  WITHDRAW_MENU_ITEM = "WITHDRAW_MENU_ITEM",
  SWAP_MENU_ITEM = "SWAP_MENU_ITEM",
}

const menuEntries: Array<MenuEntry & { dataTestId: TestIds }> = [
  {
    text: "menu.pools",
    route: "pools",
    icon: <PoolsIcon />,
    dataTestId: TestIds.POOLS_MENU_ITEM,
  },
  {
    text: "menu.deposit",
    route: "deposit",
    icon: <DepositIcon />,
    dataTestId: TestIds.DEPOSIT_MENU_ITEM,
  },
  {
    text: "menu.swap",
    route: "swap",
    icon: <SwapIcon />,
    dataTestId: TestIds.SWAP_MENU_ITEM,
  },
  {
    text: "menu.withdraw",
    route: "withdraw",
    icon: <WithdrawIcon />,
    dataTestId: TestIds.WITHDRAW_MENU_ITEM,
  },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  })
);

const Menu: FC = () => {
  const intl = useIntl();
  const classes = useStyles();
  const {
    wallet: { connected },
    identity: { identitiesLoaded },
  } = useSelector((state: RootState) => state);
  return (
    <>
      <div className={classes.drawerHeader} />
      <Divider />
      <WalletView />
      <Divider />
      {connected && identitiesLoaded ? (
        <>
          <IdentitySectionView />
          <Divider />
        </>
      ) : (
        <></>
      )}
      <List>
        {menuEntries.map(({ text, route, icon, dataTestId }) => (
          <Link
            className="menuButtonLink"
            key={text}
            component={RouterLink}
            to={route as string}
          >
            <MenuEntryUI
              icon={icon}
              text={intl.formatMessage({ id: text })}
              dataTestId={dataTestId}
            />
          </Link>
        ))}
      </List>
    </>
  );
};

export default Menu;
