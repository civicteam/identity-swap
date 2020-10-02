import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ToggleOn from "@material-ui/icons/ToggleOn";
import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { abbreviateAddress } from "../../utils/string";

enum TestIds {
  WALLET_ACTIVE = "WALLET_ACTIVE",
}

type Props = {
  disconnectWallet: () => void;
  publicKey: string | null;
};
export const WalletIsConnected: FC<Props> = ({
  disconnectWallet,
  publicKey,
}: Props) => (
  <div>
    <Typography variant="caption" data-testid={TestIds.WALLET_ACTIVE}>
      <FormattedMessage
        id={"wallet.selected"}
        values={{ address: publicKey && abbreviateAddress(publicKey) }}
      />
    </Typography>

    <IconButton color="inherit" onClick={disconnectWallet}>
      <ToggleOn />
    </IconButton>
  </div>
);
