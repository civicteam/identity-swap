import { TokenAccount } from "../token/TokenAccount";
import { pub } from "../../../test/utils/factories/publicKey";
import { token } from "../../../test/utils/factories/token";
import { Pool } from "./Pool";

describe("Pool", () => {
  describe("rates and calculations", () => {
    const tokenA = token();
    const tokenB = token();
    const poolToken = token();

    const pool = new Pool(
      pub(),
      new TokenAccount(tokenA, pub(), 1000),
      new TokenAccount(tokenB, pub(), 2000),
      poolToken,
      pub(),
      1,
      0.25
    );

    describe("calculateAmountInOtherToken", () => {
      it("should calculate the correct amount in the A->B direction, including fees", () => {
        const amountInTokenA = 10;
        const amountInTokenB = pool.calculateAmountInOtherToken(
          pool.tokenA.mint,
          amountInTokenA,
          true
        );

        expect(amountInTokenB).toEqual(15);
      });

      it("should calculate the correct amount in the B->A direction, including fees", () => {
        const amountInTokenB = 10;
        const amountInTokenA = pool.calculateAmountInOtherToken(
          pool.tokenB.mint,
          amountInTokenB,
          true
        );

        expect(amountInTokenA).toEqual(4);
      });

      it("should calculate the correct amount in the A->B direction, excluding fees", () => {
        const amountInTokenA = 10;
        const amountInTokenB = pool.calculateAmountInOtherToken(
          pool.tokenA.mint,
          amountInTokenA,
          false
        );

        expect(amountInTokenB).toEqual(20);
      });

      it("should calculate the correct amount in the B->A direction, excluding fees", () => {
        const amountInTokenB = 10;
        const amountInTokenA = pool.calculateAmountInOtherToken(
          pool.tokenB.mint,
          amountInTokenB,
          false
        );

        expect(amountInTokenA).toEqual(5);
      });
    });

    describe("simpleRate", () => {
      it("should calculate the simple rate of the pool as B/A", () => {
        expect(pool.simpleRate()).toEqual(2);
      });
    });

    describe("impliedRate", () => {
      it("should calculate the implied rate of the pool based on the input amount in A", () => {
        const amountInTokenA = 10;
        expect(pool.impliedRate(pool.tokenA.mint, amountInTokenA)).toEqual(2);
      });

      it("should calculate the implied rate of the pool based on the input amount in B", () => {
        const amountInTokenB = 10;
        expect(pool.impliedRate(pool.tokenB.mint, amountInTokenB)).toEqual(0.5);
      });
    });

    describe("impliedFees", () => {
      it("should calculate the implied fee for a swap transaction from A to B", () => {
        const amountInTokenA = 10;
        expect(pool.impliedFee(pool.tokenA.mint, amountInTokenA)).toEqual(5);
      });

      it("should calculate the implied fee for a swap transaction from B to A", () => {
        const amountInTokenB = 10;
        expect(pool.impliedFee(pool.tokenB.mint, amountInTokenB)).toEqual(1);
      });
    });
  });
});
