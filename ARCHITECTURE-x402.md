# VeilPay x402 Multi-Asset — Architecture Document

## x402 Challenge (Feb 9-16) + Buidl Battle (Feb 9 - Mar 31) | Stacks Hackathons

---

## 1. Product Summary

**VeilPay x402** is the first x402-compatible privacy protocol on Stacks, enabling programmatic payments with cryptographic privacy guarantees. Users and AI agents can pay for services via standard HTTP 402 protocol while maintaining complete anonymity through Zero-Knowledge proofs. Supports STX, USDCx, and sBTC for maximum flexibility.

### Why it can't exist without both x402 and Zero-Knowledge

On standard x402 implementations, every payment is publicly traceable on-chain — you can see exactly who paid whom for what. VeilPay x402 combines HTTP 402's programmatic payment standard with Groth16 ZK-SNARKs to provide **cryptographic unlinkability**. When you pay for an API or service, the vendor receives payment but has zero knowledge of your identity. Combined with multi-asset support (STX/USDCx/sBTC), this creates the first privacy-preserving payment infrastructure for the x402 ecosystem.

### x402-stacks Three Guarantees

1. **Programmatic Payments** — HTTP 402 Payment Required enables machine-to-machine commerce. AI agents, automated systems, and developers can pay for resources without manual flows or session management.
2. **Standardized Protocol** — x402 is compatible with Coinbase x402 specification (CAIP-2 network identifiers, base64 headers). Interoperable with broader x402 ecosystem.
3. **Production Ready** — Facilitator service handles payment verification and settlement. STX and sBTC native support with minimal latency overhead.

### Target users

- **AI Agents** — Autonomous systems that need to pay for APIs privately
- **Developers** — APIs requiring payment without exposing customer identities
- **Privacy-conscious users** — Crypto holders who want financial confidentiality
- **Businesses** — Competitive intelligence, treasury operations, B2B payments

### Prize potential

**x402 Challenge:**
- $3,000 (winner-takes-all)

**Buidl Battle:**
- Main Hackathon: $6K (1st) + $3K (2nd) + $2K (3rd) = **up to $6,000**
- Bounty x402: **$3,000**
- Bounty USDCx: **$3,000**
- Bounty sBTC: **$3,000**
- **Total possible: $15,000**

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER / AI AGENT                            │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐      │
│  │ Wallet      │  │  x402 Client │  │ Deposit Interface  │      │
│  │ (Leather)   │  │  (axios)     │  │ (React)            │      │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────────┘      │
│         │                │                   │                   │
└─────────┼────────────────┼───────────────────┼───────────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│              VeilPay x402 API (Express.js)                        │
│                                                                   │
│  /x402/deposit/:asset    /x402/withdraw/:asset    /api/vault     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  x402-stacks Integration Layer                         │      │
│  │  • paymentMiddleware() - HTTP 402 responses            │      │
│  │  • wrapAxiosWithPayment() - client automation          │      │
│  │  • facilitator communication                           │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  VeilPay Privacy Layer                                 │      │
│  │  • ZK proof verification (snarkjs)                     │      │
│  │  • Nullifier tracking (double-spend prevention)        │      │
│  │  • Merkle tree management (Poseidon hash)              │      │
│  │  • Multi-asset pool routing                            │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                   │
└────┬──────────────┬──────────────┬───────────────┬───────────────┘
     │              │              │               │
     ▼              ▼              ▼               ▼
┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────────┐
│ x402    │  │ VeilPay   │  │  Stacks  │  │ x402scan         │
│ Facili- │  │ Relayer   │  │  Contracts│  │ Discovery        │
│ tator   │  │           │  │           │  │                  │
│ Verify  │  │ ZK Proof  │  │ veilpay- │  │ /schema          │
│ Settle  │  │ Verify    │  │ stx.clar │  │ /outputSchema    │
│         │  │ Merkle    │  │ veilpay- │  │                  │
└─────────┘  └───────────┘  │ usdcx.cl │  └──────────────────┘
     │              │        │ veilpay- │
     ▼              ▼        │ sbtc.clar│
  Stacks         IPFS/       └──────────┘
  Blockchain     Database         │
  (Settlement)   (Proofs)         ▼
                              STX/USDCx/sBTC
                              Token Contracts
```

### How x402 + Privacy Works Together

```
🔒 Standard x402 Payment Flow:
┌──────────┐  402 Required  ┌─────────────────────────────────────┐
│  Client  │ ──────────────→│  Server: "Pay 0.5 STX"              │
│          │ ←──────────────│  (Public: everyone sees who paid)   │
└──────────┘  Direct Payment└─────────────────────────────────────┘

🔐 VeilPay x402 Privacy Flow:
┌──────────┐  402 Required  ┌─────────────────────────────────────┐
│  Client  │ ──────────────→│  Server: "Pay 0.5 STX via VeilPay"  │
│          │                │                                     │
│  Deposit │────┐           │  ┌───────────────────────────┐      │
│  to Pool │    │           │  │ ZK Proof: "I deposited    │      │
│          │    └──────────→│  │  but you don't know who"  │      │
│          │ ←──────────────│  └───────────────────────────┘      │
└──────────┘  Service Access│  (Private: unlinkable payment)      │
              + Payment      └─────────────────────────────────────┘
