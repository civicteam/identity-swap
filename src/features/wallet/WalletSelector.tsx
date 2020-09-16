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
      />
      {isDev && (
        <FormControlLabel
          control={<Radio />}
          value={WalletType.LOCAL}
          label="Local (DEV ONLY)"
        />
      )}
    </RadioGroup>
  </FormControl>
);
