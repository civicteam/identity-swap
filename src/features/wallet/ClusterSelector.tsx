import React, { FC } from "react";
import NativeSelect from "@material-ui/core/NativeSelect";
import { Cluster } from "@solana/web3.js";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { CLUSTERS } from "../../utils/connection";

type Props = {
  select: (selected: Cluster) => void;
  current: Cluster;
};
export const ClusterSelector: FC<Props> = ({ select, current }: Props) => (
  <FormControl>
    <NativeSelect
      aria-label="select cluster"
      value={current}
      onChange={(event) => select(event.target.value as Cluster)}
    >
      {CLUSTERS.map((cluster) => (
        <option key={cluster} value={cluster}>
          {cluster}
        </option>
      ))}
    </NativeSelect>
    <FormHelperText>Solana Cluster</FormHelperText>
  </FormControl>
);
