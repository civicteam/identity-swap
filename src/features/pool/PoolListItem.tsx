import React from "react";
import { SerializablePool } from "../../utils/types";

import styles from "./Pools.module.css";

export const PoolListItem = ({
  tokenA,
  tokenB,
}: SerializablePool): JSX.Element => (
  <div className={styles.poolListItem}>
    {tokenA}/{tokenB}
  </div>
);
