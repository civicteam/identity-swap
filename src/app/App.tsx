import React from "react";

import { Route, Redirect } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import {
  makeStyles,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import "./App.css";

import Notifier from "../features/notification/Notification";

import { SwapView } from "../features/swap/SwapView";
import { WithdrawView } from "../features/withdraw/WithdrawView";
import { DepositView } from "../features/deposit/DepositView";
import CivicAppBar, {
  drawerWidth,
} from "../components/CivicAppBar/CivicAppBar";
import { PoolsView } from "../features/pool/PoolsView";
import Intl from "./Intl";

import { lightTheme, darkTheme } from "./theme";

const useStyles = makeStyles((theme) => ({
  content: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
}));

function App(): JSX.Element {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () => createMuiTheme(prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Intl>
        <SnackbarProvider maxSnack={3}>
          <div className="App" data-testid="app">
            <CivicAppBar />
            <div className={classes.content}>
              <Route exact path="/">
                <Redirect to="/pools" />
              </Route>
              <Route path="/pools" component={PoolsView} />
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
