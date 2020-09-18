import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Layout } from "buffer-layout";
import { Wallet } from "../api/wallet/Wallet";
import { getConnection } from "../api/connection";
import { ExtendedCluster } from "./types";

export const makeNewAccountInstruction = async (
  cluster: ExtendedCluster,
  wallet: Wallet,
  newAccountKey: PublicKey,
  layout: Layout,
  programId: PublicKey
): Promise<TransactionInstruction> => {
  const connection = getConnection(cluster);
  const balanceNeeded = await connection.getMinimumBalanceForRentExemption(
    layout.span
  );
  return SystemProgram.createAccount({
    fromPubkey: wallet.pubkey,
    newAccountPubkey: newAccountKey,
    lamports: balanceNeeded,
    space: layout.span,
    programId,
  });
};
