import {
  Identity as SPLIdentity,
  IdentityAccountInfo,
  IdentityAccountLayout,
} from "@civic/spl-identity";
import { Account, PublicKey, PublicKeyAndAccount } from "@solana/web3.js";
import { complement, isNil } from "ramda";
import { ExtendedCluster } from "../../utils/types";
import {
  getWallet,
  makeTransaction,
  sendTransaction,
  sendTransactionFromAccount,
} from "../wallet";
import { makeNewAccountInstruction } from "../../utils/transaction";
import { getConnection } from "../connection";
import { defaultCommitment, localIdentityProgramId } from "../../utils/env";
import { Attestation, Identity } from "./Identity";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const identityConfig = require("./identity.config.json");

export interface API {
  createIdentity: () => Promise<Identity>;
  getIdentity: (publicKey: PublicKey) => Promise<Identity>;
  getIdentities: () => Promise<Array<Identity>>;
  attest: (identityAccount: Identity, attestation: Uint8Array) => Promise<void>;
  dummyIDV: Account;
}
export const APIFactory = (cluster: ExtendedCluster): API => {
  const connection = getConnection(cluster);
  const identityConfigForCluster = identityConfig[cluster];
  const payer = new Account(); // unused - just filling the gap in the SPLIdentity constructor

  const identityProgramIdString =
    identityConfigForCluster.identityProgramId || localIdentityProgramId;
  if (!identityProgramIdString)
    throw new Error("No Identity program ID defined");
  console.log(`Identity Program ID ${identityProgramIdString}.`);
  const identityProgramId = new PublicKey(identityProgramIdString);

  // For testing/demo purposes, the IDV key is embedded in the UI code - do not use this in production!
  const dummyIDV = new Account(identityConfigForCluster.dummyIdv.privateKey);

  const getAttestationsFromAccountInfo = (
    identityAccountInfo: IdentityAccountInfo
  ) =>
    identityAccountInfo.attestation
      ? [
          new Attestation(
            identityAccountInfo.attestation.idv,
            identityAccountInfo.attestation.attestationData
          ),
        ]
      : [];

  const getIdentity = async (publicKey: PublicKey): Promise<Identity> => {
    const identityAccountInfo = await new SPLIdentity(
      connection,
      identityProgramId,
      payer
    ).getAccountInfo(publicKey);

    const attestations = getAttestationsFromAccountInfo(identityAccountInfo);

    return new Identity(publicKey, attestations);
  };

  const createIdentity = async (): Promise<Identity> => {
    // this is the new token account.
    // It will be assigned to the current wallet in the initAccount instruction
    const newIdentityAccount = new Account();
    console.log("New identity account", {
      address: newIdentityAccount.publicKey.toBase58(),
      owner: getWallet().pubkey.toBase58(),
    });

    // Instruction to create a new Solana account
    const createAccountInstruction = await makeNewAccountInstruction(
      cluster,
      newIdentityAccount.publicKey,
      IdentityAccountLayout,
      identityProgramId
    );

    const initIdentityAccountInstruction = SPLIdentity.createInitAccountInstruction(
      identityProgramId,
      newIdentityAccount.publicKey,
      getWallet().pubkey
    );

    const transaction = await makeTransaction(
      [createAccountInstruction, initIdentityAccountInstruction],
      [newIdentityAccount]
    );

    await sendTransaction(transaction);

    return getIdentity(newIdentityAccount.publicKey);
  };

  const attest = async (
    identityAccount: Identity,
    attestation: Uint8Array
  ): Promise<void> => {
    const createAttestationInstruction = SPLIdentity.createAttestInstruction(
      identityProgramId,
      identityAccount.address,
      dummyIDV.publicKey,
      attestation
    );

    const transaction = await makeTransaction([createAttestationInstruction]);

    await sendTransactionFromAccount(transaction, dummyIDV);
  };

  const getIdentities = async (): Promise<Array<Identity>> => {
    const getParsedProgramAccountsResponse = await connection.getParsedProgramAccounts(
      identityProgramId,
      defaultCommitment
    );
    const parsedIdentityAccounts = getParsedProgramAccountsResponse as [
      PublicKeyAndAccount<Buffer>
    ];

    const splIdentity = new SPLIdentity(connection, identityProgramId, payer);
    return parsedIdentityAccounts
      .map((publicKeyAndAccount) => {
        const identityAccountInfo = splIdentity.accountInfoDataToIdentity(
          publicKeyAndAccount.account.data
        );

        if (!identityAccountInfo.owner.equals(getWallet().pubkey)) return null;

        const publicKey = publicKeyAndAccount.pubkey;
        const attestations = getAttestationsFromAccountInfo(
          identityAccountInfo
        );

        return new Identity(publicKey, attestations);
      })
      .filter(complement(isNil)) as Array<Identity>;
  };

  return {
    createIdentity,
    getIdentity,
    getIdentities,
    attest,
    dummyIDV,
  };
};
