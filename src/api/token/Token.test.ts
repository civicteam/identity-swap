import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Token } from "./Token";

describe("Token", () => {
  it("should convert to a serialized version and back", () => {
    const address = new PublicKey(123);
    const mintAuthority = new PublicKey(456);
    const token = new Token(
      address,
      2,
      new BN(100),
      mintAuthority,
      "My Token",
      "TOK"
    );

    const serializedToken = token.serialize();
    const deserializedToken = Token.from(serializedToken);

    expect(deserializedToken.address.toBase58()).toEqual(
      token.address.toBase58()
    );
    expect(deserializedToken.mintAuthority?.toBase58()).toEqual(
      token.mintAuthority?.toBase58()
    );
  });
});
