import { PublicKey } from "@solana/web3.js";
import * as WalletAPI from "../wallet/";
import { WalletType } from "../wallet/";
import { Wallet } from "../wallet/Wallet";
import { TokenAccount } from "../token/TokenAccount";
import { createToken } from "../../../test/utils/token";
import { airdropTo } from "../../../test/utils/account";
import { getConnection } from "../connection";
import { ExtendedCluster } from "../../utils/types";
import { sleep } from "../../utils/sleep";
import { Pool } from "./Pool";
import { APIFactory, SwapParameters } from "./index";

// Increase timeout for tests that send transactions
jest.setTimeout(240000);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require("./pool.config.json");

const localnetPoolConfig = config.localnet;

// These depends on how the pool in config.localnet.pools[0] was initialised
// In particular, how many tokens of A and B were added.
const EXPECTED_POOL_LIQUIDITY = 1000;
const EXPECTED_POOL_RATE = 2;

const CLUSTER: ExtendedCluster = "localnet";

const API = APIFactory(CLUSTER);

describe("api/pool integration test", () => {
  let pool: Pool;

  let wallet: Wallet;
  let donorAccountA: TokenAccount;
  let donorAccountB: TokenAccount;

  beforeAll(async () => {
    wallet = await WalletAPI.connect(CLUSTER, WalletType.LOCAL);

    console.log("Airdropping to the wallet");
    // airdrop multiple times so as not to run out of funds.
    // single large airdrops appear to fail
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
    await airdropTo(getConnection(CLUSTER), wallet.pubkey);
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
        feeNumerator: 1,
        feeDenominator: 4,
        wallet,
        tokenAAmount: EXPECTED_POOL_LIQUIDITY,
        tokenBAmount: EXPECTED_POOL_LIQUIDITY * EXPECTED_POOL_RATE,
      });

      console.log("pool");
      console.log(pool.toString());

      expect(pool.getLiquidity()).toEqual(EXPECTED_POOL_LIQUIDITY);
    });
  });

  describe("getPools", () => {
    it("should load all pools", async () => {
      const pools = await API.getPools();

      expect(pools).toHaveLength(1);
      expect(pools[0]).toMatchObject({
        address: new PublicKey(localnetPoolConfig.pools[0]),
      });
    });
  });

  describe("swap", () => {
    let poolLiquidity = EXPECTED_POOL_LIQUIDITY;
    const amountToSwap = 5;

    it("should create a swap transaction - A->B", async () => {
      const swapParameters: SwapParameters = {
        fromAccount: donorAccountA,
        fromAmount: amountToSwap,
        pool,
        toAccount: donorAccountB,
        wallet,
      };

      await API.swap(swapParameters);

      await sleep(30000);

      const updatedPool = await API.getPool(pool.address);
      poolLiquidity = poolLiquidity + amountToSwap;
      expect(updatedPool.getLiquidity()).toEqual(poolLiquidity);
    });

    it("should create a reverse swap transaction - B->A", async () => {
      const amountToSwapInB = amountToSwap * pool.getRate();
      const swapParameters: SwapParameters = {
        fromAccount: donorAccountB,
        fromAmount: amountToSwapInB,
        pool,
        toAccount: donorAccountA,
        wallet,
      };

      await API.swap(swapParameters);

      await sleep(30000);

      const updatedPool = await API.getPool(pool.address);
      poolLiquidity = poolLiquidity - amountToSwap;
      expect(updatedPool.getLiquidity()).toEqual(poolLiquidity);
    });
  });
});

describe("with loaded pools", () => {
  let pools: Pool[];
  let pool: Pool;

  beforeAll(async () => {
    pools = await API.getPools();
    pool = pools[0];
  });

  it("should get the liquidity of a pool", () => {
    const liquidity = pool.getLiquidity();

    expect(liquidity).toEqual(EXPECTED_POOL_LIQUIDITY);
  });

  it("should get the rate of a pool", () => {
    const liquidity = pool.getRate();

    expect(liquidity).toEqual(EXPECTED_POOL_RATE);
  });

  it("should generate a string summary", () => {
    const summary = pool.toString();

    // these values are correct for the balances as long as the
    // rate is a simple Constant Product Function i.e. Token B / Token A
    expect(summary).toMatch("Balance: " + EXPECTED_POOL_LIQUIDITY);
    expect(summary).toMatch(
      "Balance: " + EXPECTED_POOL_LIQUIDITY * EXPECTED_POOL_RATE
    );
  });
});
