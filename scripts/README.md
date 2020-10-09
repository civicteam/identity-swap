# Scripts

## How to create a pool (from scratch):

1. Create new tokens (skip if you already have tokens you want to mint from)

    yarn script scripts/createToken.ts  # store address as token A
    yarn script scripts/createToken.ts  # store address as token B

2. Mint the initial pool balances for the two new tokens

    # store token account address as donor account A
    yarn script scripts/mint.ts -t <Address or symbol of token A> --amount <amount of token A>

    # store token account address as donor account B
    yarn script scripts/mint.ts -t <Address or symbol of token B> --amount <amount of token B>

3. Create the pool

    yarn script scripts/createPool -a <address of donor account A> -b <address of donor account B>

## Recommended Minting amounts

When creating test pools, here are the recommended amounts to mint, to pools with "realistic" rates

    # USDC/CVC pool (1 USDC = 20 CVC)
    yarn script scripts/mint.ts -t USDC --amount 100000
    yarn script scripts/mint.ts -t CVC --amount 2000000

    # USDC/BTC pool (1 USDC = 0.0001 BTC)
    yarn script scripts/mint.ts -t USDC --amount 10000000
    yarn script scripts/mint.ts -t BTC --amount 1000000000  # BTC has 8 decimal places

    # USDC/ETH pool (1 USDC = 0.0025 ETH)
    yarn script scripts/mint.ts -t USDC --amount 100
    yarn script scripts/mint.ts -t ETH --amount 2500000000000000

    # USDC/SOL pool (1 USDC = 0.4 SOL)
    yarn script scripts/mint.ts -t USDC --amount 1000000   # 10000 USD
    # Note - SOL must be wrapped, it cannot be minted.
