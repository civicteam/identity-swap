# CivicSwap

CivicSwap is an Automatic Money Market (AMM) dApp running on the ultra-fast [Solana](https://solana.com/)
blockchain.

- [Getting started](#getting-started)
- [Testing](#testing)
  * [Unit tests](#unit-tests)
  * [Integration tests](#integration-tests)
  * [E2E tests](#e2e-tests)
- [Building a production version](#building-a-production-version)
- [Solana Scripts](#solana-scripts)
  * [Running a local solana cluster](#running-a-local-solana-cluster)
  * [Building the token-swap program](#building-the-token-swap-program)

### Getting started

Run:

    yarn
    yarn start

to start the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Using the App

1. Switch to testnet
2. Connect your wallet
3. Get some test tokens
4. Trade!

To get test tokens, you can use the [ops scripts](/etc/ops/README.md). 

## Testing

### Unit tests

Run the unit tests using:

    yarn test:unit
    
### Integration tests

Integration tests require a local solana cluster, with the token-swap program installed
(see [Solana Scripts](#solana-scripts) below).

Once you have the token-swap program built and deployed, run the integration tests with

    yarn test:integration
    
### E2E tests

E2E tests use [cypress.io](Cypress) to test the UI on testnet. Since Cypress
is a large dev dependency, it is a separate subproject at `test/e2e`. To run:

1. Start a server
```
yarn start
``` 
2. In a separate terminal:
```
cd test/e2e
yarn
yarn open
``` 

## Building a production version

    yarn build

Builds the app for production to the `build` folder.

## Solana Scripts

### Running a local solana cluster

Download the latest solana docker image using:
    
    yarn solana:localnet:update

Then start the solana localnet cluster

    yarn solana:localnet:up

### Building the token-swap program 

Install Rust, follow the instructions here https://rustup.rs/

Build the token-swap program

    yarn solana:build

Load the token-swap program onto the cluster using

    yarn solana:loadProgram

