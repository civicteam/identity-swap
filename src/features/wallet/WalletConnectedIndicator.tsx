import { Collapse, Typography } from "@material-ui/core";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";

const WalletConnectedIndicator: FC = () => {
  const connected = useSelector((state: RootState) => !!state.wallet.connected);

  return (
    <Collapse in={!connected}>
      <Typography variant={"button"}>Connect Wallet</Typography>
    </Collapse>
  );
};

export default WalletConnectedIndicator;
