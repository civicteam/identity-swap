import { List, Link } from "@material-ui/core";
import React, { FC } from "react";
import { useIntl } from "react-intl";
import WalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { WalletType } from "../../api/wallet";
import MenuEntryUI from "../../components/CivicAppBar/MenuEntryUI";
import { WalletSelector } from "./WalletSelector";

enum TestIds {
  WALLET_CONNECTOR = "WALLET_CONNECTOR",
}

type Props = {
  connectWallet: () => void;
  walletType: WalletType;
  selectWalletType: (selected: WalletType) => void;
  window?: () => Window;
};
export const NoWalletConnected: FC<Props> = ({
  connectWallet,
  walletType,
  selectWalletType,
}: Props) => {
  const intl = useIntl();

  return (
    <List>
      <Link
        className="menuButtonLink"
        key="wallet.connect"
        onClick={connectWallet}
      >
        <MenuEntryUI
          icon={<WalletIcon />}
          text={intl.formatMessage({ id: "wallet.connect" })}
          dataTestId={TestIds.WALLET_CONNECTOR}
        />
      </Link>
      <WalletSelector current={walletType} select={selectWalletType} />
    </List>
  );
};
