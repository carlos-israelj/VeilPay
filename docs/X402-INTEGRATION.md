# VeilPay x402 Multi-Asset Integration

**Private programmatic payments using x402 protocol with ZK-SNARK privacy**

## Overview

VeilPay x402 extends the x402-stacks payment protocol with zero-knowledge privacy guarantees. Instead of sending payments directly, users can pay through VeilPay's privacy pools while still maintaining full x402 compatibility.

### Key Features

- ✅ **x402 Compatible**: Works with existing x402-stacks ecosystem
- ✅ **Multi-Asset Support**: STX, USDCx, and sBTC
- ✅ **Zero-Knowledge Privacy**: Payments are cryptographically unlinkable
- ✅ **Backward Compatible**: Supports both private and standard x402 payments
- ✅ **Simple Integration**: Drop-in replacement for standard x402 middleware

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client     │         │   VeilPay    │         │   Vendor     │
│  (Browser)   │         │   Relayer    │         │   Server     │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │  1. Request resource   │                        │
       ├────────────────────────┼───────────────────────>│
       │                        │                        │
       │  2. 402 Payment Required                        │
       │<───────────────────────┼────────────────────────┤
       │                        │                        │
       │  3a. Deposit to privacy pool                    │
       ├───────────────────────>│                        │
       │                        │                        │
       │  3b. Generate ZK proof │                        │
       │  (proves ownership)    │                        │
       │                        │                        │
       │  4. Request + ZK proof │                        │
       ├────────────────────────┼───────────────────────>│
       │                        │                        │
       │                        │  5. Verify proof       │
       │                        │<───────────────────────┤
       │                        │                        │
       │                        │  6. Proof valid        │
       │                        │───────────────────────>│
       │                        │                        │
       │                        │  7. Withdraw to vendor │
       │                        │<───────────────────────┤
       │                        │                        │
       │  8. Grant access to resource                    │
       │<───────────────────────┼────────────────────────┤
       │                        │                        │
```

## Quick Start

### Server-Side (Vendor)

```javascript
import express from 'express';
import { createVeilPayX402Middleware } from './x402/middleware.js';

const app = express();

// Protect endpoint with x402 + privacy
app.get('/premium-content',
  createVeilPayX402Middleware({
    asset: 'STX',
    amount: '1000000', // 1 STX
    payTo: 'ST1VENDOR...', // Your Stacks address
    network: 'testnet',
    facilitatorUrl: 'https://facilitator.veilpay.dev',
    description: 'Premium Content (1 STX)',
  }),
  (req, res) => {
    // Payment verified - grant access
    res.json({
      content: 'Secret premium content!',
      payment: req.veilpayPayment
    });
  }
);

app.listen(3000);
```

### Client-Side (Buyer)

#### Standard x402 Payment (No Privacy)

```javascript
import { wrapAxiosWithPayment } from 'x402-stacks';
import axios from 'axios';

const client = wrapAxiosWithPayment(axios, {
  facilitatorUrl: 'https://facilitator.veilpay.dev',
  network: 'testnet',
});

// Wallet will prompt for payment
const response = await client.get('https://vendor.com/premium-content');
console.log(response.data.content);
```

#### VeilPay Privacy Payment (With ZK Proofs)

```javascript
import axios from 'axios';
import { generateProof } from './veilpay/proof.js';
import { getProofFromRelayer } from './veilpay/relayer.js';

// 1. Deposit to VeilPay privacy pool (one-time)
const deposit = await veilpay.deposit({
  asset: 'STX',
  amount: '1000000',
  secret: generateSecret(),
  nonce: generateNonce(),
});

// 2. Generate ZK proof
const { proof, publicSignals } = await generateProof({
  secret: deposit.secret,
  nonce: deposit.nonce,
  amount: '1000000',
  recipient: 'ST1VENDOR...', // Vendor address
  merkleProof: await getProofFromRelayer(deposit.commitment),
});

