import { any, complement, curry, propEq } from "ramda";
import { Pool, SerializablePool } from "../api/pool/Pool";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";
import { SerializableToken, Token } from "../api/token/Token";

export const selectPoolForTokenPair = (
  availablePools: Array<SerializablePool>,
  serializedFirstTokenAccount?: SerializableTokenAccount,
  serializedSecondTokenAccount?: SerializableTokenAccount
): SerializablePool | undefined => {
  if (!serializedFirstTokenAccount || !serializedSecondTokenAccount)
    return undefined;

  const firstTokenAccount = TokenAccount.from(serializedFirstTokenAccount);
  const secondTokenAccount = TokenAccount.from(serializedSecondTokenAccount);

  const pools = availablePools.map(Pool.from);
  const foundPool = pools.find(
    matchesPool(firstTokenAccount, secondTokenAccount)
  );
  return foundPool && foundPool.serialize();
};

const matchesPool = (
  firstTokenAccount: TokenAccount,
  secondTokenAccount: TokenAccount
) => (pool: Pool): boolean =>
  pool.matches(firstTokenAccount, secondTokenAccount);

const isPoolToken = (pools: Array<Pool>) => (token: Token) =>
  any(propEq("poolToken", token), pools);

export const withoutPoolTokens = curry(
  (pools: Array<Pool>, tokens: Array<Token>) =>
    tokens.filter(complement(isPoolToken(pools)))
);

export const getToAmount = (
  firstAmount: number,
  fromSerializableToken?: SerializableToken,
  serializablePool?: SerializablePool
): number => {
  if (!serializablePool || !fromSerializableToken) return 0;

  const pool = Pool.from(serializablePool);
  const firstToken = Token.from(fromSerializableToken);
  return pool.calculateAmountInOtherToken(firstToken, firstAmount, false);
};

export const getSortedTokenAccountsByHighestBalance = (
  token: SerializableToken,
  tokenAccounts: Array<SerializableTokenAccount>,
  excludeZeroBalance: boolean
): Array<TokenAccount> =>
  tokenAccounts
    .map(TokenAccount.from)
    .filter(
      (tokenAccount) =>
        tokenAccount.mint.address.toBase58() === token.address &&
        (excludeZeroBalance ? tokenAccount.balance > 0 : true)
    )
    .sort((a1, a2) => a2.balance - a1.balance);
