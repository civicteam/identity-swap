import { struct } from "superstruct";

describe("api/pool test", () => {
  it("should load superstruct", () => {
    expect(struct).toBeDefined(); // fails if not for the fix in setupTests.ts
  });
});
