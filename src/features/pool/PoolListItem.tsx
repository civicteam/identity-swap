import React from "react";
import { Pool } from "../../api/swap";

import styles from "./Pools.module.css";

export const PoolListItem = ({ tokenA, tokenB }: Pool): JSX.Element => (
  <div className={styles.poolListItem}>
    {tokenA}/{tokenB}
  </div>
);