// 3. Request with privacy headers
const response = await axios.get('https://vendor.com/premium-content', {
  headers: {
    'x-veilpay-proof': btoa(JSON.stringify({ proof, publicSignals })),
    'x-veilpay-nullifier': deposit.nullifierHash,
  }
});

console.log(response.data.content);
// Payment was private - vendor doesn't know your identity!
```

## API Reference

### `createVeilPayX402Middleware(config)`

Creates middleware that handles both standard x402 payments and VeilPay privacy payments.

**Parameters:**

- `config.asset` (string): Asset type - 'STX' | 'USDCx' | 'sBTC'
- `config.amount` (string): Amount in micro-units
- `config.payTo` (string): Vendor's Stacks address
- `config.network` (string): 'testnet' | 'mainnet'
- `config.facilitatorUrl` (string): x402 facilitator URL
- `config.description` (string): Human-readable payment description

**Returns:** Express middleware function

**Behavior:**

1. If request has VeilPay headers → Verify ZK proof and process privacy payment
2. If no VeilPay headers → Return standard 402 Payment Required response

### Privacy Headers

When making a VeilPay privacy payment, include these headers:

```javascript
{
  'x-veilpay-proof': base64(JSON.stringify({ proof, publicSignals })),
  'x-veilpay-nullifier': nullifierHash
}
```

### Payment Info

After successful payment, `req.veilpayPayment` contains:

```javascript
{
  nullifier: "0x...",
  recipient: "ST1VENDOR...",
  amount: "1000000",
  asset: "STX",
  transaction: "0xtxid...",
  timestamp: "2026-02-08T..."
}
```

## Supported Assets

| Asset | Min Amount | Decimals | Pool Contract |
|-------|-----------|----------|---------------|
| STX   | 1 STX     | 6        | veilpay       |
| USDCx | 1 USDCx   | 6        | veilpay-usdcx |
| sBTC  | 0.0001 BTC| 8        | veilpay-sbtc  |

## x402scan Registration

VeilPay x402 provides a schema endpoint for x402scan registration:

```bash
GET /x402/schema
```

**Response:** x402 V2 schema with:
- Service metadata
- Supported assets (STX, USDCx, sBTC)
- Available endpoints
- Privacy features
- Integration examples

## Example Endpoints

VeilPay relayer includes demo endpoints showcasing different assets:

### 1. Demo Content (1 STX)

```bash
GET /x402/demo
Payment: 1 STX
Privacy: Supported
```

### 2. Premium Content (5 USDCx)

```bash
GET /x402/content/:contentId
Payment: 5 USDCx
Privacy: Supported
```

### 3. Paid API Execution (0.0001 BTC)

```bash
POST /x402/api/execute
Payment: 0.0001 BTC (sBTC)
Privacy: Supported
Body: { "operation": "compute", "params": {...} }
```

## Environment Configuration

Required environment variables in `.env`:

```bash
# x402 Configuration
X402_BASE_URL=https://api.veilpay.dev
X402_FACILITATOR_URL=https://facilitator.veilpay.dev
VENDOR_ADDRESS=ST1VENDOR...

# Multi-Asset Contracts
STX_CONTRACT_TESTNET=ST2...veilpay
USDCX_CONTRACT_TESTNET=ST2...veilpay-usdcx
SBTC_CONTRACT_TESTNET=ST2...veilpay-sbtc

