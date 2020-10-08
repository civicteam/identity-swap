import { take } from "ramda";
import { pool } from "../../test/utils/factories/pool";
import { token } from "../../test/utils/factories/token";
import { withoutPoolTokens } from "./tokenPair";

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
});
