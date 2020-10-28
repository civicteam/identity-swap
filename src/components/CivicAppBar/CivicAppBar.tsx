import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import React, { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";
import LoadingIndicator from "../LoadingIndicator";
import WalletConnectedIndicator from "../../features/wallet/WalletConnectedIndicator";
import MenuDrawer from "./MenuDrawer";

import civicLogo from "./Civic-logo-monogram-white-100px.png";

export const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
  },
  media: {
    width: "40px",
    "margin-left": "10px",
    "margin-right": "10px",
  },
}));

const CivicAppBar: FC = () => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            onClick={handleDrawerOpen}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <img className={classes.media} src={civicLogo} alt="Civic" />
          <Typography variant="h4" className={classes.title}>
            <FormattedMessage id="app.title" />
          </Typography>
        </Toolbar>
        <LoadingIndicator />
        <WalletConnectedIndicator />
      </AppBar>
      <MenuDrawer open={drawerOpen} handleDrawerClose={handleDrawerClose} />
    </>
  );
};

export default CivicAppBar;
