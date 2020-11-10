// Increase timeout for tests that send transactions
import { API, ScopeRequest } from "./index";

jest.setTimeout(30000);

describe("api/civic integration test", () => {
  let scopeRequest: ScopeRequest;

  describe("createScopeRequest", () => {
    it("should create a scope request", async () => {
      scopeRequest = await API.createScopeRequest();

      expect(scopeRequest).toHaveProperty("access.imageUri");
    });

    it("should get the scope request status", async () => {
      const status = await API.getScopeRequestStatus(scopeRequest.uuid);

      expect(status).toEqual("awaiting-user");
    });

    it("should get the scope request data", async () => {
      scopeRequest = await API.getScopeRequest(scopeRequest.uuid);
    });
  });
});
