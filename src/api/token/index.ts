import assert from "assert";
import { Account, PublicKey } from "@solana/web3.js";
import { Token as SPLToken } from "@solana/spl-token";
import { find, path, propEq } from "ramda";
import BN from "bn.js";
import { Wallet } from "../wallet/Wallet";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { AccountLayout, MintLayout } from "../../utils/layouts";
import { makeNewAccountInstruction } from "../../utils/transaction";
import { makeTransaction, sendTransaction } from "../wallet";
import { TokenAccount } from "./TokenAccount";
import { Token } from "./Token";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokenConfig = require("./token.config.json");

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

type TransferParameters = {
  wallet: Wallet;
  source: TokenAccount;
  destination: TokenAccount;
  amount: number;
};

type TokenConfig = {
  mintAddress: string;
  tokenName: string;
  tokenSymbol: string;
};

interface API {
  getTokens: () => Promise<Token[]>;
  tokenInfo: (mint: PublicKey) => Promise<Token>;
  tokenAccountInfo: (account: PublicKey) => Promise<TokenAccount | null>;
  getAccountsForToken: (
    wallet: Wallet,
    token: Token
  ) => Promise<TokenAccount[]>;
  createToken: (wallet: Wallet, mintAuthority?: PublicKey) => Promise<Token>;
  createAccountForToken: (
    wallet: Wallet,
    token: Token,
    owner?: PublicKey
  ) => Promise<TokenAccount>;
  mintTo: (
    wallet: Wallet,
    recipient: TokenAccount,
    tokenAmount: number
  ) => Promise<string>;
  transfer: (parameters: TransferParameters) => Promise<string>;
  approve: (
    wallet: Wallet,
    sourceAccount: TokenAccount,
    delegate: PublicKey,
    amount: number
  ) => Promise<string>;
}

