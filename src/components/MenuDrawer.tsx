import React, { FC } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  createStyles,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
  useTheme,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import PoolIcon from "@material-ui/icons/SystemUpdateAlt";
import QuestionIcon from "@material-ui/icons/Help";
import { makeStyles } from "@material-ui/core/styles";

type MenuEntry = {
  text: string;
  route: string;
  icon: JSX.Element;
};

const menuEntries: MenuEntry[] = [
  { text: "Pools", route: "pools", icon: <PoolIcon /> },
  { text: "Swap", route: "swap", icon: <SwapIcon /> },
];

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    menuButtonLink: {
      textDecoration: "none",
      color: "inherit",
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
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

type Props = {
  open: boolean;
  handleDrawerClose: () => void;
};
const MenuDrawer: FC<Props> = ({ open, handleDrawerClose }: Props) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Drawer
      className={classes.drawer}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </div>
      <Divider />
      <List>
        {menuEntries.map(({ text, route, icon }) => (
          <Link
            className="menuButtonLink"
            key={text}
            component={RouterLink}
            to={route}
          >
            <MenuEntryUI icon={icon} text={text} />
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        {["Creating a Wallet", "About Us", "For Developers"].map((text) => (
          <MenuEntryUI key={text} icon={<QuestionIcon />} text={text} />
        ))}
      </List>
    </Drawer>
  );
};

export default MenuDrawer;
