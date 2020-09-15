import React from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { SnackbarProvider } from "notistack";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import { CssBaseline } from "@material-ui/core";
import { v4 as uuid } from "uuid";

import { RootState } from "./rootReducer";
import { PoolsList } from "../features/pool/PoolsList";
import { addPool } from "../features/pool/PoolSlice";
import { addNotification } from "../features/notification/NotificationSlice";
import Notifier from "../features/notification/Notification";

function App(): JSX.Element {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: green,
        },
      }),
    [prefersDarkMode]
  );

  const dispatch = useDispatch();
  const { pools } = useSelector((state: RootState) => state.pool);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <div className="App">
          <header className="App-header">Coming Soon...</header>
          <button
            onClick={() => {
              dispatch(addPool({ address: uuid(), tokenA: "a", tokenB: "b" }));
              dispatch(addNotification({ message: "Pool added" }));
            }}
          >
            Add
          </button>
          <div>
            <h1>Pools</h1>
            <PoolsList pools={pools} />
          </div>
        </div>
        <Notifier />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
