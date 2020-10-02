import React, { FC } from "react";
import NativeSelect from "@material-ui/core/NativeSelect";
import { Cluster } from "@solana/web3.js";
import FormControl from "@material-ui/core/FormControl";
import { FormLabel } from "@material-ui/core";
import { CLUSTERS } from "../../utils/connection";
import { FormattedMessage, useIntl } from "react-intl";

enum TestIds {
  NETWORK_OPTION = "NETWORK_OPTION",
  NETWORK_SELECTOR = "NETWORK_SELECTOR",
}

type Props = {
  select: (selected: Cluster) => void;
  current: Cluster;
};
export const ClusterSelector: FC<Props> = ({ select, current }: Props) => {
  const intl = useIntl();
  return (
    <FormControl>
      <FormLabel>
        <FormattedMessage id="wallet.cluster" />
      </FormLabel>
      <NativeSelect
        data-testid={TestIds.NETWORK_SELECTOR}
        aria-label={intl.formatMessage({ id: "wallet.cluster" })}
        value={current}
        onChange={(event) => select(event.target.value as Cluster)}
      >
        {CLUSTERS.map((cluster) => (
          <option
            data-testid={`${TestIds.NETWORK_OPTION}_${cluster}`}
            key={cluster}
            value={cluster}
          >
            {cluster}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};