```

---

## 3. Core Data Flow

### 3.1 Initial Setup (One-Time Per Asset)

```
User connects Wallet (Leather/Hiro)
  → Choose asset to use (STX | USDCx | sBTC)
  → VeilPay checks if privacy pool exists for user
  → If not: Create commitment group on-chain
  → User ready to make private payments
```

### 3.2 Deposit Flow (Privacy Pool Funding)

```
User wants to pay privately for services
  → Navigate to Deposit tab
  → Select asset (STX | USDCx | sBTC)
  → Enter amount to deposit (e.g., 10 STX)

  → CLIENT-SIDE (Browser):
      • Generate secret (256-bit random)
      • Generate nonce (256-bit random)
      • Calculate commitment = Poseidon(secret, amount, nonce)
      • Sign transaction with wallet

  → SMART CONTRACT (veilpay-stx.clar):
      • Verify signature
      • Transfer tokens from user to pool
      • Store commitment with commitment-id
      • Emit deposit event

  → RELAYER (Off-chain):
      • Index deposit event
      • Add commitment to Merkle tree (Poseidon hash)
      • Calculate new Merkle root
      • Update root on-chain via update-root()

  → USER INTERFACE:
      • Display success message
      • Show commitment hash
      • WARNING: Save secret + nonce securely (needed for withdrawal)
      • Option to download backup JSON
```

### 3.3 x402 Payment Flow (Service Access)

```
User (or AI agent) requests paid resource
  → GET https://api.example.com/premium-data

  → SERVER responds:
      HTTP/2 402 Payment Required
      payment-required: <base64-encoded payment details>
      {
        "x402Version": 2,
        "accepts": [{
          "scheme": "exact",
          "network": "stacks:2147483648",
          "amount": "500000",  // 0.5 STX in microSTX
          "asset": "STX",
          "payTo": "ST2...",
          "maxTimeoutSeconds": 300
        }]
      }

  → CLIENT (VeilPay x402 Mode):
      • Parse payment requirements
      • Check available balance in privacy pool
      • Retrieve Merkle proof from relayer:
          GET /api/proof/{commitment}
          → Returns: { pathElements, pathIndices, root }

      • Generate ZK proof (browser WASM):
          Private inputs: secret, amount, nonce, pathElements, pathIndices
          Public inputs: root, nullifierHash, recipient

          Circuit proves:
          1. commitment = Poseidon(secret, amount, nonce)
          2. Commitment exists in Merkle tree (proof verification)
          3. nullifierHash = Poseidon(secret, nonce)

      • Build payment payload:
          headers: {
            'payment-signature': base64({
              x402Version: 2,
              payload: { zkProof, publicSignals },
              accepted: { ... payment terms ... }
            }),
            'x-veilpay-nullifier': nullifierHash
          }

      • Retry request with payment headers

  → SERVER (VeilPay-Enabled):
      • Decode payment-signature header
      • Extract ZK proof and nullifier
      • Verify proof via VeilPay relayer:
          POST /verify-proof
          → Returns: { valid: true/false }

      • Check nullifier not used (prevent double-spend):
          Query smart contract: is-nullifier-used(nullifier)

      • If valid:
          • Mark nullifier as used on-chain
          • Trigger withdrawal from pool to vendor:
              withdraw(nullifierHash, vendor-address, amount, root, signature)
          • Grant access to resource

      • Return resource + payment-response header:
          payment-response: base64({
            success: true,
            transaction: "0xabc...",
            payer: "anonymous",
            network: "stacks:2147483648"
          })
```

### 3.4 Direct Withdrawal Flow (Cash Out)

```
User wants to withdraw from privacy pool
  → Navigate to Withdraw tab
  → Enter saved secret + nonce
  → Enter recipient address (can be different from deposit address)
  → Enter amount to withdraw

  → Generate ZK proof (same as x402 flow)
  → Submit to relayer for verification
  → Relayer verifies proof → signs withdrawal transaction
  → Smart contract validates:
      1. Relayer signature valid
      2. Root exists in valid-roots
      3. Nullifier not used
      4. Transfer tokens to recipient

  → Result: Tokens received, completely unlinkable from original deposit
```

### 3.5 Multi-Asset Routing

```
When payment is made:
  → Server specifies asset in payment-required:
      "asset": "STX" | "USDCx" | "sBTC"

  → Client routes to appropriate pool:
      if (asset === 'STX') → use veilpay-stx.clar
      if (asset === 'USDCx') → use veilpay-usdcx.clar
      if (asset === 'sBTC') → use veilpay-sbtc.clar

  → Each pool has independent:
      • Merkle tree (separate anonymity sets)
      • Nullifier registry (no cross-asset double-spend)
      • ZK circuits (same logic, different token)
