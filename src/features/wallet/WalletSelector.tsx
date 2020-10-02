import React, { FC } from "react";
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { WalletType } from "../../api/wallet";
import { isDev } from "../../utils/env";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";

enum TestIds {
  WALLET_SELECTION = "WALLET_SELECTION",
}

const walletLabel = (intl: IntlShape, walletType: WalletType): string =>
  intl.formatMessage({
    id: "wallet.option." + WalletType[walletType].toLowerCase(),
  });

type Props = {
  current: WalletType;
  select: (walletType: WalletType) => void;
};
export const WalletSelector: FC<Props> = ({ current, select }: Props) => {
  const intl = useIntl();

  return (
    <FormControl>
      <FormLabel>
        <FormattedMessage id="wallet.connect" />
      </FormLabel>
      <RadioGroup
        onChange={(event) => select(parseInt(event.target.value, 10))}
        value={current}
      >
        <FormControlLabel
          control={<Radio />}
          value={WalletType.SOLLET}
          label={walletLabel(intl, WalletType.SOLLET)}
          data-testid={`${TestIds.WALLET_SELECTION}_${
            WalletType[WalletType.SOLLET]
          }`}
        />
        {isDev && (
          <FormControlLabel
            control={<Radio />}
            value={WalletType.LOCAL}
            label={walletLabel(intl, WalletType.LOCAL)}
            data-testid={`${TestIds.WALLET_SELECTION}_${
              WalletType[WalletType.LOCAL]
            }`}
          />
        )}
      </RadioGroup>
    </FormControl>
  );
};
