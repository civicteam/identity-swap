import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { SnackbarProvider } from "notistack";

import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme as createMuiTheme,
} from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import { v4 as uuid } from "uuid";

import "./App.css";
import { RootState } from "./rootReducer";
import { PoolsList } from "../features/pool/PoolsList";
import { addPool } from "../features/pool/PoolSlice";

import { addNotification } from "../features/notification/NotificationSlice";
import Notifier from "../features/notification/Notification";

import WalletSelector from "../features/wallet/WalletSelector";

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
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Civic AMM
              </Typography>
              <WalletSelector />
            </Toolbar>
          </AppBar>
          <div>
            <h1>Pools</h1>
            <PoolsList pools={pools} />
            <button
              onClick={() => {
                dispatch(
                  addPool({ address: uuid(), tokenA: "a", tokenB: "b" })
                );
                dispatch(addNotification({ message: "Pool added" }));
              }}
            >
              Add
            </button>
          </div>
        </div>
        <Notifier />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
