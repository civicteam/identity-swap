import React from "react";

import { Route, Redirect } from "react-router-dom";

import {
  makeStyles,
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import "react-toastify/dist/ReactToastify.min.css";
import "./App.css";

import { SwapView } from "../features/swap/SwapView";
import { WithdrawView } from "../features/withdraw/WithdrawView";
import { DepositView } from "../features/deposit/DepositView";
import { PoolsView } from "../features/pool/PoolsView";
import { IdentityView } from "../features/identity/IdentityView";

import CivicAppBar, {
  drawerWidth,
} from "../components/CivicAppBar/CivicAppBar";

import { Notifier } from "../components/notify";

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
            <Route path="/identity" component={IdentityView} />
          </div>
        </div>
        <Notifier />
      </Intl>
    </ThemeProvider>
  );
}

export default App;
