import { Pool } from "../../../src/api/pool/Pool";
import { pub } from "./publicKey";
import { tokenAccount } from "./tokenAccount";
import { token } from "./token";

export const pool = (): Pool =>
  new Pool(
    pub(),
    tokenAccount(1000),
    tokenAccount(2000),
    token(),
    tokenAccount(0),
    pub(),
    1,
    0.003
  );
