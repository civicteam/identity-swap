import React, { FC, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { RootState } from "../../app/rootReducer";
import { connect, disconnect, selectCluster } from "./WalletSlice";
import { NoWalletConnected } from "./NoWalletConnected";
import { WalletIsConnected } from "./WalletIsConnected";

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
  const selectWalletCluster = useCallback(
    (cluster) => dispatch(selectCluster(cluster)),
    [dispatch]
  );

  return walletState.connected ? (
    <WalletIsConnected
      disconnectWallet={disconnectWallet}
      publicKey={walletState.publicKey}
    />
  ) : (
    <NoWalletConnected
      connectWallet={connectWallet}
      selectCluster={selectWalletCluster}
      loading={walletState.loading}
      cluster={walletState.cluster}
    />
  );
};

export default WalletSelector;
