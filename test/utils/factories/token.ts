import BN from "bn.js";
import { Token } from "../../../src/api/token/Token";
import { pub } from "./publicKey";

export const token = (supply?: number): Token =>
  new Token(pub(), 2, new BN(supply || 1000));