```

---

## 4. Technology Stack

### Frontend

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | React 18 + Vite | Fast dev server, existing VeilPay codebase |
| Language | JavaScript/TypeScript | Type safety across x402/VeilPay SDKs |
| Styling | Tailwind CSS | Existing VeilPay UI, rapid iteration |
| Wallet | @stacks/connect | Official Stacks wallet integration |
| State | React Context + useState | Simple state management |
| x402 Client | axios + x402-stacks | wrapAxiosWithPayment() for automation |

### Backend (Express.js API)

| Component | Technology | Why |
|-----------|-----------|-----|
| x402 Server | x402-stacks (paymentMiddleware) | Standard HTTP 402 implementation |
| ZK Verification | snarkjs 0.7.x | Groth16 proof verification |
| Proof Generation | snarkjs + WASM | Browser-based proof creation |
| Hash Function | circomlibjs (Poseidon) | SNARK-friendly, consistent across stack |
| Blockchain | @stacks/transactions | Smart contract calls, transaction building |
| Merkle Trees | merkletreejs + custom Poseidon | Commitment storage and proof generation |

### Smart Contracts (Clarity)

| Component | Technology | Why |
|-----------|-----------|-----|
| Language | Clarity v2 | Stacks native, decidable, type-safe |
| Privacy Pools | veilpay-{stx,usdcx,sbtc}.clar | Multi-asset support |
| Token Integration | SIP-010 trait | Standard fungible token interface |
| x402 Endpoints | Public functions callable via x402 | Programmatic access |

### Infrastructure

| Component | Technology | Why |
|-----------|-----------|-----|
| Hosting Frontend | Vercel | Free tier, instant deploy, live URL |
| Hosting Relayer | Render | Free tier, persistent Node.js |
| Blockchain | Stacks Testnet/Mainnet | Bitcoin-anchored L2 |
| x402 Facilitator | facilitator.stacksx402.com | Official x402-stacks service |
| Discovery | x402scan (scan.stacksx402.com) | Protocol discovery and registry |
| ZK Circuits | Circom 2.x | Circuit definition language |

---

## 5. API Integrations

### 5.1 x402-stacks — Programmatic Payments

**Base URL:** `https://facilitator.stacksx402.com`
**Compatibility:** Coinbase x402 V2 specification

**Server-Side Integration:**

```typescript
import express from 'express';
import { paymentMiddleware, STXtoMicroSTX } from 'x402-stacks';

const app = express();

// x402-protected endpoint
app.get('/api/premium-data',
  paymentMiddleware({
    amount: STXtoMicroSTX(0.5),  // 0.5 STX
    payTo: process.env.VENDOR_ADDRESS,
    network: 'testnet',  // or 'stacks:2147483648' (CAIP-2)
    facilitatorUrl: 'https://facilitator.stacksx402.com',
    description: 'Premium API access',
  }),
  (req, res) => {
    const payment = getPayment(req);
    res.json({ data: 'Secret data', paidBy: payment?.payer });
  }
);
```

**Client-Side Integration:**

```typescript
import axios from 'axios';
import { wrapAxiosWithPayment, privateKeyToAccount } from 'x402-stacks';

// Create account from private key
const account = privateKeyToAccount(process.env.PRIVATE_KEY, 'testnet');

// Wrap axios with automatic payment handling
const api = wrapAxiosWithPayment(
  axios.create({ baseURL: 'https://api.example.com' }),
  account
);

// Use normally - 402 payments handled automatically!
const response = await api.get('/api/premium-data');
console.log(response.data);
```

**VeilPay Privacy Extension:**

Instead of direct payment, intercept and use privacy pool:

```typescript
// Custom x402 interceptor with VeilPay
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 402) {
      const paymentRequired = decodePaymentRequired(
        error.response.headers['payment-required']
      );

      // Use VeilPay instead of direct payment
      const zkProof = await generateVeilPayProof({
        amount: paymentRequired.amount,
        recipient: paymentRequired.payTo,
        asset: paymentRequired.asset,
      });

      // Retry with ZK proof
      return axios.request({
        ...error.config,
        headers: {
          'payment-signature': encodePaymentSignature(zkProof),
          'x-veilpay-nullifier': zkProof.nullifierHash,
        }
      });
    }
    throw error;
  }
);
```

### 5.2 VeilPay Relayer API

**Base URL:** `http://localhost:3001` (dev) / `https://veilpay-relayer.onrender.com` (prod)

**Endpoints:**

```typescript
// Get Merkle proof for commitment
GET /api/proof/:commitment
Response: {
  pathElements: string[],  // 20 elements (Merkle proof)
  pathIndices: number[],   // 20 elements (left/right path)
  root: string,            // Current Merkle root
  leaf: string             // Commitment value
}

// Verify ZK proof
POST /api/verify-proof
Body: {
  proof: { pi_a, pi_b, pi_c },
  publicSignals: [root, nullifierHash, recipient],
  amount: string
}
Response: {
  valid: boolean,
  error?: string
}

// Submit withdrawal (alternative to x402 flow)
POST /api/withdraw
Body: {
  proof: { ... },
  publicSignals: [...],
  nullifierHash: string,
  recipient: string,
  amount: string,
  root: string
}
Response: {
  success: boolean,
  txid: string,
  message: string
}

// Get relayer stats
GET /api/stats
Response: {
  totalDeposits: number,
  currentRoot: string,
  relayerAddress: string,
  supportedAssets: ['STX', 'USDCx', 'sBTC']
}
```

