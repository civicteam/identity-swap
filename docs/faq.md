# On-Chain Identity FAQ

### Q: Are users' personal identifiable information (PII) stored on-chain?

No. The attestations stored on-chain are one-way hashes.
When using Civic's identity platform, the attestations are merkle-roots of a combination
of claims about the subject's identity.

### Q: Is it possible to use this without Civic?

In the demo: yes, by using the "Demo IdV".
In real-life: yes, anyone with a private key can be an IdV on Solana. The choice of which 
IdVs to trust is up to the creator of the pool.

### Q: Isn't specifying a single IdV key centralizing identity?

Yes, initially, however, separating the identity validator from the identity requester
(the swap program, in this case) allows for more advanced patterns, such as discovery
of IdVs in a registry, or specification of IdV parameters (IdVs must be registered in
a specific country), or potentially staking models, where IdVs earn tokens for
valid attestations, and lose staked tokens for attestations found to be invalid.

### Q: The IdV keys are on the front-end, isn't this insecure?

Yes - do not do this on mainnet! This is in place for the hackathon in order to ensure
simple creation of attested identity accounts without backend infrastructure (except the blockchain).

### Q: I can only have one identity account and one attestation, is this correct?

This is a proof-of-concept constraint added to simplify the UI for the hackathon.

### Q: Doesn't the concept of identity validation go against the "spirit" of DeFi?

Perhaps, this is a deep question. Some people see the absence of oversight from an authority
(i.e. a government) as an important factor in DeFi, some see the absence of control
from an authority (i.e. a bank) as the more important factor. Adding identity
definitely adds the potential for oversight.

The important factor is that this oversight is added in a secure, and self-sovereign way.
The thesis for this proof-of-concept is, essentially:
- If identity is needed, it should be self-sovereign (user in control of their data)
- Identity validation should not be the job of the service-provider (an organisation
directly gatekeeping access to a liquidity pool).
- In other words, the validation of identities needs to happen on-chain 

### Q: Is restricting access to on-chain resources the only use-case for on-chain identity?

No. it is probably the most pressing use-case, but others exist:

- Zero-knowledge Proofs: The blockchain can be a neutral orchestration layer for a
zero-knowledge proof execution, allowing identity holders to satisfy challenges
based on their identities without disclosing the information itself.  

- Escrow Services: Associating the transfer of goods in the off-chain world,
with payments made on-chain.

- Data Monetization: A user can attribute their online data to their on-chain identity,
in order to grant access to it to organisations interested in purchasing it for e.g. AI model training.

- Data Portability: Proof of ownership of personal information when passing it between
services off-chain, by tying it to on-chain identities.

- Internet of Things: An on-chain identity allows for simple decentralised interoperability between
devices that need to establish trust with each other, without relying on risky and complicated
key interchange. 
