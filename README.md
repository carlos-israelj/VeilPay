# VeilPay

Private USDCx transfers on Stacks using Zero-Knowledge proofs.

## Architecture

VeilPay uses a hybrid ZK architecture:
- **Client-side ZK proof generation** (Circom + snarkjs)
- **Off-chain proof verification** (Relayer)
- **On-chain commitment verification** (Clarity smart contract)

## Why this approach?

Clarity doesn't have native SNARK verification precompiles (BN254/BLS12-381), so we implement off-chain verification with a relayer. This introduces a trust assumption, but the design allows migration to on-chain verification when Stacks adds elliptic curve precompiles.

## Components

- **circuits/** - Circom ZK circuits for proof generation
- **contracts/** - Clarity smart contracts
- **relayer/** - Node.js service for off-chain proof verification
- **frontend/** - React application for user interaction
- **docs/** - Architecture and implementation documentation

## How it works

### Deposit Flow
1. User generates: `secret`, `nonce` (random)
2. User calculates: `commitment = poseidon(secret, amount, nonce)`
3. User calls: `deposit(commitment, amount)`
4. Off-chain indexer updates Merkle tree with new root

### Withdraw Flow
1. User generates ZK proof with Circom/snarkjs (in browser)
2. User sends proof + public data to Relayer
3. Relayer verifies proof with snarkjs
4. If valid, Relayer signs message and sends tx to Stacks
5. Contract verifies signature + nullifier + root → transfers USDCx

## Privacy Guarantees

✅ Complete ZK proof - Circom generates cryptographic proof
✅ Privacy guaranteed - Cannot correlate deposit ↔ withdraw
✅ On-chain security - Nullifiers prevent double-spending
✅ No trusted setup per user - Uses existing ceremony (Hermez/Iden3)

## Setup

Coming soon...

## Roadmap

- [ ] Core implementation (circuits, contracts, relayer, frontend)
- [ ] Decentralized relayer network
- [ ] Migration to on-chain verification when available
- [ ] Multi-token support beyond USDCx

## License

MIT