# Token Contracts
USDCX_TOKEN_TESTNET=ST1...usdcx
SBTC_TOKEN_TESTNET=ST1...sbtc
```

## Privacy Guarantees

### What VeilPay Hides

✅ **Sender Identity**: No one knows who made the payment
✅ **Linking**: Cannot correlate deposit → withdrawal
✅ **Transaction Graph**: Breaks on-chain analysis
✅ **Anonymity Set**: All deposits in the pool

### What VeilPay Does NOT Hide

❌ **Amount**: Payment amounts are currently visible
❌ **Recipient**: Vendor address is public
❌ **Timing**: Timing correlation may leak information

**Recommended:** Use Tor/VPN when interacting with VeilPay relayer

## How Privacy Works

1. **Deposit**: User generates secret and commitment `C = Poseidon(secret, amount, nonce)`
2. **Pool**: Commitment added to Merkle tree with all other deposits
3. **Withdrawal**: User generates ZK proof proving:
   - "I know a secret for some commitment in the tree"
   - "This nullifier hasn't been used before"
   - WITHOUT revealing which commitment or the secret
4. **Verification**: Relayer verifies proof off-chain, signs, submits to contract
5. **Payment**: Contract checks signature and nullifier, releases funds to vendor

**Zero-Knowledge**: Vendor receives payment but cannot identify which deposit it came from.

## Testing

### 1. Start Relayer

```bash
cd relayer
npm install
node src/index.js
```

### 2. Test x402 Schema

```bash
curl http://localhost:3001/x402/schema | jq
```

### 3. Test Demo Endpoint (Standard x402)

```bash
curl http://localhost:3001/x402/demo
# Returns: 402 Payment Required
```

### 4. Test with VeilPay Privacy

```bash
# First, make a deposit to VeilPay pool
# Then generate ZK proof
# Finally:

curl -X GET http://localhost:3001/x402/demo \
  -H "x-veilpay-proof: <base64_proof>" \
  -H "x-veilpay-nullifier: <nullifier_hash>"

# Returns: { "success": true, "content": "..." }
```

## Deployment

### 1. Deploy Smart Contracts

```bash
cd contracts
node deploy-x402.js
```

This deploys:
- `veilpay-usdcx.clar` (USDCx privacy pool)
- `veilpay-sbtc.clar` (sBTC privacy pool)

### 2. Initialize Contracts

```bash
# Call initialize function with relayer public key
clarinet console
(contract-call? .veilpay-usdcx initialize <relayer-pubkey>)
(contract-call? .veilpay-sbtc initialize <relayer-pubkey>)
```

### 3. Update Environment

Update `.env` with deployed contract addresses:

```bash
USDCX_CONTRACT_TESTNET=ST2...veilpay-usdcx
SBTC_CONTRACT_TESTNET=ST2...veilpay-sbtc
```

### 4. Start Relayer

```bash
cd relayer
npm install
npm start
```

### 5. Register on x402scan

Submit schema to https://scan.stacksx402.com:

```bash
curl -X POST https://scan.stacksx402.com/register \
  -H "Content-Type: application/json" \
  -d "$(curl http://localhost:3001/x402/schema)"
```

## Hackathon Submission

### Eligible Bounties

1. **x402 Challenge ($3K)**: First privacy-enabled x402 implementation
2. **USDCx Bounty ($3K)**: USDCx privacy pool with x402
3. **sBTC Bounty ($3K)**: First-ever Bitcoin privacy on Stacks
4. **Main Hackathon (up to $6K)**: Composable multi-asset privacy protocol

**Total Potential: $15K**

### Innovation Highlights

- ✨ **First x402 + Privacy Integration**: Combines programmatic payments with ZK privacy
- ✨ **Multi-Asset from Day One**: STX, USDCx, sBTC support
- ✨ **Backward Compatible**: Standard x402 still works
- ✨ **Bitcoin Privacy on Stacks**: First implementation of private Bitcoin transfers via sBTC
- ✨ **Production Ready**: Complete implementation with docs, tests, deployment scripts

### Demo Video Script

See `ARCHITECTURE-x402.md` section 19 for complete 5-minute video scripts for both hackathons.

## Resources

- **x402 Specification**: https://x402.org
- **x402-stacks Docs**: https://docs.stacksx402.com
- **VeilPay Architecture**: See `ARCHITECTURE-x402.md`
- **ZK Circuits**: See `circuits/withdraw.circom`
- **Smart Contracts**: See `contracts/veilpay-*.clar`

## Support

- **GitHub**: https://github.com/carlos-israelj/VeilPay
- **Issues**: https://github.com/carlos-israelj/VeilPay/issues
- **Email**: support@veilpay.dev

## License

MIT License - See LICENSE file
