import React, { FC, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import IconButton from "@material-ui/core/IconButton";
import ToggleOn from "@material-ui/icons/ToggleOn";
import ToggleOff from "@material-ui/icons/ToggleOff";
import { Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import { RootState } from "../../app/rootReducer";
import { abbreviateAddress } from "../../utils/string";
import { connect, disconnect } from "./WalletSlice";

type NoWalletConnectedProps = {
  connectWallet: () => void;
  loading: boolean;
};
const NoWalletConnected = ({
  connectWallet,
  loading,
}: NoWalletConnectedProps) => (
  <div>
    <IconButton color="inherit" onClick={connectWallet}>
      <Typography variant={"caption"}>Connect wallet</Typography>
      <ToggleOff />
      {loading && <CircularProgress color="secondary" />}
    </IconButton>
  </div>
);

type WalletIsConnectedProps = {
  disconnectWallet: () => void;
  publicKey: string | null;
};
const WalletIsConnected = ({
  disconnectWallet,
  publicKey,
}: WalletIsConnectedProps) => (
  <div>
    <Typography variant="caption">
      Using wallet {publicKey && abbreviateAddress(publicKey)}
    </Typography>

    <IconButton color="inherit" onClick={disconnectWallet}>
      <ToggleOn />
    </IconButton>
  </div>
);

const WalletSelector: FC = () => {
  const walletState = useSelector(
    (state: RootState) => state.wallet,
    shallowEqual
  );

  const dispatch = useDispatch();
  const connectWallet = useCallback(() => dispatch(connect()), [dispatch]);
  const disconnectWallet = useCallback(() => dispatch(disconnect()), [
    dispatch,
  ]);

  return walletState.connected ? (
    <WalletIsConnected
      disconnectWallet={disconnectWallet}
      publicKey={walletState.publicKey}
    />
  ) : (
    <NoWalletConnected
      connectWallet={connectWallet}
      loading={walletState.loading}
    />
  );
};

export default WalletSelector;
