# VeilPay Relayer API Documentation

## Base URL

```
http://localhost:3001  (development)
https://veilpay-relayer.onrender.com  (production)
```

## Table of Contents

- [Core Privacy Endpoints](#core-privacy-endpoints)
- [Bot Marketplace Endpoints](#bot-marketplace-endpoints)
- [x402 Payment Protocol](#x402-payment-protocol)
- [Error Codes](#error-codes)
- [Client Examples](#client-examples)

---

## Core Privacy Endpoints

### Health Check

**GET** `/health`

Check if the relayer is running.

**Response**
```json
{
  "status": "ok",
  "service": "veilpay-relayer"
}
```

---

### Get Current Merkle Root

**GET** `/root`

Get the current Merkle root of all deposits.

**Response**
```json
{
  "root": "0x1234567890abcdef..."
}
```

---

### Get Merkle Proof

**GET** `/proof/:commitment`

Get the Merkle proof for a specific commitment.

**Parameters**
- `commitment` (string): The commitment hash (hex)

**Response**
```json
{
  "proof": {
    "pathElements": ["0x1234...", "0x5678...", ...],
    "pathIndices": [0, 1, 0, ...],
    "root": "0xabcd...",
    "leaf": "0x9876..."
  }
}
```

---

### Submit Withdrawal

**POST** `/withdraw`

Submit a withdrawal request with ZK proof.

**Request Body**
```json
{
  "proof": { /* Groth16 proof object */ },
  "publicSignals": ["root", "nullifierHash", "recipient"],
  "nullifierHash": "0x1234...",
  "recipient": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "amount": "1000000",
  "root": "0xabcd..."
}
```

**Response**
```json
{
  "success": true,
  "txid": "0x789abc...",
  "message": "Withdrawal submitted successfully"
}
```

---

### Get Relayer Stats

**GET** `/stats`

Get statistics about the relayer and pool.

**Response**
```json
{
  "totalDeposits": 156,
  "currentRoot": "0x1234...",
  "relayerAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
}
```

---

## Bot Marketplace Endpoints

### List Available Bots

**GET** `/x402/bots`

Get list of all available analysis bots.

**Response**
```json
{
  "status": "success",
  "bots": [
    {
      "id": "security",
      "name": "Security Bot",
      "description": "AI-powered smart contract security auditing",
      "pricing": {
        "STX": "5000000",
        "USDCx": "5000000",
        "sBTC": "5000"
      },
      "endpoint": "/x402/bots/security/audit",
      "features": [
        "Static vulnerability scanning",
        "Reentrancy detection",
        "Access control analysis",
        "AI-powered insights"
      ],
      "estimatedTime": "~30s"
    },
    {
      "id": "tokenomics",
      "name": "Tokenomics Bot",
      "description": "Token metrics and liquidity analysis",
      "pricing": {
        "STX": "3000000",
        "USDCx": "3000000",
        "sBTC": "3000"
      },
      "endpoint": "/x402/bots/tokenomics/analyze",
      "features": [
        "SIP-010 token analysis",
        "Holder distribution",
        "DEX liquidity metrics"
      ],
      "estimatedTime": "~20s"
    },
    {
      "id": "sentiment",
      "name": "Sentiment Bot",
      "description": "Multi-source project sentiment analysis",
      "pricing": {
        "STX": "2000000",
        "USDCx": "2000000",
        "sBTC": "2000"
      },
      "endpoint": "/x402/bots/sentiment/analyze",
      "features": [
        "GitHub activity tracking",
        "On-chain metrics",
        "News sentiment",
        "AI synthesis"
      ],
      "estimatedTime": "~25s"
    },
    {
      "id": "coordinator",
      "name": "Coordinator Bot",
      "description": "Full project analysis via all worker bots",
      "pricing": {
        "STX": "10000000",
        "USDCx": "10000000",
        "sBTC": "10000"
      },
      "endpoint": "/x402/bots/coordinator/analyze",
      "features": [
        "Security audit",
        "Tokenomics analysis",
        "Sentiment tracking",
        "Investment recommendation"
      ],
      "estimatedTime": "~2min"
    }
  ]
}
```

---

### Security Bot Audit

**POST** `/x402/bots/security/audit`

AI-powered smart contract security analysis.

**Payment Required:** 5 STX (or 5 USDCx / 0.00005 sBTC)

**Request Body**
```json
{
  "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contractName": "my-contract",
  "fullAnalysis": true
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "audit": {
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "my-contract",
    "staticAnalysis": {
      "riskScore": 25,
      "riskLevel": "MEDIUM",
      "findings": [
        {
          "severity": "MEDIUM",
          "category": "Access Control",
          "description": "Contract owner has unrestricted minting capability",
          "line": 42,
          "recommendation": "Add multi-sig or governance controls"
        }
      ],
      "metrics": {
        "totalLines": 250,
        "publicFunctions": 12,
        "privateFunctions": 5,
        "readOnlyFunctions": 8
      }
    },
    "aiInsights": {
      "overallAssessment": "The contract demonstrates good security practices...",
      "criticalIssues": [],
      "recommendations": [
        "Consider implementing rate limiting",
        "Add emergency pause mechanism"
      ],
      "strengths": [
        "Good input validation",
        "Clear error handling"
      ],
      "weaknesses": [
        "Centralized control"
      ]
    },
    "executiveSummary": {
      "summary": "Medium-risk smart contract with standard security controls",
      "keyFindings": "Primary concern is centralized minting capability",
      "recommendation": "Safe for deployment with recommended improvements"
    }
  },
  "payment": {
    "method": "veilpay-zk",
    "asset": "STX",
    "amount": "5000000",
    "nullifierHash": "0x1234..."
  },
  "completedAt": "2026-02-10T12:34:56.789Z"
}
```

**Response (Payment Required - 402)**
```json
{
  "error": "Payment required",
  "paymentRequired": {
    "amount": "5000000",
    "currency": "STX",
    "acceptedMethods": ["veilpay-zk", "standard-x402"],
    "paymentAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  }
}
```

---

### Tokenomics Bot Analysis

**POST** `/x402/bots/tokenomics/analyze`

SIP-010 token metrics and liquidity analysis.

**Payment Required:** 3 STX (or 3 USDCx / 0.00003 sBTC)

**Request Body**
```json
{
  "tokenContract": "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx",
  "tokenSymbol": "STX"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "analysis": {
    "tokenContract": "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx",
    "tokenSymbol": "STX",
    "overallScore": 78,
    "tokenMetrics": {
      "totalSupply": "1000000000000",
      "holderCount": 1250,
      "topHolderConcentration": 35.5,
      "healthScore": 75
    },
    "liquidityData": {
      "totalLiquidityUSD": 2500000,
      "majorPools": [
        {
          "dex": "Velar",
          "pair": "STX/USDC",
          "liquidityUSD": 1500000,
          "volume24h": 250000
        }
      ],
      "liquidityScore": 80
    }
  },
  "payment": {
    "method": "veilpay-zk",
    "asset": "STX",
    "amount": "3000000"
  },
  "completedAt": "2026-02-10T12:34:56.789Z"
}
```

---

### Sentiment Bot Analysis

**POST** `/x402/bots/sentiment/analyze`

Multi-source project sentiment analysis.

**Payment Required:** 2 STX (or 2 USDCx / 0.00002 sBTC)

**Request Body**
```json
{
  "projectName": "VeilPay",
  "githubUrl": "https://github.com/carlos-israelj/VeilPay",
  "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contractName": "veilpay",
  "tokenSymbol": "STX"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "sentiment": {
    "projectName": "VeilPay",
    "overallScore": 85,
    "github": {
      "stars": 150,
      "forks": 25,
      "recentCommits": 45,
      "contributors": 3,
      "healthScore": 82
    },
    "onChain": {
      "deploymentAge": "30 days",
      "transactionCount": 250,
      "uniqueUsers": 80,
      "activityScore": 75
    },
    "news": {
      "articles": [
        {
          "title": "VeilPay Launches Privacy Protocol",
          "sentiment": "positive",
          "source": "CryptoPanic"
        }
      ],
      "sentimentScore": 90
    },
    "aiSentiment": {
      "overall": "positive",
      "summary": "Strong technical fundamentals with active development",
      "confidence": "High"
    }
  },
  "payment": {
    "method": "veilpay-zk",
    "asset": "STX",
    "amount": "2000000"
  },
  "completedAt": "2026-02-10T12:34:56.789Z"
}
```

---

### Coordinator Bot Full Analysis

**POST** `/x402/bots/coordinator/analyze`

Comprehensive project analysis using all worker bots.

**Payment Required:** 10 STX (or 10 USDCx / 0.0001 sBTC)

**Request Body**
```json
{
  "projectName": "VeilPay",
  "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "contractName": "veilpay",
  "tokenSymbol": "STX",
  "githubUrl": "https://github.com/carlos-israelj/VeilPay"
}
```

**Response (Success - 200 OK)**
```json
{
  "status": "success",
  "overallScore": 85,
  "recommendation": {
    "action": "Strong Buy",
    "rationale": "Excellent security fundamentals, strong tokenomics, positive sentiment",
    "confidence": "High",
    "riskLevel": "Low"
  },
  "detailedResults": {
    "security": {
      "riskScore": 15,
      "riskLevel": "LOW",
      "findings": [],
      "summary": "Well-secured contract with no critical vulnerabilities"
    },
    "tokenomics": {
      "overallScore": 82,
      "healthScore": 80,
      "liquidityScore": 85,
      "summary": "Healthy token distribution with good liquidity"
    },
    "sentiment": {
      "overallScore": 88,
      "githubScore": 85,
      "onChainScore": 78,
      "newsScore": 92,
      "summary": "Very positive community and market sentiment"
    }
  },
  "payment": {
    "method": "veilpay-zk",
    "asset": "STX",
    "amount": "10000000",
    "breakdown": {
      "securityBot": "5000000",
      "tokenomicsBot": "3000000",
      "sentimentBot": "2000000"
    }
  },
  "completedAt": "2026-02-10T12:34:56.789Z"
}
```

---

### Bot Payment Statistics

**GET** `/x402/stats`

Get bot marketplace payment statistics.

**Response**
```json
{
  "status": "success",
  "stats": {
    "totalPayments": 156,
    "totalRevenue": {
      "STX": "850000000",
      "USDCx": "120000000",
      "sBTC": "50000"
    },
    "botUsage": {
      "security": 45,
      "tokenomics": 38,
      "sentiment": 52,
      "coordinator": 21
    }
  },
  "recentPayments": [
    {
      "id": "pay_123456",
      "botType": "security",
      "asset": "STX",
      "amount": "5000000",
      "paymentMethod": "veilpay-zk",
      "timestamp": "2026-02-10T12:00:00.000Z"
    }
  ],
  "marketplace": "VeilPay Bot-to-Bot Economy"
}
```

---

## x402 Payment Protocol

VeilPay supports two payment methods for bot services:

### Standard x402 Payment

Direct wallet payment with HTTP 402 status code:

1. Client calls bot endpoint without payment
2. Server returns `402 Payment Required` with payment details
3. Client initiates Stacks transaction
4. Client retries request with transaction proof
5. Server verifies payment and executes analysis

### VeilPay ZK-SNARK Payment

Private payment via Zero-Knowledge proofs:

1. User deposits STX/USDCx/sBTC to VeilPay pool (one-time)
2. User receives `(secret, nonce)` credentials
3. User generates ZK proof for payment amount
4. User calls bot with proof in headers:
   ```
   X-Payment-Proof: {groth16_proof}
   X-Payment-Signals: {public_signals}
   X-Payment-Nullifier: {nullifier_hash}
   X-Payment-Root: {merkle_root}
   X-Payment-Method: veilpay-zk
   ```
5. Relayer verifies ZK proof off-chain
6. Bot executes analysis - completely private!

**Privacy Guarantee:** No correlation between user deposits and bot payments. Even the bot cannot determine which user paid.

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid proof or parameters |
| 402  | Payment Required - Bot service requires payment |
| 404  | Not Found - Commitment not found / Bot not found |
| 409  | Conflict - Nullifier already used (double-spend attempt) |
| 500  | Internal Server Error |
| 504  | Gateway Timeout - Bot analysis timeout (>2 min) |

---

## Client Examples

### Privacy Pool Usage

```javascript
import axios from 'axios';

const relayer = axios.create({
  baseURL: 'http://localhost:3001'
});

// Get merkle proof
const { data } = await relayer.get(`/proof/${commitment}`);

// Submit withdrawal
await relayer.post('/withdraw', {
  proof,
  publicSignals,
  nullifierHash,
  recipient,
  amount,
  root
});
```

---

### Bot Marketplace - Standard Payment

```javascript
import axios from 'axios';

const relayer = axios.create({
  baseURL: 'https://veilpay-relayer.onrender.com'
});

// Hire Security Bot with standard x402 payment
try {
  const response = await relayer.post('/x402/bots/security/audit', {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'my-contract',
    fullAnalysis: true
  });

  console.log('Security audit:', response.data);

} catch (error) {
  if (error.response?.status === 402) {
    // Payment required - handle x402 flow
    const paymentInfo = error.response.data.paymentRequired;
    console.log(`Payment of ${paymentInfo.amount} ${paymentInfo.currency} required`);

    // Initiate Stacks payment transaction
    // ... handle payment flow ...
  }
}
```

---

### Bot Marketplace - Private VeilPay Payment

```javascript
import { createPrivateX402Client } from './utils/x402-client';

// Step 1: User deposits STX to VeilPay pool (one-time)
// Receive secret and nonce from deposit

// Step 2: Create private payment client
const secret = '12345678901234567890'; // From VeilPay deposit
const nonce = '98765432109876543210';  // From VeilPay deposit
const asset = 'STX';

const privateClient = createPrivateX402Client(secret, nonce, asset);

// Step 3: Hire Security Bot with ZK proof payment (fully private!)
const auditResult = await privateClient.post('/x402/bots/security/audit', {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'my-contract',
  fullAnalysis: true
});

console.log('Private audit complete:', auditResult.data);

// No transaction correlation! Bot cannot determine which user paid.
```

---

### Bot Marketplace - List All Bots

```javascript
import axios from 'axios';

const relayer = axios.create({
  baseURL: 'https://veilpay-relayer.onrender.com'
});

// Get all available bots
const { data } = await relayer.get('/x402/bots');

console.log('Available bots:', data.bots);

data.bots.forEach(bot => {
  console.log(`${bot.name}: ${bot.pricing.STX / 1000000} STX - ${bot.description}`);
});

// Output:
// Security Bot: 5 STX - AI-powered smart contract security auditing
// Tokenomics Bot: 3 STX - Token metrics and liquidity analysis
// Sentiment Bot: 2 STX - Multi-source project sentiment analysis
// Coordinator Bot: 10 STX - Full project analysis via all worker bots
```

---

### Bot Marketplace - Coordinator Bot Full Analysis

```javascript
import { createPrivateX402Client } from './utils/x402-client';

// Use private payment for comprehensive analysis
const privateClient = createPrivateX402Client(secret, nonce, 'STX');

// Hire Coordinator Bot (runs Security + Tokenomics + Sentiment)
const fullAnalysis = await privateClient.post('/x402/bots/coordinator/analyze', {
  projectName: 'VeilPay',
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'veilpay',
  tokenSymbol: 'STX',
  githubUrl: 'https://github.com/carlos-israelj/VeilPay'
});

console.log('Overall Score:', fullAnalysis.data.overallScore);
console.log('Recommendation:', fullAnalysis.data.recommendation.action);
console.log('Security:', fullAnalysis.data.detailedResults.security.summary);
console.log('Tokenomics:', fullAnalysis.data.detailedResults.tokenomics.summary);
console.log('Sentiment:', fullAnalysis.data.detailedResults.sentiment.summary);

// Example Output:
// Overall Score: 85
// Recommendation: Strong Buy
// Security: Well-secured contract with no critical vulnerabilities
// Tokenomics: Healthy token distribution with good liquidity
// Sentiment: Very positive community and market sentiment
```

---

### Bot-to-Bot Autonomous Payments

```javascript
// Example: DeFi trading bot hiring Tokenomics bot before executing swap

import { VeilPayClient } from './veilpay-client';

class TradingBot {
  constructor(veilpaySecret, veilpayNonce) {
    this.veilpay = new VeilPayClient();
    this.secret = veilpaySecret;
    this.nonce = veilpayNonce;
  }

  async executeSwap(tokenContract) {
    // Step 1: Hire Tokenomics Bot to assess token safety (3 STX private payment)
    const tokenAnalysis = await this.veilpay.callWorkerBot(
      'https://veilpay-relayer.onrender.com',
      '/x402/bots/tokenomics/analyze',
      { tokenContract, tokenSymbol: 'TOKEN' },
      this.secret,
      this.nonce,
      3_000_000 // 3 STX
    );

    // Step 2: Check if token is safe
    if (tokenAnalysis.analysis.overallScore < 50) {
      console.log('Token unsafe - aborting swap');
      return;
    }

    // Step 3: Execute swap
    console.log('Token safe - executing swap');
    // ... swap logic ...

    // Privacy: Bot payment is completely unlinkable from user's identity
  }
}

// Usage
const bot = new TradingBot(userSecret, userNonce);
await bot.executeSwap('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token');
```

---

### Error Handling

```javascript
import axios from 'axios';

const relayer = axios.create({
  baseURL: 'https://veilpay-relayer.onrender.com'
});

try {
  const response = await relayer.post('/x402/bots/security/audit', {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'my-contract'
  });

  console.log('Audit:', response.data);

} catch (error) {
  if (error.response?.status === 402) {
    console.error('Payment required:', error.response.data.paymentRequired);
  } else if (error.response?.status === 400) {
    console.error('Invalid request:', error.response.data.error);
  } else if (error.response?.status === 404) {
    console.error('Bot not found or contract not found');
  } else if (error.response?.status === 504) {
    console.error('Analysis timeout - try again');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## Additional Resources

- **Bot Developer Guide**: [BOT-DEVELOPER-GUIDE.md](./BOT-DEVELOPER-GUIDE.md)
- **x402 Integration**: [X402-INTEGRATION.md](./X402-INTEGRATION.md)
- **GitHub Repository**: https://github.com/carlos-israelj/VeilPay
- **Live Demo**: https://veilpay.lat/
