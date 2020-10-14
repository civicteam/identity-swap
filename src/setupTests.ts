// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { readFileSync } from "fs";
import { join } from "path";
import { HasEqual } from "./utils/types";

// Workaround for https://github.com/ianstormtaylor/superstruct/issues/269
// superstruct is imported by @solana/web3. This avoids us having to change the web3 code
// to implement the workaround described in the issue. It appears to be an issue with the
// jest require module.
const superstruct = jest.requireActual("superstruct/umd/superstruct");
jest.setMock("superstruct/lib/index.cjs", superstruct);
jest.setMock("superstruct", superstruct);

// if the swap program ID file exists, load it
const swapProgramIdFile = join(process.cwd(), "swapProgramId");
try {
  const swapProgramId = readFileSync(swapProgramIdFile, {
    encoding: "utf8",
  });
  process.env["SWAP_PROGRAM_ID"] = swapProgramId.trim();
  console.log("Swap Program ID: " + process.env.SWAP_PROGRAM_ID + ".");
} catch (error) {
  console.warn(`No swapProgramId file found at ${swapProgramIdFile}`);
}

expect.extend({
  toBeEqualByMethodTo<T extends HasEqual<T>>(received: T, other: T) {
    const equal = received.equals(other);

    return equal
      ? {
          pass: true,
          message: () => `Expected ${received} not to equal ${other}`,
        }
      : {
          pass: false,
          message: () => `Expected ${received} to equal ${other}`,
        };
  },
});
