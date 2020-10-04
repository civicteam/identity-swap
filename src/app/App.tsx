import React from "react";

import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import {
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
import CivicAppBar from "../components/CivicAppBar/CivicAppBar";
import Intl from "./Intl";

import { lightTheme, darkTheme } from "./theme";

function App(): JSX.Element {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () => createMuiTheme(prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Intl>
        <SnackbarProvider maxSnack={3}>
          <div className="App" data-testid="app">
            <CivicAppBar />
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
