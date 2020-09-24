import React from "react";
import { SerializablePool } from "../../utils/types";

import styles from "./Pools.module.css";
import { PoolListItem } from "./PoolListItem";

interface Props {
  pools: Array<SerializablePool>;
}

export const PoolsList = ({ pools }: Props): JSX.Element => (
  <ul className={styles.poolsList}>
    {pools.map((pool) => (
      <li key={pool.address}>
        <PoolListItem {...pool} />
      </li>
    ))}
  </ul>
);
