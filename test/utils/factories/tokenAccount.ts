import { Decimal } from "decimal.js";
import { TokenAccount } from "../../../src/api/token/TokenAccount";
import { Token } from "../../../src/api/token/Token";
import { pub } from "./publicKey";
import { token } from "./token";

export const tokenAccount = (
  balance: number | Decimal = 1000,
  underlyingToken?: Token
): TokenAccount => new TokenAccount(underlyingToken || token(), pub(), balance);
