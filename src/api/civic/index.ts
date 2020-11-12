import axios from "axios";
import { path, prop } from "ramda";

const DEFAULT_POLLING_FREQUENCY_MS = 2000;
const CIVIC_ENV = "prod";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const civicConfig = require("./civic.config.json")[CIVIC_ENV];

export type AccessType = {
  imageUri: string;
};
export type EmailClaim = {
  contact: {
    email: { username: string; domain: { name: string; tld: string } };
  };
};
export type Claim = EmailClaim;
export type Credential = {
  claim: Record<string, Claim>;
  proof: Record<string, string>;
};
export type ScopeRequest = {
  uuid: string;
  status: Status;
  access: AccessType;
  components: {
    identity: {
      response: { verifiableData: Array<{ credential: Credential }> };
    };
  };
};

export type Status =
  | "awaiting-user"
  | "user-acknowledged"
  | "verification-success"
  | "verification-failed";

export const API = {
  createScopeRequest: (): Promise<ScopeRequest> =>
    axios({
      method: "post",
      url: civicConfig.url,
      responseType: "json",
      data: {
        app: {
          id: civicConfig.appId,
        },
        access: {
          type: "qrcode",
        },
        components: {
          identity: {
            request: {
              template: {
                reference: "civicBasic",
              },
            },
          },
        },
      },
    }).then(prop("data")),

  getScopeRequestStatus: (uuid: string): Promise<Status | undefined> =>
    axios(`${civicConfig.url}/${uuid}/status`).then(path(["data", "status"])),

  getScopeRequest: (uuid: string): Promise<ScopeRequest> =>
    axios({
      url: `${civicConfig.url}/${uuid}`,
      headers: {
        // In this demo, the Civic key is included in the front-end UI.
        // In a non-demo environment, the attestation should be posted on the IdV backend
        // and registered on the blockchain there.
        Authorization: `Civic ${civicConfig.clientToken}`,
      },
    }).then(prop("data")),

  pollScopeRequestUntilDone: (
    uuid: string,
    pollingFrequencyMs = DEFAULT_POLLING_FREQUENCY_MS
  ): Promise<Status> =>
    new Promise<Status>((resolve, reject) => {
      const handle = setInterval(async () => {
        const status = await API.getScopeRequestStatus(uuid);
        if (status !== "awaiting-user" && status !== "user-acknowledged") {
          clearInterval(handle);
          if (status === "verification-success") {
            resolve(status);
          } else {
            reject(new Error("Scope request verification failed"));
          }
        }
      }, pollingFrequencyMs);
    }),
};
