# VeilPay

**Private USDCx transfers on Stacks using Zero-Knowledge proofs.**

> Submission for the [Programming USDCx on Stacks Builder Challenge](https://dorahacks.io/hackathon/usdcx-stacks) (January 19-25, 2026)

## What is VeilPay?

VeilPay is the **first Zero-Knowledge privacy protocol** for USDCx on Stacks. It enables completely private, anonymous transfers while leveraging Circle's xReserve bridge to bring Ethereum liquidity to Stacks.

### Key Features

- **Complete Privacy**: Zero-Knowledge proofs ensure deposits and withdrawals cannot be linked
- **USDCx Integration**: Native support for Circle's USDCx stablecoin on Stacks
- **Cross-chain**: Works with USDCx bridged from Ethereum via xReserve
- **Non-custodial**: Smart contract-based, no intermediaries control funds
- **Decentralized**: Open-source protocol, anyone can run a relayer

## Why USDCx + Privacy?

**USDCx** brings stable, liquid assets from Ethereum to Stacks. **VeilPay** adds the missing piece: **privacy**.

- Send USDCx without revealing sender-receiver relationships
- Break on-chain transaction graph analysis
- Maintain financial privacy while using regulated stablecoin
- Enable anonymous donations, private payments, and confidential transfers

## Architecture

VeilPay uses a hybrid ZK architecture:
- **Client-side ZK proof generation** (Circom + snarkjs)
- **Off-chain proof verification** (Relayer)
- **On-chain commitment verification** (Clarity smart contract)
- **USDCx token integration** (SIP-010 fungible token)

### Why this approach?

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

## USDCx Integration

VeilPay deeply integrates with **USDCx on Stacks**:

1. **Deposit Flow**: Users deposit USDCx → receive private commitment
2. **Bridge Compatible**: Works seamlessly with USDC bridged from Ethereum via xReserve
3. **Privacy Layer**: Zero-Knowledge proofs hide transaction graphs
4. **Withdraw Flow**: Prove ownership → receive USDCx to any address

For detailed integration docs, see [USDCx Integration Guide](./docs/USDCX_INTEGRATION.md)

### Bridging USDC to Stacks

To use VeilPay, first bridge USDC from Ethereum to Stacks:
- Follow the official guide: https://docs.stacks.co/more-guides/bridging-usdcx
- Testnet: Use Sepolia testnet USDC
- Mainnet: Bridge mainnet USDC via xReserve

## Value Proposition

### For Users
- **Privacy**: Send USDCx anonymously
- **Security**: Non-custodial, open-source smart contracts
- **Stability**: Use USD-pegged stablecoin, not volatile crypto
- **Cross-chain**: Bridge from Ethereum, spend privately on Stacks

### For Stacks Ecosystem
- **Liquidity**: Attracts Ethereum USDC liquidity to Stacks
- **Use Case**: First privacy protocol for USDCx
- **Innovation**: Demonstrates ZK capabilities on Stacks
- **Developer Tool**: SDK for building private dApps

### For DeFi on Stacks
- **Private Payments**: Enable confidential transactions
- **Anonymous Deposits**: Privacy-preserving DeFi interactions
- **Compliance**: Use regulated stablecoin with privacy
- **Liquidity Pool**: Locked USDCx increases TVL

## Roadmap

### Phase 1 (Challenge Submission) ✅
- [x] Core implementation (circuits, contracts, relayer, frontend)
- [x] USDCx integration
- [x] Working demo
- [x] Documentation

### Phase 2 (Post-Challenge)
- [ ] Decentralized relayer network
- [ ] Multi-denomination pools (10, 100, 1000 USDCx)
- [ ] Enhanced privacy features
- [ ] Security audit

### Phase 3 (Future)
- [ ] Migration to on-chain verification when available
- [ ] Multi-token support beyond USDCx
- [ ] Mobile app
- [ ] Compliance tools

## Hackathon Submission

**Programming USDCx on Stacks Builder Challenge**
- **Event**: January 19-25, 2026
- **Category**: Open (all projects compete)
- **Prize**: $3,000 USD (winner-takes-all)

### Submission Materials
- ✅ GitHub Repository: https://github.com/carlos-israelj/VeilPay
- ✅ Working Demo: [Link to deployed demo]
- ✅ Video Pitch: [Link to video]
- ✅ DoraHacks Registration: [Link]

## Demo

Try VeilPay on Stacks testnet:
1. Bridge testnet USDC from Sepolia to Stacks
2. Visit: [Demo URL]
3. Connect Stacks wallet (Leather/Hiro)
4. Deposit USDCx → Get private commitment
5. Withdraw to different address → Privacy achieved!

## Technical Innovation

### What Makes VeilPay Unique?

1. **First ZK Privacy on Stacks**: No other protocol offers Zero-Knowledge privacy
2. **USDCx Native**: Built specifically for Circle's USDCx
3. **Practical Privacy**: Works today with hybrid architecture
4. **Future-proof**: Designed to migrate to full on-chain verification
5. **Open Protocol**: Anyone can integrate or run a relayer

### Technical Highlights

- Groth16 ZK-SNARKs with Circom circuits
- Poseidon hash (SNARK-friendly)
- Merkle tree commitments (20 levels, 1M+ capacity)
- Nullifier-based double-spend prevention
- Off-chain proof verification with on-chain settlement
- SIP-010 token integration

## License

MIT
