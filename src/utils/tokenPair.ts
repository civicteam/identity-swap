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
import { Decimal } from "decimal.js";
import { Pool, SerializablePool } from "../api/pool/Pool";
import {
  SerializableTokenAccount,
  TokenAccount,
} from "../api/token/TokenAccount";
import { SerializableToken, Token } from "../api/token/Token";
import { RootState } from "../app/rootReducer";
import { HasEqual, TokenPairState } from "./types";

export const selectPoolForTokenPair = (
  availablePools: Array<SerializablePool>,
  serializedFirstToken?: SerializableToken,
  serializedSecondToken?: SerializableToken
): SerializablePool | undefined => {
  if (!serializedFirstToken || !serializedSecondToken) return undefined;

  const firstToken = Token.from(serializedFirstToken);
  const secondToken = Token.from(serializedSecondToken);

  const pools = availablePools.map(Pool.from);
  const foundPool = pools.find(matchesPool(firstToken, secondToken));
  return foundPool && foundPool.serialize();
};

const matchesPool = (firstToken: Token, secondToken: Token) => (
  pool: Pool
): boolean => pool.matchesTokens(firstToken, secondToken);

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
        (excludeZeroBalance ? tokenAccount.balance.gt(0) : true)
    )
    .sort((a1, a2) => a2.balance.cmp(a1.balance));

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
export const updateEntityArray = <T extends HasEqual<T>>(
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

/**
 * Calculates the ratio between two token amounts of varying currencies using integer arithmetic
 *
 * Ratio(a, b) = (a / b) * 10^(decimals b - decimals a)
 */
export const amountRatio = (
  tokenA: Token,
  minorAmountA: number | Decimal,
  tokenB: Token,
  minorAmountB: number | Decimal
): Decimal => {
  const exponent = tokenB.decimals - tokenA.decimals;

  const a = new Decimal(minorAmountA);
  const b = new Decimal(minorAmountB);

  const expo = new Decimal(10).pow(exponent);
  return a.mul(expo).div(b);
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
  slippage?: number;
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
  slippage: state.tokenPair.slippage,
});
