// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { readFileSync } from "fs";
import { join } from "path";
import { TextEncoder } from "util";
import { Crypto } from "@peculiar/webcrypto";
import { HasEqual } from "./utils/types";

// Workaround for https://github.com/ianstormtaylor/superstruct/issues/269
// superstruct is imported by @solana/web3. This avoids us having to change the web3 code
// to implement the workaround described in the issue. It appears to be an issue with the
// jest require module.

const superstruct = jest.requireActual("superstruct/umd/superstruct");
jest.setMock("superstruct/lib/index.cjs", superstruct);
// jest.setMock(
//   "@solana/spl-token-swap/node_modules/superstruct/lib/index.cjs",
//   superstruct
// );
jest.setMock("superstruct", superstruct);

const loadProgramId = (envProp: string, file: string) => {
  // if the program ID file exists, load it
  const programIdFile = join(process.cwd(), file);
  try {
    const programId = readFileSync(programIdFile, {
      encoding: "utf8",
    });
    process.env[envProp] = programId.trim();
    console.log(`${envProp}: ${process.env[envProp]}.`);
  } catch (error) {
    console.warn(`No programId file found at ${programIdFile}`);
  }
};

loadProgramId("SWAP_PROGRAM_ID", "swapProgramId");
loadProgramId("IDENTITY_PROGRAM_ID", "identityProgramId");

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

// Polyfills for APIs missing in JSDOM
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.crypto) {
  global["crypto"] = new Crypto();
}
