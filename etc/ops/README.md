# Operations

This directory contains scripts that manipulate the chain in some way,
e.g. create new pools or tokens, load programs.

To run a script, pass its name to `yarn op`

e.g.

    yarn op createToken <arguments>

## Signing operations

The scripts use a local wallet private key defined in .env.local.

To mint some of the built-in test tokens, copy .env.test to .env.local

To add your own wallet:

1. Create a new key using the solana-keygen command

    solana-keygen new --outfile ./id.json

2. Copy .env to .env.local
3. Edit the line `REACT_APP_LOCAL_WALLET_PRIVATE_KEY="[]"`
4. Replace "..." with the contents of id.json.

NOTE: Do not use the test wallet, stored in .env.test, on mainnet, or store your own funds in it.
This wallet is shared, and should be used on testnet only.

## How to create a pool (from scratch):

1. Create new tokens (skip if you already have tokens you want to mint from)

    yarn op createToken  # store address as token A
    yarn op createToken  # store address as token B

2. Mint the initial pool balances for the two new tokens

```
# store token account address as donor account A
yarn op mint -t <Address or symbol of token A> --amount <amount of token A>

# store token account address as donor account B
yarn op mint -t <Address or symbol of token B> --amount <amount of token B>
```

3. Create the pool
```
yarn op createPool -a <address of donor account A> -b <address of donor account B>
```
## Recommended Minting amounts

When creating test pools, here are the recommended amounts to mint,
to create pools with "realistic" rates.

    # USDC/CVC pool (1 USDC = 20 CVC)
    yarn op mint -t USDC --amount 100000
    yarn op mint -t CVC --amount 2000000

    # USDC/BTC pool (1 USDC = 0.0001 BTC)
    yarn op mint -t USDC --amount 10000000
    yarn op mint -t BTC --amount 1000000000  # BTC has 8 decimal places

    # USDC/ETH pool (1 USDC = 0.0025 ETH)
    yarn op mint -t USDC --amount 100
    yarn op mint -t ETH --amount 2500000000000000

    # USDC/SOL pool (1 USDC = 0.4 SOL)
    yarn op mint -t USDC --amount 1000000   # 10000 USD
    # Note - SOL must be wrapped, it cannot be minted.
