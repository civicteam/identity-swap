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
import PoolIcon from "@material-ui/icons/SystemUpdateAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import { LocalAtm } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useIntl } from "react-intl";
import { drawerWidth } from "./CivicAppBar";

type MenuEntry = {
  text: string;
  route: string;
  icon: JSX.Element;
};

const menuEntries: MenuEntry[] = [
  { text: "menu.deposit", route: "deposit", icon: <PoolIcon /> },
  { text: "menu.swap", route: "swap", icon: <SwapIcon /> },
  { text: "menu.withdraw", route: "withdraw", icon: <LocalAtm /> },
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
};
const MenuEntryUI: FC<MenuEntryUIProps> = ({
  text,
  icon,
}: MenuEntryUIProps) => (
  <ListItem button key={text}>
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
        {menuEntries.map(({ text, route, icon }) => (
          <Link
            className="menuButtonLink"
            key={text}
            component={RouterLink}
            to={route}
          >
            <MenuEntryUI icon={icon} text={intl.formatMessage({ id: text })} />
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
            />
          )
        )}
      </List>
    </>
  );
};

export default Menu;
