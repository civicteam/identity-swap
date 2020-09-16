import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ToggleOn from "@material-ui/icons/ToggleOn";
import React, { FC } from "react";
import { abbreviateAddress } from "../../utils/string";

type Props = {
  disconnectWallet: () => void;
  publicKey: string | null;
};
export const WalletIsConnected: FC<Props> = ({
  disconnectWallet,
  publicKey,
}: Props) => (
  <div>
    <Typography variant="caption">
      Using wallet {publicKey && abbreviateAddress(publicKey)}
    </Typography>

    <IconButton color="inherit" onClick={disconnectWallet}>
      <ToggleOn />
    </IconButton>
  </div>
);
