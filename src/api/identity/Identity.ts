import { PublicKey } from "@solana/web3.js";

export type SerializableAttestation = {
  idv: string;
  attestationData: string;
};

export type SerializableIdentity = {
  address: string;
  attestations: Array<SerializableAttestation>;
};

export class Attestation {
  /**
   * The identity validator that made the attestation
   */
  readonly idv: PublicKey;

  /**
   * The attestation hash made by the idv
   */
  readonly attestationData: string;

  constructor(idv: PublicKey, attestationData: string) {
    this.idv = idv;
    this.attestationData = attestationData;
  }

  serialize(): SerializableAttestation {
    return {
      idv: this.idv.toBase58(),
      attestationData: this.attestationData,
    };
  }

  static from(serializableAttestation: SerializableAttestation): Attestation {
    return new Attestation(
      new PublicKey(serializableAttestation.idv),
      serializableAttestation.attestationData
    );
  }
}

export class Identity {
  // The address of the user's identity on chain
  readonly address: PublicKey;
  readonly attestations: Array<Attestation>;

  constructor(address: PublicKey, attestations: Array<Attestation>) {
    this.address = address;
    this.attestations = attestations;
  }

  serialize(): SerializableIdentity {
    return {
      address: this.address.toBase58(),
      attestations: this.attestations.map((attestation) =>
        attestation.serialize()
      ),
    };
  }

  static from(serializableIdentity: SerializableIdentity): Identity {
    return new Identity(
      new PublicKey(serializableIdentity.address),
      serializableIdentity.attestations.map(Attestation.from)
    );
  }
}
