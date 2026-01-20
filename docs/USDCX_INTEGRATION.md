# USDCx Integration in VeilPay

## Overview

VeilPay integrates **USDCx on Stacks** to enable private, anonymous payments using Zero-Knowledge proofs. This integration leverages Circle's xReserve protocol to bring stablecoin liquidity from Ethereum to Stacks while maintaining complete privacy for users.

## Why USDCx for Private Payments?

### Stability + Privacy
- **Stable value**: USDCx maintains 1:1 peg with USD, eliminating volatility concerns
- **Privacy**: Zero-Knowledge proofs break the link between deposits and withdrawals
- **Liquidity**: Tap into Ethereum's deep USDC liquidity via xReserve bridge
- **Trust**: Circle-backed stablecoin with proven reserves

### Use Cases

1. **Private Payments**: Send money without revealing sender-receiver relationships
2. **Anonymous Donations**: Support causes privately
3. **Compliance-Friendly Privacy**: Maintain privacy while using regulated stablecoin
4. **Cross-chain Privacy**: Bridge USDC from Ethereum privately to Stacks

## How VeilPay Uses USDCx

### Deposit Flow with USDCx

```
1. User bridges USDC from Ethereum → Stacks (using xReserve)
   ↓
2. User receives USDCx on Stacks
   ↓
3. User deposits USDCx into VeilPay pool
   - Generates private commitment
   - USDCx locked in smart contract
   ↓
4. Commitment added to Merkle tree
```

### Withdrawal Flow with USDCx

```
1. User generates ZK proof of commitment ownership
   ↓
2. Proof verified off-chain by relayer
   ↓
3. Relayer signs withdrawal request
   ↓
4. Smart contract validates and transfers USDCx to recipient
   ↓
5. Recipient can use USDCx on Stacks or bridge back to Ethereum
```

## Technical Integration Details

### Smart Contract Integration

The VeilPay Clarity contract integrates with the USDCx token contract:

```clarity
;; Deposit: Transfer USDCx from user to pool
(contract-call? .usdcx transfer amount tx-sender (as-contract tx-sender) none)

;; Withdraw: Transfer USDCx from pool to recipient
(as-contract (contract-call? .usdcx transfer amount tx-sender recipient none))
```

### USDCx Token Contract Reference

**Testnet (Sepolia)**:
- **Contract**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`
- **Standard**: SIP-010 fungible token
- **Decimals**: 6 (same as USDC on Ethereum)
- **Symbol**: USDCx
- **Stacks Domain ID**: 10003

**Mainnet**:
- **Contract**: [To be deployed]
- **Standard**: SIP-010 fungible token
- **Decimals**: 6
- **Symbol**: USDCx
- **Stacks Domain ID**: 10003

### Bridge Integration (Circle xReserve)

VeilPay works seamlessly with Circle's xReserve protocol:

1. **Ethereum → Stacks** (Deposit):
   - Approve xReserve contract (`0x008888878f94C0d87defdf0B07f46B93C1934442` testnet)
   - Call `depositToRemote()` with Stacks address and amount
   - Wait ~15 minutes for attestation
   - Receive USDCx on Stacks
   - Deposit into VeilPay for privacy

2. **Stacks → Ethereum** (Burn):
   - Withdraw USDCx from VeilPay privately
   - Call `burn()` on `.usdcx-v1` contract
   - Specify Ethereum recipient (bytes32) and amount (min 4.80 USDCx)
   - Wait ~25 min (testnet) or ~60 min (mainnet)
   - Receive USDC on Ethereum

**Bridge Specifications**:
- **Deposit minimum**: 1 USDC (testnet), 10 USDC (mainnet)
- **Withdrawal minimum**: 4.80 USDCx (fixed burn fee)
- **Deposit time**: ~15 minutes
- **Withdrawal time**: ~25 minutes (testnet), ~60 minutes (mainnet)
- **Bridge fee**: $0 deposit, $4.80 withdrawal (burned)

### Privacy Guarantees with USDCx

- **Deposit amounts**: Hidden via Zero-Knowledge proofs
- **Transaction graph**: Broken - cannot link deposits to withdrawals
- **User identity**: Protected - relayer doesn't know who's withdrawing
- **On-chain privacy**: Only commitment hashes and nullifiers visible

## Advantages Over Traditional USDCx Transfers

| Feature | Traditional USDCx | VeilPay with USDCx |
|---------|-------------------|-------------------|
| **Anonymity** | ❌ Public addresses | ✅ Zero-Knowledge |
| **Unlinkability** | ❌ All txs traceable | ✅ Deposits/withdrawals separate |
| **Privacy** | ❌ Transparent | ✅ Full privacy |
| **Stability** | ✅ USD-pegged | ✅ USD-pegged |
| **Liquidity** | ✅ Circle-backed | ✅ Circle-backed |

## Code Examples

### Deposit USDCx

```javascript
// Frontend code
import { generateDeposit } from './utils/crypto';

