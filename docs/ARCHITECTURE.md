# VeilPay Architecture

## Overview

VeilPay implements private payments on Stacks using a hybrid Zero-Knowledge proof architecture. Since Clarity doesn't support native SNARK verification (no BN254/BLS12-381 precompiles), we use off-chain proof generation and verification with on-chain commitment tracking.

## System Components

```
┌──────────────────────────────────────────────────────────────────────┐
│                        HYBRID ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    CLIENT (Browser/App)                      │   │
│   │                                                              │   │
│   │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │   │
│   │  │   Circom     │───▶│   snarkjs    │───▶│    Proof     │   │   │
│   │  │   Circuit    │    │   (WASM)     │    │  Generation  │   │   │
│   │  └──────────────┘    └──────────────┘    └──────────────┘   │   │
│   │         │                                       │            │   │
│   │         ▼                                       ▼            │   │
│   │  commitment = poseidon(secret, amount, nonce)   proof.json   │   │
│   │  nullifier = poseidon(secret, nonce)                         │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    RELAYER (Optional)                        │   │
│   │                                                              │   │
│   │  • Verifies proof off-chain with snarkjs                    │   │
│   │  • If valid → Signs the withdrawal request                  │   │
│   │  • Can charge fee for the service                           │   │
│   │  • Maintains Merkle tree of commitments                     │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                 CLARITY CONTRACT (On-chain)                  │   │
│   │                                                              │   │
│   │  • Verifies relayer signature (secp256k1-verify)            │   │
│   │  • Verifies nullifier not used (map lookup)                 │   │
│   │  • Verifies commitment exists (merkle root check)           │   │
│   │  • Transfers USDCx to recipient                             │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Flow Details

### Deposit Flow

1. **Client-side commitment generation**
   - User generates random `secret` and `nonce`
   - Calculates `commitment = poseidon(secret, amount, nonce)`
   - Stores `(secret, nonce)` securely in browser

2. **On-chain deposit**
   - User calls `deposit(commitment, amount)` on Clarity contract
   - Contract transfers USDCx to pool
   - Contract emits event with commitment

3. **Off-chain indexing**
   - Relayer listens for deposit events
   - Adds commitment to Merkle tree
   - Updates root on-chain via `update-root(newRoot)`

### Withdraw Flow

1. **Client-side proof generation**
   - User selects a deposit to withdraw
   - Fetches Merkle proof for commitment from relayer
   - Generates ZK proof using Circom circuit
   - Proof outputs: `(root, nullifier, recipient)`

2. **Off-chain verification**
   - User sends proof to relayer
   - Relayer verifies proof with snarkjs
   - If valid, relayer signs message
   - Relayer submits transaction to Stacks

3. **On-chain withdrawal**
   - Contract verifies relayer signature
   - Contract checks nullifier hasn't been used
   - Contract checks root is valid
   - Contract transfers USDCx to recipient

## Security Properties

### Privacy Guarantees

- **Unlinkability**: Deposits and withdrawals cannot be correlated
- **Anonymity**: Recipient identity is decoupled from sender
- **Amount hiding**: Withdrawal amounts are independent of deposits

### Trust Model

The relayer is trusted to verify proofs but CANNOT steal funds or break anonymity.

## Future Improvements

- On-chain verification when Stacks adds curve precompiles
- Decentralized relayer network
- Multi-token support
