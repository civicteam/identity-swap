import { PublicKey } from "@solana/web3.js";

const publicKeyFactory = () => {
  let index = 0;
  return () => new PublicKey(index++);
};

export const pub = publicKeyFactory();
