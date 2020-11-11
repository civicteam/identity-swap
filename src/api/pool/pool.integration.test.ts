import { PublicKey } from "@solana/web3.js";
import { difference } from "ramda";
import { Decimal } from "decimal.js";
import * as WalletAPI from "../wallet/";
import { WalletType } from "../wallet/";
import { Wallet } from "../wallet/Wallet";
import { TokenAccount } from "../token/TokenAccount";
import { createToken } from "../../../test/utils/token";
import { airdropTo } from "../../../test/utils/account";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { APIFactory as TokenAPIFactory, API as TokenAPI } from "../token";
import {
  APIFactory as IdentityAPIFactory,
  API as IdentityAPI,
} from "../identity";
import { Token } from "../token/Token";
import { toDecimal } from "../../utils/amount";
import { Identity } from "../identity/Identity";
import { sha256 } from "../../utils/identity";
import { Pool } from "./Pool";
import {
  API as PoolAPI,
  APIFactory as PoolAPIFactory,
  DepositParameters,
  SwapParameters,
  WithdrawalParameters,
} from "./index";

// Increase timeout for tests that send transactions
jest.setTimeout(240000);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./pool.config.json");

const localnetPoolConfig = config.localnet;

// The initial pool token amount in a pool,
// (minted to the pool creator) is hard-coded inside
// node_modules/solana-program-library/token-swap/program/src/curve.rs
// as INITIAL_SWAP_POOL_AMOUNT
const INITIAL_POOL_TOKEN_SUPPLY = 1_000_000_000;
const EXPECTED_POOL_RATE = 2;
const FEE_NUMERATOR = 1;
const FEE_DENOMINATOR = 4;
const INITIAL_TOKEN_A = 1000;

const CLUSTER: ExtendedCluster = "localnet";
let API: PoolAPI;
let tokenAPI: TokenAPI;
let identityAPI: IdentityAPI;

const updateTokenAccount = (tokenAccount: TokenAccount) =>
  tokenAPI.tokenAccountInfo(tokenAccount.address) as Promise<TokenAccount>;

const expectPoolAmounts = async (
  pool: Pool,
  tokenAAmount: number,
  tokenBAmount: number,
  poolTokenAmount: number
): Promise<void> => {
  const updatedPool = await API.getPool(pool.address);

  console.log(updatedPool.toString());

  // the liquidity of the pool is defined as equal to the tokenA amount
  expect(updatedPool.getLiquidity().toNumber()).toEqual(tokenAAmount);
  expect(updatedPool.tokenA.balance.toNumber()).toEqual(tokenAAmount);
  expect(updatedPool.tokenB.balance.toNumber()).toEqual(tokenBAmount);
  expect(updatedPool.poolToken.supply.toNumber()).toEqual(poolTokenAmount);

  const impliedRate = tokenBAmount / tokenAAmount;
  expect(updatedPool.simpleRate().toNumber()).toEqual(impliedRate);
};

const expectTokenAccountBalance = async (
  tokenAccount: TokenAccount,
  expectedBalance: number | Decimal
) => {
  const updatedTokenAccount = await updateTokenAccount(tokenAccount);

  expect(updatedTokenAccount.balance).toEqual(toDecimal(expectedBalance));
};

