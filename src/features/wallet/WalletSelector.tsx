import React, { FC } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { connect, disconnect } from "./WalletSlice";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";
import { abbreviateAddress } from "../../utils/string";

const WalletSelector: FC = () => {
  const walletState = useSelector(
    (state: RootState) => state.wallet,
    shallowEqual
  );

  const dispatch = useDispatch();

  return walletState.connected ? (
    <div>
      <Typography variant="button">
        Using wallet{" "}
        {walletState.publicKey && abbreviateAddress(walletState.publicKey)}
      </Typography>
      <Button color="inherit" onClick={() => dispatch(disconnect())}>
        Disconnect
      </Button>
    </div>
  ) : (
    <div>
      <Button color="inherit" onClick={() => dispatch(connect())}>
        Connect wallet
      </Button>
    </div>
  );
};

export default WalletSelector;
