import { PublicKey } from "@solana/web3.js";
import { TokenAccount } from "../token/TokenAccount";
import { Token } from "../token/Token";
import { Pool } from "./Pool";

const publicKeyFactory = () => {
  let index = 0;
  return () => new PublicKey(index++);
};

const pub = publicKeyFactory();

describe("Pool", () => {
  describe("calculateSwappedAmount", () => {
    const pool = new Pool(
      pub(),
      new TokenAccount(new Token(pub(), 2), pub(), 1000),
      new TokenAccount(new Token(pub(), 2), pub(), 2000),
      new Token(pub(), 2),
      pub(),
      1,
      0.25
    );

    it("should calculate the correct amount in the A->B direction", () => {
      const amountInTokenA = 10;
      const amountInTokenB = pool.calculateSwappedAmount(
        pool.tokenA.mint,
        amountInTokenA
      );

      expect(amountInTokenB).toEqual(15);
    });

    it("should calculate the correct amount in the B->A direction", () => {
      const amountInTokenB = 10;
      const amountInTokenA = pool.calculateSwappedAmount(
        pool.tokenB.mint,
        amountInTokenB
      );

      expect(amountInTokenA).toEqual(4);
    });
  });
});
