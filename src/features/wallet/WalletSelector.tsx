import React, { FC } from "react";
import {
  FormControlLabel,
  RadioGroup,
  FormLabel,
  Radio,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { WalletType } from "../../api/wallet";
import { isDev } from "../../utils/env";

enum TestIds {
  WALLET_SELECTION = "WALLET_SELECTION",
}

type Props = {
  current: WalletType;
  select: (walletType: WalletType) => void;
};
export const WalletSelector: FC<Props> = ({ current, select }: Props) => (
  <FormControl>
    <FormLabel>Connect Wallet</FormLabel>
    <RadioGroup
      onChange={(event) => select(parseInt(event.target.value, 10))}
      value={current}
    >
      <FormControlLabel
        control={<Radio />}
        value={WalletType.SOLLET}
        label="Sollet"
        data-testid={`${TestIds.WALLET_SELECTION}_${
          WalletType[WalletType.SOLLET]
        }`}
      />
      {isDev && (
        <FormControlLabel
          control={<Radio />}
          value={WalletType.LOCAL}
          label="Local (DEV ONLY)"
          data-testid={`${TestIds.WALLET_SELECTION}_${
            WalletType[WalletType.LOCAL]
          }`}
        />
      )}
    </RadioGroup>
  </FormControl>
);
