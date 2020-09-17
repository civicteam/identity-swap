import { v4 as uuid } from "uuid";
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../notification/NotificationSlice";
import { RootState } from "../../app/rootReducer";
import { addPool } from "./PoolSlice";
import { PoolsList } from "./PoolsList";

export const PoolsView: FC = () => {
  const dispatch = useDispatch();
  const { pools } = useSelector((state: RootState) => state.pool);

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
