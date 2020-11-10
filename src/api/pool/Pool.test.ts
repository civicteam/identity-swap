import { Decimal } from "decimal.js";
import { TokenAccount } from "../token/TokenAccount";
import { pub } from "../../../test/utils/factories/publicKey";
import { token } from "../../../test/utils/factories/token";
import { toDecimal } from "../../utils/amount";
import { Pool } from "./Pool";

describe("Pool", () => {
  describe("rates and calculations", () => {
    const tokenA = token();
    const tokenB = token();
    const initialPoolTokenSupply = 1_000_000_000;
    const poolToken = token(initialPoolTokenSupply);

    const pool = new Pool(
      pub(),
      new TokenAccount(tokenA, pub(), 1000),
      new TokenAccount(tokenB, pub(), 2000),
      poolToken,
      new TokenAccount(poolToken, pub(), 2000),
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

    describe("getSmallestPoolTokenAmountForWithdrawalOrDeposit", () => {
      it("should calculate the smallest possible amount of pool tokens that can be moved", () => {
        // the smallest amount for "pool" is:
        // 1 tokenB, which translates to 1/2000th of the total pool (of 2000 B).
        // 1/2000th of the pool tokens is 500_000

        expect(pool.getSmallestPoolTokenAmountForWithdrawalOrDeposit()).toEqual(
          toDecimal(500_000)
        );
      });
    });

    describe("getTokenAValueOfPoolTokenAmount", () => {
      it("should calculate the correct integer value of token A from a pool token amount", () => {
        // 0.2% of the initial supply of pool tokens
        const poolTokenAmount = 2_000_000;
        // 0.2% of the initial deposited balance of token A
        const expectedTokenAValue = toDecimal(2);

        const tokenAValue = pool.getTokenAValueOfPoolTokenAmount(
          poolTokenAmount
        );

        expect(tokenAValue).toEqual(expectedTokenAValue);
      });

      it("should round down to the nearest integer value of token A from a pool token amount", () => {
        // 0.25% of the initial supply of pool tokens
        const poolTokenAmount = 2_500_000;
        // 0.25% of the initial deposited balance of token A
        // rounded down to the nearest minor denomination
        const expectedTokenAValue = toDecimal(2);

        const tokenAValue = pool.getTokenAValueOfPoolTokenAmount(
          poolTokenAmount
        );

        expect(tokenAValue).toEqual(expectedTokenAValue);
      });
    });

    describe("simpleRate", () => {
      it("should calculate the simple rate of the pool as B/A", () => {
        expect(pool.simpleRate().toNumber()).toEqual(2);
      });
    });

    describe("impliedRate", () => {
      it("should calculate the implied rate of the pool based on the input amount in A", () => {
        const amountInTokenA = 10;
        expect(
          pool.impliedRate(pool.tokenA.mint, amountInTokenA).toNumber()
        ).toEqual(2);
      });

      it("should calculate the implied rate of the pool based on the input amount in B", () => {
        const amountInTokenB = 10;
        expect(
          pool.impliedRate(pool.tokenB.mint, amountInTokenB).toNumber()
        ).toEqual(0.5);
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

    describe("calculateAmountsWithSlippage", () => {
      // half of the total pool tokens
      const poolTokenAmount = new Decimal(500_000_000);

      describe("with default slippage", () => {
        it("down should remove 20% from the amounts", () => {
          const tokenAAmount = new Decimal(400); // half of the token A amount (500) - 20%
          const tokenBAmount = new Decimal(800); // half of the token B amount (1000) - 20%
          const adjustedAmounts = pool.calculateAmountsWithSlippage(
            poolTokenAmount,
            "down"
          );

          expect(adjustedAmounts).toEqual({
            poolTokenAmount,
            tokenAAmount,
            tokenBAmount,
          });
        });

        it("up should add 2% to the amounts", () => {
          const tokenAAmount = new Decimal(600); // half of the token A amount (500) + 20%
          const tokenBAmount = new Decimal(1200); // half of the token B amount (1000) + 20%
          const adjustedAmounts = pool.calculateAmountsWithSlippage(
            poolTokenAmount,
            "up"
          );

          expect(adjustedAmounts).toEqual({
            poolTokenAmount,
            tokenAAmount,
            tokenBAmount,
          });
        });
      });

      describe("with a provided slippage parameter", () => {
        // slippage parameter = 5%
        const slippage = 0.05;

        it("down should remove 5% from the amounts", () => {
          const tokenAAmount = new Decimal(475); // half of the token A amount (500) - 5%
          const tokenBAmount = new Decimal(950); // half of the token B amount (1000) - 5%
          const adjustedAmounts = pool.calculateAmountsWithSlippage(
            poolTokenAmount,
            "down",
            slippage
          );

          expect(adjustedAmounts).toEqual({
            poolTokenAmount,
            tokenAAmount,
            tokenBAmount,
          });
        });

        it("up should add 5% to the amounts", () => {
          const tokenAAmount = new Decimal(525); // half of the token A amount (500) + 5%
          const tokenBAmount = new Decimal(1050); // half of the token B amount (1000) + 5%
          const adjustedAmounts = pool.calculateAmountsWithSlippage(
            poolTokenAmount,
            "up",
            slippage
          );

          console.log(adjustedAmounts);

          expect(adjustedAmounts).toEqual({
            poolTokenAmount,
            tokenAAmount,
            tokenBAmount,
          });
        });
      });
    });
  });
});
