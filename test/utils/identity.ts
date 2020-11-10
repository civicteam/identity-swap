import { connect, WalletType } from "../../src/api/wallet/";
import { APIFactory as IdentityAPIFactory } from "../../src/api/identity/";
import { ExtendedCluster } from "../../src/utils/types";
import { Identity } from "../../src/api/identity/Identity";

const defaultCluster: ExtendedCluster =
  (process.env.CLUSTER as ExtendedCluster) || "localnet";

type CreateIdentityParameters = {
  cluster?: ExtendedCluster;
};

/**
 * Create an identity account
 * @param cluster The solana cluster to connect to
 */
export const createIdentity = async ({
  cluster = defaultCluster,
}: CreateIdentityParameters): Promise<Identity> => {
  await connect(cluster, WalletType.LOCAL);

  const identityAPI = IdentityAPIFactory(cluster);
  return identityAPI.createIdentity();
};
