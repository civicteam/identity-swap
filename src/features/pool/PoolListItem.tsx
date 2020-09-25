import React from "react";
import { SerializablePool } from "../../api/pool/Pool";
import styles from "./Pools.module.css";

export const PoolListItem = ({
  tokenA,
  tokenB,
}: SerializablePool): JSX.Element => (
  <div className={styles.poolListItem}>
    {tokenA}/{tokenB}
  </div>
);
