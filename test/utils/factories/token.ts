import BN from "bn.js";
import { Token } from "../../../src/api/token/Token";
import { pub } from "./publicKey";

export const token = (): Token => new Token(pub(), 2, new BN(1000));
