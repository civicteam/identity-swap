import { Token } from "../api/token/Token";

// Converts a token amount in minor denomination to its major denomination for display
// e.g. 100 cents to "1.00"
export const minorAmountToMajor = (minorAmount: number, token: Token): string =>
  (minorAmount / 10 ** token.decimals).toFixed(token.decimals);

// Converts a token amount in major denominatinoo to its minor denominationo for storage
// e.g. "1.00" to 100
export const majorAmountToMinor = (majorAmount: number, token: Token): number =>
  Math.round(majorAmount * 10 ** token.decimals);
