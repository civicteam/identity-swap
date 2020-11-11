# Demo

We are going to create a verified identity on-chain, and use it to swap
USDC to BTC (on devnet). 

1. Visit [identity.civic.finance](https://identity.civic.finance/)
and connect your [sollet.io](https://sollet.io) wallet.
    
    <video controls width="640">
        <source src="demo-connect-wallet-no-id-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user clicks Connect Wallet.
    </video>

    You will see an USDC/BTC liquidity pool.

    This pool has been created using the
[Identity-gated Token-Swap program](https://github.com/civicteam/solana-program-library/tree/master/token-swap).

    When creating the pool, the creator specified an Identity Validator (IdV)
public key.

2. Airdrop some devnet USDC into your wallet

    <video controls width="640">
        <source src="demo-airdrop-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user clicks the "airdrop" button and approves the transactions.
    </video>

3. Click the Swap button and attempt to swap USDC for BTC

    <video controls width="640">
        <source src="demo-swap-no-id-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user attempts a swap with no Identity, and fails.
    </video>

    The liquidity pool on-chain program _rejects_ your transaction, because
    you do not have an identity signed by the identity validator. 

4. Let's create an identity. There are two options. The first, using the demo IdV.

    <video controls width="640">
        <source src="demo-create-id-demo-idv-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user creates an identity using the "Demo IdV". 
    </video>

    This simulates a user sending information directly to an identity validator,
    who checks it, and stores a hash of the information on-chain. 

    Note: In this demo, the IdV key is stored on the front-end, and the hash is a simple
    unsalted SHA-256. In a production system, the user would choose from a 
    set of acceptable IdVs, and establish a session with them, and the attestation would
    happen on the IdV back-end. Alternatively, the user could reuse a pre-attested identity
    (see Civic below).

5. The other alternative, is to use Civic Secure Identity.

    <video controls width="640">
        <source src="demo-create-id-civic-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user creates an identity by scanning a Civic QR code.
    </video>

    Scan the QR code with the [Civic Wallet](https://civic.com). Civic returns a
    reusable, verified credential to the client app, which can then be stored
    on-chain as above.

    Note: In this demo, the Civic credential is attested onto Solana on the front-end,
    as with step 4. In a production system, the Civic IdV would attest on its back-end,
    as it currently does on other blockchains.

6. Attempt a swap with the new identity

    <video controls width="640">
        <source src="demo-swap-with-id-720.m4v">
        Sorry, your browser doesn't support embedded videos.
        The user successfully swaps, using their identity.
    </video>

    Now that the identity is created, the swap can go through. The Token-Swap
    program identifies that the identity has an attestation registered by the
    chosen IdV, and allows the transaction.
