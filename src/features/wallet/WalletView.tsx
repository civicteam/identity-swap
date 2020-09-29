import React, { FC, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { RootState } from "../../app/rootReducer";
import { connect, disconnect, selectCluster, selectType } from "./WalletSlice";
import { NoWalletConnected } from "./NoWalletConnected";
import { WalletIsConnected } from "./WalletIsConnected";

const WalletView: FC = () => {
  const walletState = useSelector(
    (state: RootState) => state.wallet,
    shallowEqual
  );

  const { loading } = useSelector((state: RootState) => state.global);

  const dispatch = useDispatch();
  const connectWallet = useCallback(() => dispatch(connect()), [dispatch]);
  const disconnectWallet = useCallback(() => dispatch(disconnect()), [
    dispatch,
  ]);
  const selectWalletCluster = useCallback(
    (cluster) => dispatch(selectCluster(cluster)),
    [dispatch]
  );
  const selectWalletType = useCallback(
    (walletType) => dispatch(selectType(walletType)),
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
      loading={loading}
      cluster={walletState.cluster}
      selectWalletType={selectWalletType}
      walletType={walletState.type}
    />
  );
};

export default WalletView;
