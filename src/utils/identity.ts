import { EmailClaim } from "../api/civic";

export const sha256 = async (message: string): Promise<Uint8Array> => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  return new Uint8Array(hashBuffer);
};

export const fromHex = (hexString: string): Uint8Array => {
  const bytes = hexString.match(/.{1,2}/g);

  if (!bytes)
    throw new Error(`Error converting hex string to Uint8Array: ${hexString}`);

  return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
};

export const toHex = (bytes: Uint8Array): string =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export const constructEmail = (
  claim: EmailClaim | undefined
): string | undefined =>
  claim &&
  `${claim.contact.email.username}@${claim.contact.email.domain.name}.${claim.contact.email.domain.tld}`;
