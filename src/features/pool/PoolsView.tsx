import { v4 as uuid } from "uuid";
import React, { FC, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
// TODO Temporary until moved to the redux layer
import { getPools } from "../../api/pool";
import { addPool } from "./PoolSlice";
import { PoolsList } from "./PoolsList";

export const PoolsView: FC = () => {
  const dispatch = useDispatch();
  const { pools } = useSelector((state: RootState) => state.pool);
  const { cluster } = useSelector((state: RootState) => state.wallet);

  const poolInfo = useMemo(() => getPools(cluster), [cluster]);
  console.log(poolInfo);

  return (
    <>
      <h1>Pools</h1>
      <PoolsList pools={pools} />
      <button
        onClick={() => {
          dispatch(addPool({ address: uuid(), tokenA: "a", tokenB: "b" }));
          dispatch(addNotification({ message: "Pool added" }));
        }}
      >
        Add
      </button>
    </>
  );
};
