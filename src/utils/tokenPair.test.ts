import { take } from "ramda";
import { Decimal } from "decimal.js";
import { pool } from "../../test/utils/factories/pool";
import { token } from "../../test/utils/factories/token";
import { pub } from "../../test/utils/factories/publicKey";
import { Token } from "../api/token/Token";
import { amountRatio, withoutPoolTokens } from "./tokenPair";

describe("tokenPair", () => {
  describe("withoutPoolTokens", () => {
    const pools = [pool(), pool()];
    const tokens = [
      token(),
      token(),
      token(),
      pools[0].poolToken,
      pools[1].poolToken,
    ];

    it("should filter pool tokens out of a token array", () => {
      const nonPoolTokens = take(3, tokens);
      expect(withoutPoolTokens(pools, tokens)).toEqual(nonPoolTokens);
    });
  });

  describe("amountRatio", () => {
    const tokenWithNoDecimalPlaces = new Token(pub(), 0, 1000);
    const tokenWithTwoDecimalPlaces = new Token(pub(), 2, 1000);
    const tokenWithEighteenDecimalPlaces = new Token(pub(), 18, 1000);

    it("should calculate a ratio when the decimal places are the same", () =>
      expect(
        amountRatio(
          tokenWithTwoDecimalPlaces,
          10,
          tokenWithTwoDecimalPlaces,
          20
        ).toNumber()
      ).toBe(0.5));

    it("should calculate a ratio when there are no decimal places", () =>
      expect(
        amountRatio(
          tokenWithNoDecimalPlaces,
          10,
          tokenWithNoDecimalPlaces,
          20
        ).toNumber()
      ).toBe(0.5));

    it("should calculate a ratio with large numbers", () =>
      expect(
        amountRatio(
          tokenWithNoDecimalPlaces,
          new Decimal("1e22"),
          tokenWithNoDecimalPlaces,
          new Decimal("2e22")
        ).toNumber()
      ).toBe(0.5));

    it("should calculate a ratio when the decimal places are different", () => {
      expect(
        amountRatio(
          tokenWithTwoDecimalPlaces,
          1000,
          tokenWithNoDecimalPlaces,
          20
        ).toNumber()
      ).toBe(0.5);

      expect(
        amountRatio(
          tokenWithTwoDecimalPlaces,
          100,
          tokenWithEighteenDecimalPlaces,
          new Decimal("2e18")
        ).toNumber()
      ).toBe(0.5);
    });
  });
});