describe("api/pool integration test", () => {
  let pool: Pool;
  let loadedPools: Array<Pool>;

  let wallet: Wallet;
  let donorAccountA: TokenAccount;
  let donorAccountB: TokenAccount;

  let identity: Identity;

  let walletTokenAccounts: Array<TokenAccount>;

  const createIdentity = async () => {
    identity = await identityAPI.createIdentity();
  };

  const matchesToken = (token: Token) => (tokenAccount: TokenAccount) =>
    tokenAccount.mint.equals(token);

  const updateTokenAccounts = async () => {
    walletTokenAccounts = await tokenAPI.getAccountsForWallet();
  };

  const getTokenAccount = async (token: Token) => {
    await updateTokenAccounts();

    return walletTokenAccounts.filter(matchesToken(token))[0];
  };

  const getNewTokenAccount = async (token: Token) => {
    const oldTokenAccounts = walletTokenAccounts;
    await updateTokenAccounts();

    const newTokenAccounts = difference(walletTokenAccounts, oldTokenAccounts);

    return newTokenAccounts.filter(matchesToken(token))[0];
  };

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);
    API = PoolAPIFactory(CLUSTER);
    tokenAPI = TokenAPIFactory(CLUSTER);
    identityAPI = IdentityAPIFactory(CLUSTER);

    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);

    // create the identity account that will be used for swaps.
    // not yet attested to
    await createIdentity();
  });

  describe("createPool", () => {
    beforeAll(async () => {
      console.log("Creating Tokens");
      [, donorAccountA] = await createToken({ sendTokens: true });
      [, donorAccountB] = await createToken({ sendTokens: true });

      console.log("Created tokens:");
      console.log(donorAccountA.toString());
      console.log(donorAccountB.toString());
    });

    it("should create a pool", async () => {
      pool = await API.createPool({
        donorAccountA,
        donorAccountB,
        feeNumerator: FEE_NUMERATOR,
        feeDenominator: FEE_DENOMINATOR,
        tokenAAmount: INITIAL_TOKEN_A,
        tokenBAmount: INITIAL_TOKEN_A * EXPECTED_POOL_RATE,
      });

      console.log(pool.toString());

      expect(pool.getLiquidity().toNumber()).toEqual(INITIAL_TOKEN_A);

      // the wallet was awarded pool tokens
      const poolTokenAccount = await getTokenAccount(pool.poolToken);
      expect(poolTokenAccount.balance.toNumber()).toEqual(
        INITIAL_POOL_TOKEN_SUPPLY
      );
    });
  });

  describe("getPools", () => {
    it("should load all pools", async () => {
      loadedPools = await API.getPools();

      expect(loadedPools).toHaveLength(1);
      expect(loadedPools[0]).toMatchObject({
        address: new PublicKey(localnetPoolConfig.pools[0]),
      });
    });
  });

  describe("with loaded pools", () => {
    let loadedPool: Pool;

    beforeAll(async () => {
      loadedPool = loadedPools[0];
    });

    it("should get the liquidity of a pool", () => {
      const liquidity = loadedPool.getLiquidity();

      expect(liquidity.toNumber()).toEqual(INITIAL_TOKEN_A);
    });

    it("should get the rate of a pool", () => {
      const rate = loadedPool.simpleRate();

      expect(rate.toNumber()).toEqual(EXPECTED_POOL_RATE);
    });

    it("should generate a string summary", () => {
      const summary = loadedPool.toString();

      // these values are correct for the balances as long as the
      // rate is a simple Constant Product Function i.e. Token B / Token A
      expect(summary).toMatch("Balance: " + INITIAL_TOKEN_A);
      expect(summary).toMatch(
        "Balance: " + INITIAL_TOKEN_A * EXPECTED_POOL_RATE
      );
    });
  });

  describe("operations", () => {
    let tokenAAmountInPool = INITIAL_TOKEN_A;
    let poolTokenAccount: TokenAccount;

    let poolTokenSupply = INITIAL_POOL_TOKEN_SUPPLY;

    beforeEach(async () => {
      // update the donor accounts in order to get the latest balances
      donorAccountA = await updateTokenAccount(donorAccountA);
      donorAccountB = await updateTokenAccount(donorAccountB);

      poolTokenAccount = await getTokenAccount(pool.poolToken);
    });

    describe("deposit", () => {
      const amountToDeposit = 10; // in terms of token A
      const expectedAddedPoolTokens = 10_000_000;

      it("should grant the wallet pool tokens", async () => {
        const depositParameters: DepositParameters = {
          fromAAccount: donorAccountA,
          fromAAmount: amountToDeposit,
          fromBAccount: donorAccountB,
          poolTokenAccount,
          pool,
        };

        await API.deposit(depositParameters);

        // the amount of liquidity has gone up as more tokenA has been added
        tokenAAmountInPool += amountToDeposit;
        poolTokenSupply += expectedAddedPoolTokens;
        await expectPoolAmounts(
          pool,
          tokenAAmountInPool,
          tokenAAmountInPool * EXPECTED_POOL_RATE,
          poolTokenSupply
        );

        // the user received the same amount of pool tokens as the amount they deposited (in token A)
        // since we are sending all transactions from the wallet, the pool tokens are all going to the
        // same account, the pool token account balance matches the liquidity at all times
        poolTokenAccount = await updateTokenAccount(poolTokenAccount);
        expect(poolTokenAccount.balance.toNumber()).toEqual(poolTokenSupply);
      });

      it("should create a new pool token account if none is passed in", async () => {
        const depositParameters: DepositParameters = {
          fromAAccount: donorAccountA,
          fromAAmount: amountToDeposit,
          fromBAccount: donorAccountB,
          pool,
        };

        await API.deposit(depositParameters);

        // the amount of liquidity has gone up as more tokenA has been added
        tokenAAmountInPool = tokenAAmountInPool + amountToDeposit;
        poolTokenSupply += expectedAddedPoolTokens;
        await expectPoolAmounts(
          pool,
          tokenAAmountInPool,
          tokenAAmountInPool * EXPECTED_POOL_RATE,
          poolTokenSupply
        );

        const newPoolTokenAccount = await getNewTokenAccount(pool.poolToken);
        expect(newPoolTokenAccount.balance.toNumber()).toEqual(
          expectedAddedPoolTokens
        );
      });
    });

    describe("withdraw", () => {
      const amountToWithdraw = 10; // in terms of token A
      const expectedReducedPoolTokens = 10_000_000;

      it("should exchange the pool tokens for A & B", async () => {
        const withdrawalParameters: WithdrawalParameters = {
          fromPoolTokenAccount: poolTokenAccount,
          fromPoolTokenAmount: pool.getPoolTokenValueOfTokenAAmount(
            amountToWithdraw
          ),
          toAAccount: donorAccountA,
          toBAccount: donorAccountB,
          pool,
        };

        await API.withdraw(withdrawalParameters);

        // the amount of liquidity has gone down as tokenA has been removed
        tokenAAmountInPool -= amountToWithdraw;
        poolTokenSupply -= expectedReducedPoolTokens;
        await expectPoolAmounts(
          pool,
          tokenAAmountInPool,
          tokenAAmountInPool * EXPECTED_POOL_RATE,
          poolTokenSupply
        );

        // the amount of pool tokens has also gone down
        const expectedPoolTokenBalance = poolTokenAccount.balance.minus(
          pool.getPoolTokenValueOfTokenAAmount(amountToWithdraw)
        );
        poolTokenAccount = await updateTokenAccount(poolTokenAccount);
        expect(poolTokenAccount.balance).toEqual(expectedPoolTokenBalance);
      });
    });

    describe("swap", () => {
      const amountToSwap = 5; // in terms of token A
      let expectedTokenBLiquidity: number;

      beforeAll(() => {
        expectedTokenBLiquidity = tokenAAmountInPool * EXPECTED_POOL_RATE;
      });

      it("should fail to swap, as the identity is not verified", async () => {
        const swapParameters: SwapParameters = {
          fromAccount: donorAccountA,
          fromAmount: amountToSwap,
          pool,
          toAccount: donorAccountB,
          identity,
        };

        const shouldFail = API.swap(swapParameters);

        // error 0x18 = "The provided identity was not validated by the pool's identity validator"
        return expect(shouldFail).rejects.toThrow(/0x18/);
      });

      it("should create a swap transaction after verifying the identity - A->B", async () => {
        const attestation = await sha256("any attestation");
        await identityAPI.attest(identity, attestation);
        identity = await identityAPI.getIdentity(identity.address);

        const expectedTokenBAmount = 6; // (new invariant / new A) - fees

        const swapParameters: SwapParameters = {
          fromAccount: donorAccountA,
          fromAmount: amountToSwap,
          pool,
          toAccount: donorAccountB,
          identity,
        };

        await API.swap(swapParameters);

        // the amount of liquidity has gone up as more tokenA has been added
        tokenAAmountInPool = tokenAAmountInPool + amountToSwap;
        expectedTokenBLiquidity -= expectedTokenBAmount;
        await expectPoolAmounts(
          pool,
          tokenAAmountInPool,
          expectedTokenBLiquidity,
          poolTokenSupply
        );

        const expectedTokenABalance = donorAccountA.balance.minus(amountToSwap);
        const expectedTokenBBalance = donorAccountB.balance.plus(
          expectedTokenBAmount
        );
        await expectTokenAccountBalance(donorAccountA, expectedTokenABalance);
        await expectTokenAccountBalance(donorAccountB, expectedTokenBBalance);
      });

      it("should create a reverse swap transaction - B->A", async () => {
        const expectedTokenAAmount = 2; // (new invariant / new B ) - fees

        const swapParameters: SwapParameters = {
          fromAccount: donorAccountB,
          fromAmount: amountToSwap,
          pool,
          toAccount: donorAccountA,
          identity,
        };

        await API.swap(swapParameters);

        // the amount of liquidity has gone down as tokenA has been removed
        tokenAAmountInPool = tokenAAmountInPool - expectedTokenAAmount;
        expectedTokenBLiquidity += amountToSwap;
        await expectPoolAmounts(
          pool,
          tokenAAmountInPool,
          expectedTokenBLiquidity,
          poolTokenSupply
        );

        const expectedTokenABalance = donorAccountA.balance.plus(
          expectedTokenAAmount
        );
        const expectedTokenBBalance = donorAccountB.balance.minus(amountToSwap);
        await expectTokenAccountBalance(donorAccountA, expectedTokenABalance);
        await expectTokenAccountBalance(donorAccountB, expectedTokenBBalance);
      });

      it("should trigger an update event", async () => {
        // set up a swap
        const swapParameters: SwapParameters = {
          fromAccount: donorAccountA,
          fromAmount: amountToSwap,
          pool,
          toAccount: donorAccountB,
          identity,
        };

        // set up a listener for pool changes
        let poolChangedResolved: { (value?: Pool): void };
        const poolChangedPromise = new Promise<Pool>(
          (resolve) => (poolChangedResolved = resolve)
        );
        const listener = (pool: Pool) => poolChangedResolved(pool);

        API.listenToPoolChanges([pool], listener);

        // trigger the swap
        await API.swap(swapParameters);

        // wait for the update event
        const updatedPool = await poolChangedPromise;

        // equality is preserved
        expect(updatedPool).toBeEqualByMethodTo(pool);

        // history is preserved
        expect(updatedPool.getPrevious()).toEqual(pool);

        // the amount of liquidity has gone up as more tokenA has been added
        tokenAAmountInPool = tokenAAmountInPool + amountToSwap;
        const expectedTokenBAmount = 6; // (new invariant / new A) - fees
        expectedTokenBLiquidity -= expectedTokenBAmount;
        await expectPoolAmounts(
          updatedPool,
          tokenAAmountInPool,
          expectedTokenBLiquidity,
          poolTokenSupply
        );
      });

      it("should create a new To account if none is passed in", async () => {
        const expectedTokenBAmount = 6; // (new invariant / new A) - fees

        const swapParameters: SwapParameters = {
          fromAccount: donorAccountA,
          fromAmount: amountToSwap,
          pool,
          identity,
        };

        await API.swap(swapParameters);

        const newToAccount = await getNewTokenAccount(pool.tokenB.mint);

        await expectTokenAccountBalance(newToAccount, expectedTokenBAmount);
      });
    });
  });
});
