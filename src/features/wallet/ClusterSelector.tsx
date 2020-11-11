import React, { FC } from "react";
import NativeSelect from "@material-ui/core/NativeSelect";
import { Cluster } from "@solana/web3.js";
import ClusterIcon from "@material-ui/icons/GroupWork";
import { ListItem, ListItemIcon } from "@material-ui/core";
import { useIntl } from "react-intl";
import { CLUSTERS } from "../../utils/connection";
import TooltipIcon from "../../components/Tooltip";
import { DEFAULT_CLUSTER } from "./WalletSlice";

enum TestIds {
  NETWORK_OPTION = "NETWORK_OPTION",
  NETWORK_SELECTOR = "NETWORK_SELECTOR",
}

// use this to restrict the choice of clusters (e.g. if features are not available on all clusters)
const SUPPORTED_CLUSTERS = [DEFAULT_CLUSTER];

type Props = {
  select: (selected: Cluster) => void;
  current: Cluster;
};
export const ClusterSelector: FC<Props> = ({ select, current }: Props) => {
  const intl = useIntl();
  return (
    <ListItem button key="wallet.cluster">
      <ListItemIcon>
        <ClusterIcon />
      </ListItemIcon>
      <NativeSelect
        data-testid={TestIds.NETWORK_SELECTOR}
        aria-label={intl.formatMessage({ id: "wallet.cluster" })}
        value={current}
        disabled={SUPPORTED_CLUSTERS.length === 1} // disable if there is only one choice
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
      <TooltipIcon text={"tooltip.cluster.selector"} />
    </ListItem>
  );
};
