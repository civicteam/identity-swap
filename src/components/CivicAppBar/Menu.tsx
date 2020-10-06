import {
  createStyles,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import QuestionIcon from "@material-ui/icons/Help";
import React, { FC } from "react";
import PoolsIcon from "@material-ui/icons/Layers";
import DepositIcon from "@material-ui/icons/SystemUpdateAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import WithdrawIcon from "@material-ui/icons/LocalAtm";
import { makeStyles } from "@material-ui/core/styles";
import { useIntl } from "react-intl";
import { MenuEntry } from "../../utils/types";
import { drawerWidth } from "./CivicAppBar";

enum TestIds {
  POOLS_MENU_ITEM = "POOLS_MENU_ITEM",
  DEPOSIT_MENU_ITEM = "DEPOSIT_MENU_ITEM",
  WITHDRAW_MENU_ITEM = "WITHDRAW_MENU_ITEM",
  SWAP_MENU_ITEM = "SWAP_MENU_ITEM",
  OTHER_MENU_ITEM = "OTHER_MENU_ITEM",
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

type MenuEntryUIProps = {
  icon: JSX.Element;
  text: string;
  dataTestId: TestIds;
};
const MenuEntryUI: FC<MenuEntryUIProps> = ({
  text,
  icon,
  dataTestId,
}: MenuEntryUIProps) => (
  <ListItem button key={text} data-testId={dataTestId}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={text} />
  </ListItem>
);

const Menu: FC = () => {
  const intl = useIntl();
  const classes = useStyles();
  return (
    <>
      <div className={classes.drawerHeader} />
      <Divider />
      <List>
        {menuEntries.map(({ text, route, icon, dataTestId }) => (
          <Link
            className="menuButtonLink"
            key={text}
            component={RouterLink}
            to={route}
          >
            <MenuEntryUI
              icon={icon}
              text={intl.formatMessage({ id: text })}
              dataTestId={dataTestId}
            />
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        {["menu.creatingAWallet", "menu.aboutUs", "menu.forDevelopers"].map(
          (text) => (
            <MenuEntryUI
              key={text}
              icon={<QuestionIcon />}
              text={intl.formatMessage({ id: text })}
              dataTestId={TestIds.OTHER_MENU_ITEM}
            />
          )
        )}
      </List>
    </>
  );
};

export default Menu;
