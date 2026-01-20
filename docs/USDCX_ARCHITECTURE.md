# USDCx Architecture & VeilPay Integration

## What is USDCx?

USDCx is a **1:1 USDC-backed stablecoin** native to Stacks, issued through **Circle xReserve**. Unlike traditional bridge solutions, USDCx:

- ✅ No third-party bridges
- ✅ No wrapped assets
- ✅ No fragmented liquidity
- ✅ Direct Circle infrastructure integration
- ✅ Full USDC backing on source chain

## USDCx vs aeUSDC

| Feature | USDCx | aeUSDC |
|---------|-------|--------|
| **Issuer** | Circle (via xReserve) | Allbridge |
| **Backing** | 1:1 USDC (Circle reserves) | Bridged USDC |
| **Infrastructure** | Circle native (CCTP) | Third-party bridge |
| **Liquidity** | Deep (Circle ecosystem) | Fragmented |
| **Trust Model** | Circle + Stacks attestation | Bridge validators |
| **Status** | Active, recommended | Being deprecated |

**VeilPay uses USDCx** for superior liquidity, UX, and trust assumptions.

## USDCx System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USDCX ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ETHEREUM                          STACKS                       │
│  ┌──────────────────┐             ┌──────────────────┐         │
│  │  USDC Token      │             │  USDCx Token     │         │
│  │  (Circle)        │             │  (SIP-010)       │         │
│  └──────────────────┘             └──────────────────┘         │
│           │                                 ▲                   │
│           │ deposit                        │ mint              │
│           ▼                                 │                   │
│  ┌──────────────────┐             ┌──────────────────┐         │
│  │  xReserve        │─────────────│  USDCx-v1        │         │
│  │  (Circle)        │ attestation │  (Entry Point)   │         │
│  └──────────────────┘             └──────────────────┘         │
│           │                                 │                   │
│           │ lock USDC                      │ burn              │
│           ▼                                 ▼                   │
│  ┌──────────────────┐             ┌──────────────────┐         │
│  │  Circle          │             │  Stacks          │         │
│  │  Attestation     │◄────────────│  Attestation     │         │
│  │  Service         │  burn msg   │  Service         │         │
│  └──────────────────┘             └──────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Circle xReserve (Ethereum)

**Contract**: `0x8888888199b2Df864bf678259607d6D5EBb4e3Ce` (mainnet)

**Functions**:
- Locks USDC deposits at 1:1 ratio
- Emits deposit events
- Releases USDC on verified burn attestations

**Security**:
- Operated by Circle
- Holds USDC reserves
- Cryptographic attestation required for all operations

### 2. Circle Attestation Service

**Role**: Off-chain service operated by Circle

**Responsibilities**:
- Monitor deposit events on Ethereum
- Generate cryptographic attestations for deposits
- Verify burn intents from Stacks
- Sign withdrawal approvals

**Trust Model**: Circle-operated, institutional grade

### 3. USDCx-v1 Contract (Stacks)

**Contract**: `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx-v1` (mainnet)

**Key Functions**:

```clarity
;; Mint USDCx from verified deposit
(define-public (mint
  (deposit-intent (buff 2048))
  (signature (buff 65))
  (fee-amount uint))
  ...
)

;; Burn USDCx to initiate withdrawal
(define-public (burn
  (amount uint)
  (native-domain uint)
  (native-recipient (buff 32)))
  ...
)
```

**Validations**:
- Magic bytes: `0x5a2e0acd`
- Version: `u1`
- Remote domain: `10003` (Stacks)
- Nonce-based replay protection

### 4. USDCx Token Contract (Stacks)

**Contract**: `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx` (mainnet)

**Standard**: SIP-010 Fungible Token

**Key Features**:
- 6 decimals (same as USDC)
- Role-based access control:
  - **Governance**: Protocol configuration
  - **Mint**: Token operations (usdcx-v1 only)
  - **Pause**: Emergency controls
- Batch minting (up to 200 recipients)

### 5. Stacks Attestation Service

**Role**: Off-chain service operated by Stacks

**Responsibilities**:
- Monitor USDCx burn events
- Generate burn intent messages
- Sign messages for Circle verification
- Forward to Circle's xReserve

## Deposit Flow (Ethereum → Stacks)

```
1. USER
   ↓ Approve USDC spending
   ↓ Call depositToRemote() on xReserve

2. XRESERVE CONTRACT (Ethereum)
   ↓ Lock USDC in reserve
   ↓ Emit deposit event

3. CIRCLE ATTESTATION SERVICE
   ↓ Monitor deposit event
   ↓ Generate cryptographic attestation
   ↓ Sign with Circle key

4. USER (receives attestation off-chain)
   ↓ Call mint() on usdcx-v1 with attestation

5. USDCX-V1 CONTRACT (Stacks)
   ↓ Verify signature from Circle attestor
   ↓ Validate deposit intent (magic bytes, domain, nonce)
   ↓ Call protocol-mint() on usdcx token

6. USDCX TOKEN CONTRACT
   ↓ Mint USDCx to recipient
   ✅ User receives USDCx on Stacks
```

