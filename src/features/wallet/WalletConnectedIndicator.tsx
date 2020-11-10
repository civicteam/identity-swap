import { Collapse, Link, Typography } from "@material-ui/core";
import React, { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { RootState } from "../../app/rootReducer";
import { connect } from "./WalletSlice";

export const useStyles = makeStyles((theme) => ({
  walletConnectBanner: {
    color: theme.palette.primary.contrastText,
  },
}));

const WalletConnectedIndicator: FC = () => {
  const classes = useStyles();
  const connected = useSelector((state: RootState) => !!state.wallet.connected);
  const dispatch = useDispatch();
  const connectWallet = useCallback(() => dispatch(connect()), [dispatch]);

  return (
    <Collapse in={!connected}>
      <Link
        key="wallet.connect"
        onClick={connectWallet}
        className={classes.walletConnectBanner}
      >
        <Typography variant={"button"}>Connect Wallet</Typography>
      </Link>
    </Collapse>
  );
};

export default WalletConnectedIndicator;
