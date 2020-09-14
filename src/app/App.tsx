import React from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./rootReducer";
import { PoolsList } from "../features/pool/PoolsList";
import { poolAdd } from "../features/pool/PoolSlice";

function App(): JSX.Element {
  const dispatch = useDispatch();

  const { pools } = useSelector((state: RootState) => state.pool);

  return (
    <div className="App">
      <header className="App-header">Coming Soon...</header>
      <button
        onClick={() =>
          dispatch(poolAdd({ address: "abc", tokenA: "a", tokenB: "b" }))
        }
      >
        Add
      </button>
      <div>
        <h1>Pools</h1>
        <PoolsList pools={pools} />
      </div>
    </div>
  );
}

export default App;
