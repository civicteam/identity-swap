import { Link } from "@material-ui/core";
import React, { FC } from "react";
import { useIntl } from "react-intl";
import WalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { makeStyles } from "@material-ui/core/styles";
import { abbreviateAddress } from "../../utils/string";
import MenuEntryUI from "../../components/CivicAppBar/MenuEntryUI";

enum TestIds {
  WALLET_ACTIVE = "WALLET_ACTIVE",
}

const useStyles = makeStyles((theme) => ({
  menuButtonLink: {
    color: theme.palette.primary.main,
  },
}));

type Props = {
  disconnectWallet: () => void;
  publicKey: string | null;
};
export const WalletIsConnected: FC<Props> = ({
  disconnectWallet,
  publicKey,
}: Props) => {
  const intl = useIntl();
  const classes = useStyles();
  return (
    <Link key="wallet.selected" onClick={disconnectWallet}>
      <MenuEntryUI
        icon={<WalletIcon className={classes.menuButtonLink} />}
        text={intl.formatMessage(
          { id: "wallet.selected" },
          { address: publicKey && abbreviateAddress(publicKey, 6) }
        )}
        dataTestId={TestIds.WALLET_ACTIVE}
      />
    </Link>
  );
};