### 5.3 Stacks Smart Contracts

**veilpay-stx.clar (STX Pool):**

```clarity
;; Deposit STX with commitment
(define-public (deposit
    (commitment (buff 32))
    (amount uint))
    (begin
        (asserts! (>= amount u1000000) ERR-INVALID-AMOUNT)
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set commitments commitment-id {
            commitment: commitment,
            amount: amount,
            timestamp: block-height
        })
        (var-set commitment-count (+ commitment-id u1))
        (print {
            event: "deposit",
            commitment: commitment,
            amount: amount,
            asset: "STX"
        })
        (ok commitment-id)
    )
)

;; Withdraw with ZK proof verification (via relayer signature)
(define-public (withdraw
    (nullifier-hash (buff 32))
    (recipient principal)
    (amount uint)
    (root (buff 32))
    (message-hash (buff 32))
    (relayer-signature (buff 65)))
    (begin
        (asserts! (is-none (map-get? used-nullifiers nullifier-hash)) ERR-NULLIFIER-USED)
        (asserts! (is-some (map-get? valid-roots root)) ERR-INVALID-ROOT)
        (asserts! (secp256k1-verify message-hash relayer-signature (var-get relayer-pubkey)) ERR-INVALID-SIGNATURE)
        (map-set used-nullifiers nullifier-hash true)
        (try! (as-contract (stx-transfer? amount tx-sender recipient)))
        (ok true)
    )
)

;; Update Merkle root (relayer only)
(define-public (update-root (new-root (buff 32)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (map-set valid-roots new-root true)
        (var-set current-root new-root)
        (ok true)
    )
)

;; Read-only: Check nullifier used
(define-read-only (is-nullifier-used (nullifier (buff 32)))
    (ok (is-some (map-get? used-nullifiers nullifier)))
)
```

**veilpay-usdcx.clar (USDCx Pool):**

Same structure as STX pool, but uses SIP-010 transfer instead:

```clarity
(use-trait ft-trait .usdcx-trait.sip010-ft-trait)

(define-public (deposit
    (commitment (buff 32))
    (amount uint)
    (token-contract <ft-trait>))
    (begin
        ;; Transfer USDCx from user to pool
        (try! (contract-call? token-contract transfer
            amount tx-sender (as-contract tx-sender) none))
        ;; ... rest same as STX version
    )
)
```

**veilpay-sbtc.clar (sBTC Pool):**

Same as USDCx but with sBTC token contract.

### 5.4 x402scan Registration

```typescript
// Schema endpoint for discovery
app.get('/', (req, res) => {
  res.status(402).json({
    "x402Version": 2,
    "name": "VeilPay x402 Multi-Asset Privacy Protocol",
    "image": "https://veilpay.lat/icon.png",
    "accepts": [
      // STX endpoint
      {
        "scheme": "exact",
        "network": "stacks:2147483648",
        "maxAmountRequired": "1000000000",
        "resource": "https://veilpay.lat/x402/withdraw/stx",
        "description": "Private STX payments via Zero-Knowledge proofs",
        "mimeType": "application/json",
        "payTo": "ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1",
        "maxTimeoutSeconds": 300,
        "asset": "STX",
        "outputSchema": {
          "input": {
            "type": "request",
            "method": "POST",
            "bodyFields": {
              "recipient": {
                "type": "string",
                "required": true,
                "description": "Stacks address to receive withdrawal"
              },
              "amount": {
                "type": "number",
                "required": true,
                "description": "Amount in microSTX"
              }
            },
            "headerFields": {
              "payment-signature": {
                "type": "string",
                "required": true,
                "description": "Base64-encoded ZK proof payload"
              },
              "x-veilpay-nullifier": {
                "type": "string",
                "required": true,
                "description": "Nullifier hash (prevents double-spend)"
              }
            }
          },
          "output": {
            "success": { "type": "boolean" },
            "transaction": { "type": "string", "description": "Stacks tx hash" },
            "message": { "type": "string" }
          }
        }
      },
      // USDCx endpoint
      { /* same structure, asset: "USDCx" */ },
      // sBTC endpoint
      { /* same structure, asset: "sBTC" */ }
    ]
  });
});
```

---

## 6. ZK Circuit Details

### 6.1 Withdrawal Circuit (withdraw.circom)

```circom
pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template Withdraw(levels) {
    // Private inputs (secret, never revealed)
    signal input secret;
    signal input amount;
    signal input nonce;
    signal input pathElements[levels];  // Merkle proof
    signal input pathIndices[levels];

    // Public inputs (visible on-chain)
    signal input root;           // Merkle tree root
    signal input nullifierHash;  // Prevents double-spend
    signal input recipient;      // Withdrawal address

    // Constraint 1: Verify commitment
    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== secret;
    commitmentHasher.inputs[1] <== amount;
    commitmentHasher.inputs[2] <== nonce;
    signal commitment <== commitmentHasher.out;

    // Constraint 2: Verify Merkle proof
    component tree = MerkleProof(levels);
    tree.leaf <== commitment;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // Constraint 3: Verify nullifier
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== nonce;
    nullifierHash === nullifierHasher.out;
}

component main {public [root, nullifierHash, recipient]} = Withdraw(20);
```

