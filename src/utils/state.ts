import { complement, isNil, pickBy } from "ramda";

// Removes undefined values from the Partial object.
// e.g. converts { a: 1, b: undefined } to { a : 1 }
export const filterOutMissingProps: <T>(
  props: Partial<T>
) => Partial<T> = pickBy(complement(isNil));
