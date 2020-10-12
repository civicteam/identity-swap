import {
  any,
  complement,
  curry,
  propEq,
  find,
  eqProps,
  head,
  indexOf,
  update,
} from "ramda";
import { Pool, SerializablePool } from "../api/pool/Pool";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";
import { SerializableToken, Token } from "../api/token/Token";
import { RootState } from "../app/rootReducer";
import { TokenPairState } from "./types";

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
  token: Token,
  tokenAccounts: Array<TokenAccount>,
  excludeZeroBalance: boolean
): Array<TokenAccount> =>
  tokenAccounts
    .filter(
      (tokenAccount) =>
        tokenAccount.mint.equals(token) &&
        (excludeZeroBalance ? tokenAccount.balance > 0 : true)
    )
    .sort((a1, a2) => a2.balance - a1.balance);

export const syncTokenAccount = (
  tokenAccounts: Array<SerializableTokenAccount>,
  tokenAccount?: SerializableTokenAccount
): SerializableTokenAccount | undefined =>
  tokenAccount &&
  find(
    // use eqProps here because we are comparing SerializableTokenAccounts,
    // which have no equals() function
    eqProps("address", tokenAccount),
    tokenAccounts
  );

export const syncTokenAccounts = (
  tokenPairState: TokenPairState,
  tokenAccounts: Array<SerializableTokenAccount>
): TokenPairState => ({
  ...tokenPairState,
  tokenAccounts,
  firstTokenAccount: syncTokenAccount(
    tokenAccounts,
    tokenPairState.firstTokenAccount
  ),
  secondTokenAccount: syncTokenAccount(
    tokenAccounts,
    tokenPairState.secondTokenAccount
  ),
  poolTokenAccount: syncTokenAccount(
    tokenAccounts,
    tokenPairState.poolTokenAccount
  ),
});

export const syncPools = (
  tokenPairState: TokenPairState,
  availablePools: Array<SerializablePool>
): TokenPairState => ({
  ...tokenPairState,
  availablePools,
  selectedPool:
    tokenPairState.selectedPool &&
    find(
      eqProps("address", tokenPairState.selectedPool),
      tokenPairState.availablePools
    ),
});

/**
 * Given an entity and an array of entities
 * Find the location of the entity in the array, and replace it.
 * This only works with entities with equals() methods, whose properties
 * can change, without changing the equals result.
 * @param entity
 * @param array
 */
export const updateEntityArray = <T extends { equals: (other: T) => boolean }>(
  entity: T,
  array: Array<T>
): Array<T> => update(indexOf(entity, array), entity, array);

export const selectTokenAccount = (
  token?: Token,
  tokenAccounts?: Array<TokenAccount>,
  excludeZeroBalance = true
): TokenAccount | undefined => {
  if (!token || !tokenAccounts) return undefined;

  // fetch the pool token account with the highest balance that matches this token
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    token,
    tokenAccounts,
    excludeZeroBalance
  );

  if (sortedTokenAccounts.length > 0) return sortedTokenAccounts[0];

  return undefined;
};

export const getPoolTokenAccount = (
  pool: Pool,
  tokenAccounts: Array<TokenAccount>
): TokenAccount | undefined => {
  // fetch the pool token account with the highest balance that matches this pool
  const sortedTokenAccounts = getSortedTokenAccountsByHighestBalance(
    pool.poolToken,
    tokenAccounts,
    true
  );

  return head(sortedTokenAccounts);
};

export const tokenPairSelector = (
  state: RootState
): {
  firstAmount: number;
  secondAmount: number;
  firstToken?: Token;
  secondToken?: Token;
  firstTokenAccount?: TokenAccount;
  secondTokenAccount?: TokenAccount;
  selectedPool?: Pool;
  tokenAccounts: Array<TokenAccount>;
  availablePools: Array<Pool>;
  poolTokenAccount?: TokenAccount;
} => ({
  ...state.tokenPair,
  firstAmount: state.tokenPair.firstAmount,
  secondAmount: state.tokenPair.secondAmount,
  firstToken:
    state.tokenPair.firstToken && Token.from(state.tokenPair.firstToken),
  secondToken:
    state.tokenPair.secondToken && Token.from(state.tokenPair.secondToken),
  firstTokenAccount:
    state.tokenPair.firstTokenAccount &&
    TokenAccount.from(state.tokenPair.firstTokenAccount),
  secondTokenAccount:
    state.tokenPair.secondTokenAccount &&
    TokenAccount.from(state.tokenPair.secondTokenAccount),
  selectedPool:
    state.tokenPair.selectedPool && Pool.from(state.tokenPair.selectedPool),
  tokenAccounts: state.tokenPair.tokenAccounts.map(TokenAccount.from),
  availablePools: state.tokenPair.availablePools.map(Pool.from),
  poolTokenAccount:
    state.tokenPair.poolTokenAccount &&
    TokenAccount.from(state.tokenPair.poolTokenAccount),
});