**Time**: ~15 minutes
**Cost**: Ethereum gas only

## Withdrawal Flow (Stacks → Ethereum)

```
1. USER
   ↓ Call burn() on usdcx-v1

2. USDCX-V1 CONTRACT (Stacks)
   ↓ Validate amount (minimum threshold)
   ↓ Call protocol-burn() on usdcx token
   ↓ Emit burn event (print)

3. USDCX TOKEN CONTRACT
   ↓ Burn tokens from user balance

4. STACKS ATTESTATION SERVICE
   ↓ Monitor burn events
   ↓ Generate burn intent message
   ↓ Sign with Stacks attestation key

5. CIRCLE XRESERVE
   ↓ Receive burn intent + signature
   ↓ Verify Stacks attestation
   ↓ Release USDC to recipient on Ethereum

6. USER
   ✅ Receives USDC on Ethereum wallet
```

**Time**: ~25 minutes (testnet), ~60 minutes (mainnet)
**Cost**: STX gas + $4.80 burn fee

## How VeilPay Integrates with USDCx

### VeilPay's Position in the Stack

```
USER (Ethereum USDC)
  ↓ Bridge via xReserve
USDCx on Stacks
  ↓ Deposit into VeilPay
VEILPAY PRIVACY POOL
  ↓ Private withdrawal (ZK proof)
USDCx to recipient
  ↓ Optional: Bridge back to Ethereum
USDC on Ethereum
```

### Integration Points

**1. Deposit to VeilPay**:
```clarity
;; VeilPay deposit function
(define-public (deposit
  (commitment (buff 32))
  (amount uint)
  (token-contract <ft-trait>))  ;; USDCx token passed here

  ;; Transfer USDCx from user to VeilPay pool
  (contract-call? token-contract transfer
    amount tx-sender (as-contract tx-sender) none)
  ...
)
```

**2. Withdraw from VeilPay**:
```clarity
;; VeilPay withdrawal function
(define-public (withdraw
  (nullifier-hash (buff 32))
  (recipient principal)
  (amount uint)
  (root (buff 32))
  (relayer-signature (buff 65))
  (token-contract <ft-trait>))  ;; USDCx token passed here

  ;; Transfer USDCx from pool to recipient
  (as-contract (contract-call? token-contract transfer
    amount tx-sender recipient none))
  ...
)
```

### VeilPay Value Proposition with USDCx

1. **Privacy Layer**: USDCx provides stable value, VeilPay adds privacy
2. **Circle Trust**: Backed by Circle's institutional infrastructure
3. **Deep Liquidity**: Access to Circle's multichain ecosystem
4. **No Wrapping**: Direct USDCx integration via SIP-010 trait
5. **Future-Proof**: As USDCx expands to more chains, VeilPay works everywhere

## Security Considerations

### Trust Assumptions

**Circle xReserve**:
- Circle operates attestation service honestly
- Circle maintains 1:1 USDC reserves
- xReserve contract is secure (audited)

**Stacks Attestation**:
- Stacks attestation service operates correctly
- Burn intents are properly signed
- No censorship of valid burns

**VeilPay Layer**:
- Relayer verifies ZK proofs correctly (can't steal)
- Smart contract logic is sound
- Merkle tree maintained accurately

### Audit Status

- **Circle xReserve**: ✅ Audited by Circle
- **USDCx Contracts**: ✅ Audited (see Stacks docs)
- **VeilPay**: 🔄 To be audited post-hackathon

## Advantages for VeilPay Users

### vs. Traditional Bridges
- **No bridge risk**: Circle native infrastructure
- **Better UX**: Fewer steps, clear status
- **Institutional trust**: Circle-backed, not third-party

### vs. aeUSDC
- **More liquidity**: Circle ecosystem integration
- **Lower fees**: No bridge operator markup
- **Future-proof**: Circle expanding to more chains

### Privacy + Stability
- **Stable value**: 1:1 USD peg via Circle
- **Privacy**: Zero-Knowledge proofs
- **Composability**: Works with all Stacks DeFi

## Roadmap Integration

### Q1 2026
- Circle Bridge Kit SDK release
- Simplified bridging UX
- VeilPay integration with SDK

### Future
- More source chains (Solana, Polygon, etc.)
- Expanded Circle CCTP network
- VeilPay on all USDCx-supported chains

## Technical Specifications

### Domain IDs
- Ethereum: `0`
- Stacks: `10003` (constant)

### Protocol Constants
- Magic Bytes: `0x5a2e0acd`
- Version: `u1`
- Decimals: `6`

### Limits
- Minimum Deposit: 1 USDC (testnet), 10 USDC (mainnet)
- Minimum Withdrawal: 4.80 USDCx (both networks)
- Max Amount: `u128` (Stacks integer limit)
- Batch Mint: Up to 200 recipients

## References

- [Official USDCx Docs](https://docs.stacks.co/learn/bridging/usdcx)
- [Circle xReserve](https://www.circle.com/cross-chain-transfer-protocol)
- [USDCx Contracts](https://docs.stacks.co/learn/bridging/usdcx/contracts)
- [VeilPay GitHub](https://github.com/carlos-israelj/VeilPay)
