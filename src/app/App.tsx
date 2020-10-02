import React from "react";

import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import { FormattedMessage } from "react-intl";
import {
  makeStyles,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import green from "@material-ui/core/colors/green";
import grey from "@material-ui/core/colors/grey";

import "./App.css";

import Notifier from "../features/notification/Notification";
import WalletView from "../features/wallet/WalletView";

import MenuDrawer from "../components/MenuDrawer";
import { SwapView } from "../features/swap/SwapView";
import { WithdrawView } from "../features/withdraw/WithdrawView";
import { DepositView } from "../features/deposit/DepositView";
import Intl from "./Intl";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function App(): JSX.Element {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: green,
          secondary: grey,
        },
      }),
    [prefersDarkMode]
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Intl>
        <SnackbarProvider maxSnack={3}>
          <div className="App" data-testid="app">
            <AppBar position="static">
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
                <Typography variant="h6" className={classes.title}>
                  <FormattedMessage id="app.title" />
                </Typography>
                <WalletView />
              </Toolbar>
            </AppBar>
            <MenuDrawer
              open={drawerOpen}
              handleDrawerClose={handleDrawerClose}
            />
            <div>
              <Route path="/swap" component={SwapView} />
              <Route path="/deposit" component={DepositView} />
              <Route path="/withdraw" component={WithdrawView} />
            </div>
          </div>
          <Notifier />
        </SnackbarProvider>
      </Intl>
    </ThemeProvider>
  );
}

export default App;