// Generate commitment
const { secret, nonce, commitment } = await generateDeposit(amount);

// Approve USDCx spending
await usdcxContract.approve(veilpayAddress, amount);

// Deposit into VeilPay
await veilpayContract.deposit(commitment, amount);

// Save secret and nonce securely
localStorage.setItem('deposit', JSON.stringify({ secret, nonce }));
```

### Withdraw USDCx

```javascript
// Generate ZK proof
const proof = await generateProof({
  secret,
  nonce,
  amount,
  recipient,
  merkleProof
});

// Submit to relayer
const response = await relayer.post('/withdraw', {
  proof,
  publicSignals,
  nullifierHash,
  recipient,
  amount
});

// USDCx sent to recipient address
console.log('Withdrawal txid:', response.data.txid);
```

## Economics & Pool Management

### Pool TVL (Total Value Locked)
- All deposited USDCx held in smart contract
- Transparent on-chain reserves
- Auditable via Stacks explorer

### Anonymity Set
- Larger pool = stronger privacy
- More deposits = harder to correlate
- Target: 1000+ deposits for strong privacy

### Fees
- **Deposit**: Gas only (no protocol fee)
- **Withdrawal**: Optional relayer fee (< 0.5%)
- **Bridge**: Standard xReserve fees apply

## Security Considerations

### USDCx-Specific Risks
- ✅ **No custody risk**: Circle backs USDCx reserves
- ✅ **Bridge security**: Relies on xReserve protocol
- ✅ **Smart contract**: Open-source, auditable Clarity code

### Privacy Trade-offs
- ⚠️ **Timing analysis**: Large deposits/withdrawals may be linkable
- ⚠️ **Amount correlation**: Same amounts in/out reduce anonymity
- ✅ **Mitigation**: Use common denominations (10, 100, 1000 USDCx)

## Roadmap: Enhanced USDCx Features

### Phase 1 (Current)
- [x] Basic deposit/withdraw with USDCx
- [x] Zero-Knowledge proof privacy
- [x] Single amount support

### Phase 2 (Q1 2026)
- [ ] Multiple pool sizes (10, 100, 1000 USDCx)
- [ ] Automated relayer network
- [ ] Enhanced anonymity set

### Phase 3 (Q2 2026)
- [ ] Variable amount withdrawals
- [ ] Compliance mode (optional)
- [ ] Cross-chain ZK bridge integration

## Benefits to Stacks Ecosystem

### Bringing Liquidity from Ethereum
- **Deep USDC liquidity**: Tap into $40B+ USDC on Ethereum
- **Private DeFi**: Enable privacy-preserving DeFi on Stacks
- **User adoption**: Attract privacy-conscious users
- **Innovation**: First ZK privacy protocol on Stacks

### USDCx Use Case Expansion
- **Private payments**: New use case for USDCx
- **Privacy layer**: Complement to existing DeFi
- **Liquidity pool**: Increase USDCx utility on Stacks
- **Developer tool**: SDK for private payments

## Getting Started with USDCx on VeilPay

### 1. Bridge USDC to Stacks
Follow the official guide: https://docs.stacks.co/more-guides/bridging-usdcx

### 2. Get USDCx on Testnet
- Use Stacks testnet faucet
- Or bridge testnet USDC from Ethereum Sepolia

### 3. Make Your First Private Payment
- Visit VeilPay app
- Connect Stacks wallet
- Deposit USDCx (e.g., 10 USDCx)
- Withdraw to different address
- Privacy achieved!

## References

- [USDCx Bridge Documentation](https://docs.stacks.co/more-guides/bridging-usdcx)
- [Circle xReserve Protocol](https://www.circle.com/en/cross-chain-transfer-protocol)
- [VeilPay Architecture](./ARCHITECTURE.md)
- [Stacks Documentation](https://docs.stacks.co)

## Support

For USDCx integration questions:
- GitHub Issues: https://github.com/carlos-israelj/VeilPay/issues
- Stacks Discord: https://stacks.chat
- Skool Community: https://www.skool.com/stackers
