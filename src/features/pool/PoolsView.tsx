import React, { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";
import { TokenAccount } from "../../api/token/TokenAccount";
import { Pool } from "../../api/pool/Pool";
import { PoolsTable } from "./PoolsTable";

export const PoolsView: FC = () => {
  const props = useSelector((state: RootState) => ({
    pools: state.pool.availablePools.map(Pool.from),
    tokenAccounts: state.wallet.tokenAccounts.map(TokenAccount.from),
  }));

  return (
    <>
      <PoolsTable {...props} />
    </>
  );
};
