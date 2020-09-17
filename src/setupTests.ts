// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

// Workaround for https://github.com/ianstormtaylor/superstruct/issues/269
// superstruct is imported by @solana/web3. This avoids us having to change the web3 code
// to implement the workaround described in the issue. It appears to be an issue with the
// jest require module.
const superstruct = jest.requireActual("superstruct/umd/superstruct");
jest.setMock("superstruct/lib/index.cjs", superstruct);
jest.setMock(
  "@solana/spl-token-swap/node_modules/superstruct/lib/index.cjs",
  superstruct
);
jest.setMock("superstruct", superstruct);
