import React, { FC, useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { List } from "@material-ui/core";
import { RootState } from "../../app/rootReducer";
import { connect, disconnect, selectCluster, selectType } from "./WalletSlice";
import { NoWalletConnected } from "./NoWalletConnected";
import { WalletIsConnected } from "./WalletIsConnected";
import { ClusterSelector } from "./ClusterSelector";

const WalletView: FC = () => {
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
    (cluster) => {
      dispatch(disconnect());
      dispatch(selectCluster(cluster));
    },
    [dispatch]
  );
  const selectWalletType = useCallback(
    (walletType) => dispatch(selectType(walletType)),
    [dispatch]
  );

  return (
    <>
      {walletState.connected ? (
        <WalletIsConnected
          disconnectWallet={disconnectWallet}
          publicKey={walletState.publicKey}
        />
      ) : (
        <NoWalletConnected
          connectWallet={connectWallet}
          selectWalletType={selectWalletType}
          walletType={walletState.type}
        />
      )}
      <List>
        <ClusterSelector
          select={selectWalletCluster}
          current={walletState.cluster}
        />
      </List>
    </>
  );
};

export default WalletView;
