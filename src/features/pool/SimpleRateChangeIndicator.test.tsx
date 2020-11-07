import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { Decimal } from "decimal.js";
import { render, waitForElementToBeRemoved } from "../../testUtils";
import { pool as createPool } from "../../../test/utils/factories/pool";
import { tokenAccount } from "../../../test/utils/factories/tokenAccount";
import { pub } from "../../../test/utils/factories/publicKey";
import { Pool } from "../../api/pool/Pool";
import {
  SimpleRateChangeIndicator,
  TestIds,
} from "./SimpleRateChangeIndicator";

function changeTokenBAmount(pool: Pool, newTokenBAmount: Decimal) {
  return new Pool(
    pub(),
    pool.tokenA,
    tokenAccount(newTokenBAmount),
    pool.poolToken,
    tokenAccount(0),
    pub(),
    1,
    0.003
  );
}

describe("<SimpleRateChangeIndicator>", () => {
  it("shows nothing when no previous rate exists", async () => {
    const pool = createPool();
    const { queryByTestId } = render(<SimpleRateChangeIndicator pool={pool} />);

    const missingDownIndicator = await queryByTestId(TestIds.RATE_DOWN);
    expect(missingDownIndicator).not.toBeInTheDocument();

    const missingUpIndicator = await queryByTestId(TestIds.RATE_UP);
    expect(missingUpIndicator).not.toBeInTheDocument();
  });

  it("shows a down indicator when the rate is lower than the previous pool", async () => {
    const pool = createPool();
    const oldPoolWithHigherRate = changeTokenBAmount(
      pool,
      pool.tokenB.balance.add(1000)
    );
    pool.setPrevious(oldPoolWithHigherRate);

    const { findByTestId } = render(<SimpleRateChangeIndicator pool={pool} />);

    const downIndicator = await findByTestId(TestIds.RATE_DOWN);
    expect(downIndicator).toBeInTheDocument();
  });

  it("shows an up indicator when the rate is lower than the previous pool", async () => {
    const pool = createPool();
    const oldPoolWithLowerRate = changeTokenBAmount(
      pool,
      pool.tokenB.balance.minus(1000)
    );
    pool.setPrevious(oldPoolWithLowerRate);

    const { findByTestId } = render(<SimpleRateChangeIndicator pool={pool} />);

    const upIndicator = await findByTestId(TestIds.RATE_UP);
    expect(upIndicator).toBeInTheDocument();
  });

  it("removes the indicators after a period of time", async () => {
    const pool = createPool();
    const oldPoolWithHigherRate = changeTokenBAmount(
      pool,
      pool.tokenB.balance.add(1000)
    );
    pool.setPrevious(oldPoolWithHigherRate);

    const { findByTestId, queryByTestId } = render(
      <SimpleRateChangeIndicator pool={pool} isNewTimeoutMs={10} />
    );

    const downIndicator = await findByTestId(TestIds.RATE_DOWN);
    expect(downIndicator).toBeInTheDocument();

    await waitForElementToBeRemoved(() => queryByTestId(TestIds.RATE_DOWN));
  });
});
