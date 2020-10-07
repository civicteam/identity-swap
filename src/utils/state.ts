import { complement, isNil, pickBy } from "ramda";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PayloadAction } from "@reduxjs/toolkit";
import { Pool, SerializablePool } from "../api/pool/Pool";
import { SerializableToken } from "../api/token/Token";

// Removes undefined values from the Partial object.
// e.g. converts { a: 1, b: undefined } to { a : 1 }
export const filterOutMissingProps: <T>(
  props: Partial<T>
) => Partial<T> = pickBy(complement(isNil));

type LocationState = {
  poolAddress?: string;
};

type PoolState = {
  selectedPool?: Pool;
  availablePools: Array<Pool>;
  updateAction: (payload: {
    selectedPool?: SerializablePool;
    firstToken?: SerializableToken;
    secondToken?: SerializableToken;
  }) => PayloadAction<{ selectedPool?: SerializablePool }>;
};
/**
 * If the react-router location state contains a pool address, then load this pool
 * into the state.
 * This allows the creation of react-route links to specific pools.
 * TODO After HE-53, there will be one global pool state, at which time they can be
 * retrieved here using useSelector(), rather than having to be passed in.
 * (likewise with the updateAction property, we can simply dispatch the appropriate updateState action)
 * @param selectedPool
 * @param availablePools
 * @param updateAction
 */
export const usePoolFromLocation = ({
  selectedPool,
  availablePools,
  updateAction,
}: PoolState): void => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const locationState = location.state as LocationState;

    if (locationState && locationState.poolAddress) {
      const newSelectedPool = availablePools.find(
        (pool) => pool.address.toBase58() === locationState.poolAddress
      );

      if (
        newSelectedPool &&
        (!selectedPool || !newSelectedPool.equals(selectedPool))
      ) {
        dispatch(
          updateAction({
            selectedPool: newSelectedPool?.serialize(),
            firstToken: newSelectedPool?.tokenA.mint.serialize(),
            secondToken: newSelectedPool?.tokenB.mint.serialize(),
          })
        );
      }
    }
    // empty deps is a workaround to ensure this only triggers once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
};
