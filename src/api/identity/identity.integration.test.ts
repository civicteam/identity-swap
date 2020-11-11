// Increase timeout for tests that send transactions
import { pluck } from "ramda";
import { Wallet } from "../wallet/Wallet";
import * as WalletAPI from "../wallet";
import { WalletType } from "../wallet";
import { airdropTo } from "../../../test/utils/account";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { sha256 } from "../../utils/identity";
import { Identity } from "./Identity";
import { APIFactory as IdentityAPIFactory, API as IdentityAPI } from "./index";

jest.setTimeout(240000);

const CLUSTER: ExtendedCluster = "localnet";
let API: IdentityAPI;

describe("api/identity integration test", () => {
  let wallet: Wallet;

  let identity: Identity;

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);
    API = IdentityAPIFactory(CLUSTER);

    console.log("Airdropping to the wallet");
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
  });

  it("should create an identity", async () => {
    identity = await API.createIdentity();
  });

  it("should get an identity by address", async () => {
    const foundIdentity = await API.getIdentity(identity.address);

    expect(foundIdentity.address).toEqual(identity.address);
  });

  it("should get all identities for a wallet", async () => {
    const foundIdentities = await API.getIdentities();

    expect(pluck("address", foundIdentities)).toContainEqual(identity.address);
  });

  it("should attest to an identity using the dummy IDV", async () => {
    const attestation = await sha256("hello");
    await API.attest(identity, attestation);

    const foundIdentity = await API.getIdentity(identity.address);
    expect(foundIdentity.attestations[0].attestationData).toEqual(attestation);
    expect(foundIdentity.attestations[0].idv).toEqual(API.dummyIDV.publicKey);
  });
});