export const APIFactory = (cluster: ExtendedCluster): API => {
  const connection = getConnection(cluster);
  const payer = new Account();

  /**
   * Given a token address, check the config to see if the name and symbol are known for this token
   * @param address
   */
  const getConfigForToken = (address: PublicKey): TokenConfig | null => {
    const clusterConfig = tokenConfig[cluster];

    if (!clusterConfig) return null;

    const configForToken = find(
      propEq("mintAddress", address.toBase58()),
      clusterConfig
    );

    if (!configForToken) return null;

    return configForToken as TokenConfig;
  };

  /**
   * The output from the solana web3 library when parsing the on-chain data
   * for an spl token account
   */
  type ParsedTokenAccountInfo = {
    mint: string;
    tokenAmount: { amount: string; decimals: number; uiAmount: number };
  };

  /**
   * Given a mint address, look up the blockchain to find its token information
   * @param mint
   */
  const tokenInfo = async (mint: PublicKey): Promise<Token> => {
    const token = new SPLToken(connection, mint, TOKEN_PROGRAM_ID, payer);

    const mintInfo = await token.getMintInfo();

    const configForToken = getConfigForToken(mint);

    return new Token(
      mint,
      mintInfo.decimals,
      mintInfo.mintAuthority || undefined, // maps a null mintAuthority to undefined
      configForToken?.tokenName,
      configForToken?.tokenSymbol
    );
  };

  const getTokens = async (): Promise<Token[]> => {
    const clusterConfig = tokenConfig[cluster];

    if (!clusterConfig) return [];

    const tokenPromises = clusterConfig.map((tokenConfig: TokenConfig) =>
      tokenInfo(new PublicKey(tokenConfig.mintAddress))
    );

    return Promise.all(tokenPromises);
  };

  /**
   * Given a token account address, look up its mint and balance
   * @param account
   */
  const tokenAccountInfo = async (
    account: PublicKey
  ): Promise<TokenAccount | null> => {
    const getParsedAccountInfoResult = await connection.getParsedAccountInfo(
      account
    );
    const parsedInfo: ParsedTokenAccountInfo | undefined = path(
      ["value", "data", "parsed", "info"],
      getParsedAccountInfoResult
    );

    // this account does not appear to be a token account
    if (!parsedInfo) return null;

    const mintTokenInfo = await tokenInfo(new PublicKey(parsedInfo.mint));

    return new TokenAccount(
      mintTokenInfo,
      account,
      new BN(parsedInfo.tokenAmount.amount).toNumber()
    );
  };

  // Stub API TODO
  const getAccountsForToken = async (
    wallet: Wallet,
    token: Token
  ): Promise<TokenAccount[]> => {
    console.log("Finding the wallet's accounts for the token", {
      wallet: { address: wallet.pubkey.toBase58() },
      token: {
        address: token.address.toBase58(),
      },
    });
    return [
      new TokenAccount(token, new PublicKey(123), 100),
      new TokenAccount(token, new PublicKey(123), 200),
    ];
  };

  const createToken = async (wallet: Wallet, mintAuthority?: PublicKey) => {
    const mintAccount = new Account();
    const createAccountInstruction = await makeNewAccountInstruction(
      cluster,
      wallet,
      mintAccount.publicKey,
      MintLayout,
      TOKEN_PROGRAM_ID
    );

    const decimals = 2;
    // the mint authority (who can create tokens) defaults to the wallet.
    // For Pools, it should be set to the pool token authority
    const mintAuthorityKey = mintAuthority || wallet.pubkey;
    const initMintInstruction = SPLToken.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      decimals,
      mintAuthorityKey,
      null
    );

    const transaction = await makeTransaction(
      [createAccountInstruction, initMintInstruction],
      [mintAccount]
    );

    console.log("creating token");
    await sendTransaction(transaction);

    return new Token(mintAccount.publicKey, decimals, wallet.pubkey);
  };

  const createAccountForToken = async (
    wallet: Wallet,
    token: Token,
    owner?: PublicKey // defaults to the wallet - used to create accounts owned by a Pool
  ): Promise<TokenAccount> => {
    console.log("Creating an account on the wallet for the token", {
      wallet: { address: wallet.pubkey.toBase58() },
      token: {
        address: token.address.toBase58(),
      },
    });

    // ensure the token actually exists before going any further
    const checkToken = await tokenInfo(token.address);
    console.log("Creating an account for token", checkToken);

    // if no recipient is set
    const ownerKey = owner || wallet.pubkey;

    // this is the new token account.
    // It will be assigned to the current wallet in the initAccount instruction
    const newAccount = new Account();
    console.log("New token account owner", {
      address: newAccount.publicKey.toBase58(),
      owner: ownerKey.toBase58(),
    });

    // Instruction to create a new Solana account
    const createAccountInstruction = await makeNewAccountInstruction(
      cluster,
      wallet,
      newAccount.publicKey,
      AccountLayout,
      TOKEN_PROGRAM_ID
    );

    // Instruction to assign the new account to the token program
    const initTokenAccountInstruction = SPLToken.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      token.address,
      newAccount.publicKey,
      ownerKey
    );

    const transaction = await makeTransaction(
      [createAccountInstruction, initTokenAccountInstruction],
      [newAccount]
    );

    await sendTransaction(transaction);

    return new TokenAccount(token, newAccount.publicKey, 0);
  };

  const mintTo = async (
    wallet: Wallet,
    recipient: TokenAccount,
    tokenAmount: number
  ): Promise<string> => {
    const token = recipient.mint;

    assert(
      token.mintAuthority && wallet.pubkey.equals(token.mintAuthority),
      `The current wallet does not have the authority to mint tokens for mint ${token}`
    );

    const mintToInstruction = SPLToken.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      token.address,
      recipient.address,
      wallet.pubkey,
      [],
      tokenAmount
    );

    const transaction = await makeTransaction([mintToInstruction]);

    return sendTransaction(transaction);
  };

  const approve = async (
    wallet: Wallet,
    sourceAccount: TokenAccount,
    delegate: PublicKey,
    amount: number
  ): Promise<string> => {
    const approveInstruction = SPLToken.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount.address,
      delegate,
      wallet.pubkey,
      [],
      amount
    );

    const transaction = await makeTransaction([approveInstruction]);

    return sendTransaction(transaction);
  };

  const transfer = async (parameters: TransferParameters): Promise<string> => {
    const transferInstruction = SPLToken.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      parameters.source.address,
      parameters.destination.address,
      parameters.wallet.pubkey,
      [],
      parameters.amount
    );

    const transaction = await makeTransaction([transferInstruction]);

    return sendTransaction(transaction);
  };

  return {
    getTokens,
    tokenInfo,
    tokenAccountInfo,
    getAccountsForToken,
    createAccountForToken,
    createToken,
    mintTo,
    transfer,
    approve,
  };
};