**Circuit Parameters:**
- **Levels:** 20 (supports 2^20 = 1,048,576 deposits)
- **Constraints:** ~1,000,000
- **Proof Size:** 192 bytes (Groth16: 3 elliptic curve points)
- **Generation Time:** ~5-15 seconds (browser WASM)
- **Verification Time:** ~500ms (relayer) / <10ms (on-chain when available)

### 6.2 Proof Generation (Browser)

```typescript
import { groth16 } from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';

async function generateVeilPayProof({
  secret,
  nonce,
  amount,
  recipient,
  merkleProof
}: ProofInputs) {
  // Calculate nullifier
  const poseidon = await buildPoseidon();
  const nullifierHash = poseidon.F.toString(
    poseidon([BigInt(secret), BigInt(nonce)]),
    16
  );

  // Convert recipient address to field element
  const recipientHash = addressToFieldElement(recipient);

  // Build circuit input
  const input = {
    secret: secret,
    amount: amount,
    nonce: nonce,
    pathElements: merkleProof.pathElements.map(hexToBigInt),
    pathIndices: merkleProof.pathIndices,
    root: hexToBigInt(merkleProof.root),
    nullifierHash: hexToBigInt(nullifierHash),
    recipient: recipientHash
  };

  // Generate proof (uses WASM in browser)
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    '/circuits/withdraw.wasm',
    '/circuits/withdraw_final.zkey'
  );

  return {
    proof,
    publicSignals,
    nullifierHash
  };
}
```

---

## 7. Key Pages & Components

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — x402 + privacy value prop |
| `/deposit` | Deposit interface (fund privacy pools) |
| `/withdraw` | Withdrawal interface (cash out privately) |
| `/x402-demo` | AI agent demo showing automated payments |
| `/docs` | API documentation for developers |

### Components

| Component | Description |
|-----------|-------------|
| `WalletConnect` | Stacks wallet integration (Leather, Hiro) |
| `AssetSelector` | Choose STX / USDCx / sBTC |
| `DepositForm` | Amount input + commitment generation |
| `WithdrawForm` | Secret/nonce input + ZK proof generation |
| `x402Client` | Demo axios client with wrapAxiosWithPayment |
| `PrivacyBadge` | Shows ZK verification status |
| `MerkleViewer` | Visualize Merkle tree state |
| `TransactionHistory` | List deposits/withdrawals (user-specific) |

---

## 8. Database Schema

### In-Memory (Relayer)

```typescript
// merkle-tree-state.json
{
  "stx": {
    "leaves": ["commitment1", "commitment2", ...],
    "root": "0xabc...",
    "depth": 20
  },
  "usdcx": {
    "leaves": [...],
    "root": "0xdef...",
    "depth": 20
  },
  "sbtc": {
    "leaves": [...],
    "root": "0x123...",
    "depth": 20
  }
}

// nullifiers.json
{
  "stx": ["nullifier1", "nullifier2", ...],
  "usdcx": [...],
  "sbtc": [...]
}
```

### On-Chain (Smart Contracts)

```clarity
;; Commitments map
(define-map commitments uint {
    commitment: (buff 32),
    amount: uint,
    timestamp: uint
})

;; Nullifiers set (prevent double-spend)
(define-map used-nullifiers (buff 32) bool)

;; Valid Merkle roots (allows for state transitions)
(define-map valid-roots (buff 32) bool)

;; Current root
(define-data-var current-root (buff 32) 0x00)

;; Commitment counter
(define-data-var commitment-count uint u0)
```

### Client-Side (LocalStorage)

```json
{
  "deposits": [
    {
      "id": "dep_001",
      "asset": "STX",
      "amount": "10000000",
      "commitment": "0xabc...",
      "secret": "encrypted_with_wallet",
      "nonce": "encrypted_with_wallet",
      "timestamp": "2026-02-10T12:00:00Z",
      "txid": "0xdef...",
      "spent": false
    }
  ]
}
```

---

## 9. Security Model

### What's protected and how

