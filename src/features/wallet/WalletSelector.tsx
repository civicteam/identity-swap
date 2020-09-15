import React, { FC, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { connect, disconnect } from "./WalletSlice";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";
import { abbreviateAddress } from "../../utils/string";

type NoWalletConnectedProps = {
  connectWallet: () => void;
};
const NoWalletConnected = ({ connectWallet }: NoWalletConnectedProps) => (
  <div>
    <Button color="inherit" onClick={connectWallet}>
      Connect wallet
    </Button>
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
    <Typography variant="button">
      Using wallet {publicKey && abbreviateAddress(publicKey)}
    </Typography>
    <Button color="inherit" onClick={disconnectWallet}>
      Disconnect
    </Button>
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
    <NoWalletConnected connectWallet={connectWallet} />
  );
};

export default WalletSelector;
