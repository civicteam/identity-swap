# IdentitySwap: An On-Chain DeFi Identity Gateway

## Summary

IdentitySwap is an Automatic Money Market (AMM) dApp that 
demonstrates the concept of Decentralised Identity on the 
Solana SPL Token-Swap program. A user can interact with a 
liquidity pool only if they are in possession of a valid 
identity account, certified by a trusted identity validator. 

The association of an identity account with a transaction is stored on-chain.

## Solana Hackathon Submission

### Repos

The hackathon submission is made up of two repositories:

- [IdentitySwap](https://github.com/civicteam/identity-swap): A UI for the SPL Token-Swap and Identity programs.
- [civicteam/solana-program-library](https://github.com/civicteam/solana-program-library): A fork of the Solana SPL repository including the Identity program 

### Demo

See [here](https://civicteam.github.io/identity-swap/) for a demo and walkthrough.
See [here](https://civicteam.github.io/identity-swap/faq) for an FAQ on the project.

## Motivation

Defi services have traditionally been anonymous/pseudonymous, 
in that they do not require any user identification or KYC to use. 

While in many ways this is a good thing, it leads to services 
such as Uniswap being used for 
[money-laundering](https://www.forbes.com/sites/pawelkuskowski/2020/09/30/kucoin-hack-is-proof-that-money-laundering-risk-with-defi-is-rising/),
which, in turn, attracts the attention of 
[government regulators](https://www.newsbtc.com/all/uniswaps-uni-token-plunges-as-investors-fear-a-regulatory-crackdown/). 

Centralised exchanges that previously emphasised anonymity, 
such as [BitMEX](https://www.coindesk.com/bitmex-accelerates-identity-verification-kyc),
have recently integrated KYC to avoid the 
risk of being shut down by regulators. 

Adding KYC or Identity in any form to DEXes is a much more 
complicated matter, however. 

The nature of a DEX is that any attempts to impose a KYC wall 
can be circumvented by interacting directly with the smart contracts. 

And in the general case, on-chain identity is a concept that has 
not yet taken hold, but has been on the horizon for
[some years now](https://consensys.net/blockchain-use-cases/digital-identity). 

The “identity primitives” for decentralised identity, however, 
are relatively well established, and are being curated and 
developed by the
[Decentralised Identity Foundation](https://identity.foundation/).

## Submission

As a submission to the Solana Hackathon, we have added an identity layer to Solana,
in the form of "Identity Accounts".

### Identity Accounts

Identity Accounts represent a user’s Decentralised Identity (DID) on-chain,
and can therefore be passed as inputs into Solana programs in the same way
as other Solana accounts.

These accounts are managed by a new
[Identity Program](https://github.com/civicteam/solana-program-library/tree/master/identity/program),
which can respond to challenges from other Solana programs that have Identity requirements.

Identity Accounts contain "attestations", which are hashes of
off-chain Verifiable Credentials.
Verifiable Credentials (VCs) are collections of claims about a
user, or a "Subject", that have been signed by an Identity
Validator (IdV), and can therefore be presented to Identity
Requesters (IdRs) in order to meet KYC requirements, or other
identity challenges.

### Token-Swap Identity Gate

The SPL Token-Swap program has been adapted to require
a presentation of a valid identity when swapping via a liquidity pool.

In this case, the "Subject" is the user of the liquidity pool,
either someone wishing to swap, or deposit or withdraw liquidity.

The Identity Requester (IdR) is the pool itself.
This is an "on-chain”" requester, unlike the off-chain identity
requesters such as BitMEX or other centralised exchanges or blockchain services.

For the purposes of the hackathon, the Identity Validator is any public/private key pair.
The public key is passed as a parameter during initialization of the liquidity pool.

Note: users’ personal information is itself not stored on the blockchain
as part of this project. Transactions are associated with an Identity Account,
but the identity account by itself does not divulge the identity of the owner.
Providing this information, for example under audit from a regulator,
is out of scope for this project, and would be an audit requirement
of the identity issuer, i.e. the IdV.

## Developer Guide

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

1. Connect your wallet
2. Airdrop some test tokens
3. Register your identity
4. Swap!

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

## Building a production version

    yarn build

Builds the app for production to the `build` folder.

## Solana Scripts

### Running a local solana cluster

Download the latest solana docker image using:
    
    yarn solana:localnet:update

Then start the solana localnet cluster

    yarn solana:localnet:up

### Building the Solana programs 

Install Rust, follow the instructions here https://rustup.rs/

Build the token-swap program

    yarn solana:build swap
    
Build the identity program

    yarn solana:build identity

Load the token-swap program onto the cluster using

    yarn solana:loadProgram swap

Load the identity program onto the cluster using

    yarn solana:loadProgram identity