| Data | Protection | Who can access |
|------|-----------|---------------|
| Secret + Nonce | Client-side only, encrypted in localStorage | Only the user (never transmitted) |
| Commitment | Public (on-chain) | Everyone (but reveals nothing without secret) |
| Nullifier | Public after withdrawal | Everyone (but unlinkable to commitment) |
| ZK Proof | Transmitted to relayer | Relayer verifies but can't extract secret |
| Merkle Proof | Public (generated by relayer) | Everyone (doesn't reveal which leaf is yours) |
| Transaction Amount | Public (on-chain) | Everyone (future: fixed denominations hide amounts) |
| Deposit → Withdrawal Link | Cryptographically Hidden | No one (ZK proof guarantees unlinkability) |

### Attack vectors addressed

| Attack | Mitigation |
|--------|-----------|
| Double-spend | Nullifiers tracked on-chain; reusing = rejected |
| Front-running | Relayer submits tx, not user; no mempool exposure |
| Proof forgery | Groth16 soundness; computationally infeasible |
| Commitment collision | Poseidon collision resistance (128-bit security) |
| Merkle tree manipulation | Roots stored on-chain; verifiable by anyone |
| Relayer censorship | User can run own relayer; source code public |
| x402 facilitator compromise | Payment already verified by ZK proof; facilitator only settles |
| Smart contract exploit | Clarity type safety + decidability; testnet testing |
| Replay attacks | Each nullifier valid once; timestamp checks |

---

## 10. Hackathon Qualification

### x402 Challenge Alignment

VeilPay x402 **drives x402-stacks adoption** through:

1. **First Privacy Integration** — No other x402 service offers ZK privacy
2. **Multi-Asset Support** — STX/USDCx/sBTC = most comprehensive x402 implementation
3. **AI Agent Ready** — Programmatic payments via wrapAxiosWithPayment()
4. **Ecosystem Infrastructure** — Other x402 services can integrate VeilPay privacy layer
5. **x402scan Compatible** — Full schema implementation with outputSchema
6. **New Monetization Model** — Privacy-as-a-service for x402 endpoints

### Buidl Battle — "Only on Stacks" Qualification

This product **requires** Stacks-specific infrastructure:

1. **Clarity Smart Contracts** — Type-safe, decidable privacy pool logic
2. **STX Native** — Direct STX transfers without token wrapper
3. **USDCx Integration** — Circle's xReserve protocol on Stacks
4. **sBTC Native** — First privacy for Bitcoin on Stacks L2
5. **x402-stacks** — Stacks-specific x402 implementation
6. **Bitcoin Security** — Inherits Bitcoin L1 finality via Proof of Transfer
7. **Stacks Ecosystem** — Composable with ALEX, Velar, other Stacks protocols

### Bounty Qualification

**x402 Bounty ($3K):**
- Core protocol is x402-stacks
- Most innovative integration (privacy layer)
- Molbot-to-molbot commerce with privacy

**USDCx Bounty ($3K):**
- Private USDCx transfers via x402
- Programmatic bridge usage (deposit USDCx → pay privately)
- Enterprise use case: stable payments with privacy

**sBTC Bounty ($3K):**
- **First privacy solution for sBTC**
- Bitcoin holders get private transfers on Stacks
- Innovative: sBTC + ZK-SNARKs + x402 (never done before)

---

## 11. File Structure

```
VeilPay/
├── contracts/                  # Clarity Smart Contracts
│   ├── veilpay-stx.clar        # STX privacy pool
│   ├── veilpay-usdcx.clar      # USDCx privacy pool
│   ├── veilpay-sbtc.clar       # sBTC privacy pool (NEW)
│   ├── usdcx-trait.clar        # SIP-010 trait
│   ├── x402-router.clar        # Multi-asset routing (NEW)
│   ├── deploy-v2.js
│   └── Clarinet.toml
│
├── circuits/                   # ZK Circuits (existing)
│   ├── withdraw.circom         # Main withdrawal circuit
│   ├── build/
│   │   ├── withdraw.wasm
│   │   ├── withdraw_final.zkey
│   │   └── verification_key.json
│   └── test/
│
├── relayer/                    # Node.js Relayer
│   ├── src/
│   │   ├── index.js            # Express server
│   │   ├── x402-wrapper.js     # NEW: x402 endpoints
│   │   ├── merkle.js           # Merkle tree (Poseidon)
│   │   ├── verifier.js         # ZK proof verification
│   │   ├── indexer.js          # Blockchain events
│   │   ├── stacks-client.js    # Transaction builder
│   │   └── multi-asset.js      # NEW: Asset routing
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Deposit.jsx
│   │   │   ├── Withdraw.jsx
│   │   │   ├── X402Demo.jsx    # NEW: AI agent demo
│   │   │   ├── AssetSelector.jsx  # NEW
│   │   │   └── PrivacyBadge.jsx
│   │   ├── utils/
│   │   │   ├── crypto.js       # Poseidon hash
│   │   │   ├── proof.js        # ZK proof generation
│   │   │   └── x402-client.js  # NEW: x402 integration
│   │   └── main.jsx
│   ├── public/
│   │   └── circuits/
│   │       ├── withdraw.wasm
│   │       └── withdraw_final.zkey
│   └── package.json
│
├── docs/
│   ├── API.md                  # NEW: x402 API docs
│   ├── INTEGRATION.md          # NEW: How to integrate
│   └── ARCHITECTURE-x402.md    # This file
│
├── README.md
├── package.json
└── vercel.json
```

---

## 12. Environment Variables

### Relayer (.env)

```env
# Network
STACKS_NETWORK=testnet
PORT=3001

# Relayer Wallet
RELAYER_PRIVATE_KEY=your_stacks_private_key_hex
RELAYER_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1

# x402 Integration
X402_FACILITATOR_URL=https://facilitator.stacksx402.com

# Smart Contracts
CONTRACT_STX=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-stx
CONTRACT_USDCX=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx
CONTRACT_SBTC=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc

# Token Contracts
USDCX_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
SBTC_ADDRESS=ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_STACKS_NETWORK=testnet
VITE_X402_ENABLED=true
```

---

## 13. Key Dependencies

```json
{
  "dependencies": {
    "x402-stacks": "^2.0.1",
    "express": "^4.18",
    "axios": "^1.6",
    "snarkjs": "^0.7.0",
    "circomlibjs": "^0.1.7",
    "@stacks/transactions": "^7.0",
    "@stacks/connect": "^7.0",
    "merkletreejs": "^0.3.11",
    "ethers": "^6.0"
  },
  "devDependencies": {
    "circom": "^2.1",
    "typescript": "^5",
    "vite": "^5"
  }
}
```

---

## 14. Accounts to Create

| # | Service | URL | Steps | Output |
|---|---------|-----|-------|--------|
| 1 | Stacks Wallet | Leather.io or wallet.hiro.so | Install extension → Create wallet | Stacks address + private key |
| 2 | Testnet STX | stacks.co/testnet-faucet | Connect wallet → Request tokens | Test STX for gas |
| 3 | x402scan | scan.stacksx402.com | Deploy app → Submit schema URL | Listed in discovery |
| 4 | Vercel | vercel.com | Sign up (free) → Import repo | Live frontend URL |
| 5 | Render | render.com | Sign up (free) → Deploy relayer | Live backend URL |

---

## 15. Cost Estimates

### Development (Testnet)

| Operation | Cost (NEAR equivalent) | Notes |
|-----------|---------|-------|
| Deploy 3 contracts | ~0.5 STX | veilpay-{stx,usdcx,sbtc}.clar |
| Update Merkle root (per deposit) | ~0.01 STX | Relayer pays gas |
| Withdrawal transaction | ~0.02 STX | Relayer pays, recoups via fee |
| Test deposits (10 x 1 STX) | 10 STX | Funds recoverable |
| **Total for MVP testing** | ~11 STX (~$15) | |

### x402 Payments

| Scenario | Flow | Cost |
|----------|------|------|
| Standard x402 payment | Direct to vendor | 0.5 STX (example) |
| VeilPay x402 payment | Deposit → ZK proof → Withdraw | 0.5 STX + ~0.03 gas |
| Privacy premium | | ~6% gas overhead |

### Operational (Mainnet)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| Frontend hosting (Vercel) | $0 (free tier) | Static React app |
| Relayer hosting (Render) | $0 (free tier) | Or $7/mo for persistent |
| Gas costs (relayer) | ~1-5 STX | Depends on volume |
| **Total** | $0-10/month | |

---

## 16. MVP Scope (Hackathon Submission)

### Phase 1: x402 Challenge (Feb 9-16) ✅

**Must Have:**
- [x] x402-stacks integration (paymentMiddleware on relayer)
- [x] STX privacy pool (veilpay-stx.clar working)
- [x] ZK proof verification endpoint
- [x] Axios client demo with wrapAxiosWithPayment()
- [x] x402scan schema registration
- [x] Live demo URL (Vercel frontend + Render relayer)
- [x] Video pitch (< 5 min)
- [x] GitHub repo public

**Scope:**
- STX only (no multi-asset yet)
- Simple UI (deposit + withdraw + x402 demo)
- Testnet deployment
- Documentation: README + API docs

**Success Criteria:**
- AI agent can pay for service via x402 privately
- Video shows: deposit → agent pays → withdraw (unlinkable)
- Registered on x402scan

---

### Phase 2: Buidl Battle (Feb 16 - Mar 31) ✅

**Must Add:**
- [ ] USDCx pool (veilpay-usdcx.clar)
- [ ] sBTC pool (veilpay-sbtc.clar)
- [ ] Multi-asset routing (x402-router.clar)
- [ ] Asset selector UI
- [ ] Enhanced demo showing all 3 assets
- [ ] Updated video pitch (multi-asset focus)
- [ ] Comprehensive documentation

**Nice to Have:**
- [ ] Fixed denominations (hide amounts)
- [ ] Multiple relayer support (decentralization)
- [ ] Advanced analytics dashboard
- [ ] Mobile-responsive UI
- [ ] Bounty-specific demos (USDCx enterprise, sBTC Bitcoin privacy)

**Success Criteria:**
- All 3 assets functional (STX, USDCx, sBTC)
- Video shows unique value per asset
- Qualifies for 3+ bounties
- Production-quality documentation

---

## 17. Demo Video Script

### x402 Challenge (5 minutes)

```
0:00-0:30  HOOK
"AI agents need to pay for APIs. But every x402 payment is public.
 VeilPay x402 fixes that with Zero-Knowledge proofs."

0:30-1:00  PROBLEM
- Show standard x402 payment: GET /api/data → 402 → Pay → Service
- Show blockchain explorer: "Everyone sees who paid"
- "This is dangerous for competitive intelligence, AI strategy"

1:00-2:00  SOLUTION
- "VeilPay x402 adds privacy layer"
- Show deposit flow: User deposits 10 STX into privacy pool
- Commitment stored, Merkle tree updated
- "Pool has 100 STX from many users — all mixed"

2:00-3:30  DEMO
- AI agent code:
    const api = wrapAxiosWithPayment(axios, account);
    const data = await api.get('/premium-api');
- Show 402 response
- Show ZK proof generation (~5s)
- Show payment accepted
- "Agent got data, vendor got paid, but link is IMPOSSIBLE to trace"
- Show blockchain: deposit tx vs withdrawal tx (different addresses)

3:30-4:30  TECHNICAL
- Architecture diagram (x402 + VeilPay)
- "Groth16 ZK-SNARKs: 192 byte proofs, 1M constraints"
- "Poseidon hash: SNARK-friendly, 10x faster than SHA-256"
- "Merkle tree: 1M+ deposit capacity"
- "Compatible with Coinbase x402 spec"

4:30-5:00  CLOSE
- "VeilPay x402: Privacy for programmatic payments"
- "First x402 service with cryptographic privacy"
- "Try it: veilpay.lat/x402"
- "Docs: github.com/carlos-israelj/VeilPay"
```

### Buidl Battle (5 minutes) — Updated

```
0:00-0:30  HOOK
"Bitcoin needs privacy. Stablecoins need privacy.
 VeilPay x402 brings Zero-Knowledge privacy to STX, USDCx, AND sBTC."

0:30-1:30  MULTI-ASSET VALUE
- STX: "Native Stacks payments with privacy"
- USDCx: "Stable payments, no volatility, full privacy"
- sBTC: "First time Bitcoin holders have private transfers on Stacks"
- Show asset selector UI

1:30-3:00  DEMOS
- STX: AI agent paying for API
- USDCx: Business paying vendor (stable, private)
- sBTC: Bitcoin holder transferring anonymously

3:00-4:00  INNOVATION
- "First multi-asset ZK protocol on Stacks"
- "First sBTC privacy pool"
- "First x402 + Zero-Knowledge integration"
- Show architecture: 3 pools, shared privacy tech

4:00-5:00  ECOSYSTEM IMPACT
- "Any x402 service can add VeilPay privacy"
- "Unlocks private AI agent economy"
- "Bitcoin privacy without leaving Stacks L2"
- "Registered on x402scan, discoverable by all agents"
- Call to action + bounty qualification
```

---

## 18. Reference Documentation

| Resource | URL |
|----------|-----|
| x402-stacks npm package | https://www.npmjs.com/package/x402-stacks |
| x402-stacks docs | https://docs.stacksx402.com |
| x402scan discovery | https://scan.stacksx402.com |
| Coinbase x402 spec | https://github.com/coinbase/x402-protocol |
| VeilPay repo | https://github.com/carlos-israelj/VeilPay |
| Circom docs | https://docs.circom.io |
| SnarkJS repo | https://github.com/iden3/snarkjs |
| Stacks docs | https://docs.stacks.co |
| Clarity reference | https://docs.stacks.co/clarity |
| USDCx bridge guide | https://docs.stacks.co/more-guides/bridging-usdcx |
| sBTC docs | https://sbtc.tech |
| Stacks Explorer (testnet) | https://explorer.hiro.so/?chain=testnet |

---

## 19. Success Metrics

### Technical Completion

| Milestone | Status | Target Date |
|-----------|--------|-------------|
| x402 STX integration | ✅ | Feb 14 |
| ZK proof generation working | ✅ | Feb 14 |
| x402scan registration | ✅ | Feb 15 |
| Video pitch | ✅ | Feb 16 |
| x402 Challenge submission | ✅ | Feb 16 |
| USDCx pool added | 🔄 | Feb 28 |
| sBTC pool added | 🔄 | Mar 7 |
| Multi-asset router | 🔄 | Mar 14 |
| Buidl Battle submission | 🔄 | Mar 31 |

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| ZK proof generation time | < 10s | ~5-8s ✅ |
| Payment flow latency | < 30s total | ~20s ✅ |
| Relayer uptime | 99%+ | TBD |
| Smart contract gas | < 50K per tx | ~30K ✅ |

### Adoption Metrics

| Metric | x402 Challenge | Buidl Battle |
|--------|---------------|--------------|
| Test deposits | 10+ | 50+ |
| Video views | 100+ | 500+ |
| GitHub stars | 20+ | 100+ |
| x402scan traffic | 50+ clicks | 200+ |

---

## 20. Post-Hackathon Roadmap

### Month 1 (April 2026)
- Security audit (basic smart contract review)
- Mainnet deployment (STX pool first)
- Documentation polish
- First 10 real users

### Month 2-3 (May-June 2026)
- USDCx + sBTC mainnet
- Fixed denominations (hide amounts)
- Multi-relayer network
- SDK for developers

### Month 4-6 (July-Sept 2026)
- White-label x402 privacy service
- Integration partnerships (ALEX, Velar, etc)
- Mobile app (React Native)
- Governance token

### Year 2+
- Cross-chain (other x402-compatible chains)
- On-chain verification (when Stacks adds SNARK precompiles)
- Enterprise offerings
- DAO governance

---

**Built on Stacks · Powered by x402 · Secured by Zero-Knowledge · Privacy for All Assets**

*© 2026 VeilPay — Licensed under MIT*
