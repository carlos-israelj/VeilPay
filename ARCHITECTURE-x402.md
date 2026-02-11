# VeilPay x402 Multi-Asset — Architecture Document

## x402 Challenge (Feb 9-16) + Buidl Battle (Feb 9 - Mar 31) | Stacks Hackathons

---

## 1. Product Summary

**VeilPay x402** is the first x402-compatible privacy protocol on Stacks, enabling programmatic payments with cryptographic privacy guarantees. Users and AI agents can pay for services via standard HTTP 402 protocol while maintaining complete anonymity through Zero-Knowledge proofs. Supports STX, USDCx, and sBTC for maximum flexibility.

**NEW: Bot-to-Bot Economy** — VeilPay x402 now includes a complete autonomous bot ecosystem where AI agents can hire other specialized bots for analysis, auditing, and intelligence gathering — all with complete payment privacy. This enables the first truly private machine-to-machine commerce network.

### Why it can't exist without both x402 and Zero-Knowledge

On standard x402 implementations, every payment is publicly traceable on-chain — you can see exactly who paid whom for what. VeilPay x402 combines HTTP 402's programmatic payment standard with Groth16 ZK-SNARKs to provide **cryptographic unlinkability**. When you pay for an API or service, the vendor receives payment but has zero knowledge of your identity. Combined with multi-asset support (STX/USDCx/sBTC), this creates the first privacy-preserving payment infrastructure for the x402 ecosystem.

### x402-stacks Three Guarantees

1. **Programmatic Payments** — HTTP 402 Payment Required enables machine-to-machine commerce. AI agents, automated systems, and developers can pay for resources without manual flows or session management.
2. **Standardized Protocol** — x402 is compatible with Coinbase x402 specification (CAIP-2 network identifiers, base64 headers). Interoperable with broader x402 ecosystem.
3. **Production Ready** — Facilitator service handles payment verification and settlement. STX and sBTC native support with minimal latency overhead.

### Target users

- **AI Agents / Autonomous Bots** — Bots that hire other bots for specialized tasks privately
- **DAOs** — Treasury analysis, competitive intelligence, governance research without revealing strategy
- **VCs / Investors** — Due diligence, project analysis without alerting markets
- **Traders** — Signal aggregation, risk assessment without frontrunning
- **Developers** — APIs requiring payment without exposing customer identities
- **Privacy-conscious users** — Crypto holders who want financial confidentiality

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

## 2.5. Bot-to-Bot Economy Architecture

**VeilPay x402 enables the first autonomous AI agent economy with cryptographic privacy.** Bots can hire other specialized bots for tasks like security audits, tokenomics analysis, and sentiment research — with complete payment unlinkability.

### Bot Ecosystem Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS BOT ECONOMY                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │         COORDINATOR BOT (Orquestador)                  │     │
│  │  "Investment Analyzer Bot"                             │     │
│  │                                                         │     │
│  │  • Receives analysis requests from users/DAOs          │     │
│  │  • Deposits STX to VeilPay pool                        │     │
│  │  • Hires 3 specialized worker bots                     │     │
│  │  • Aggregates results into comprehensive report        │     │
│  │                                                         │     │
│  │  Pricing: 10 STX per full analysis                     │     │
│  └────────────┬───────────────┬───────────────┬───────────┘     │
│               │               │               │                  │
│    ┌──────────▼────────┐ ┌───▼────────┐ ┌───▼────────┐        │
│    │  SECURITY BOT     │ │ TOKENOMICS │ │ SENTIMENT  │        │
│    │  (Auditor)        │ │    BOT     │ │    BOT     │        │
│    │                   │ │  (Analyzer)│ │ (Analyzer) │        │
│    │  x402: 5 STX      │ │ x402: 3 STX│ │ x402: 2 STX│        │
│    │  via VeilPay      │ │ via VeilPay│ │ via VeilPay│        │
│    └───────────────────┘ └────────────┘ └────────────┘        │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              VeilPay x402 PRIVACY LAYER (EXISTING)               │
│                                                                  │
│  • ZK Proof Generation (browser/Node.js)                        │
│  • Payment Unlinkability (Poseidon Merkle trees)                │
│  • Multi-Asset Support (STX/USDCx/sBTC)                         │
│  • Nullifier Tracking (double-spend prevention)                 │
│                                                                  │
│  Blockchain shows:                                              │
│  ✅ "Someone paid 5 STX" (Security Bot)                         │
│  ✅ "Someone paid 3 STX" (Tokenomics Bot)                       │
│  ✅ "Someone paid 2 STX" (Sentiment Bot)                        │
│  ❌ NO LINKAGE between the 3 payments                           │
│  ❌ IMPOSSIBLE to know they came from same coordinator          │
└─────────────────────────────────────────────────────────────────┘
```

### Worker Bots Specifications

#### Bot 1: Security Auditor Bot 🔒

**Purpose:** Analyzes Clarity smart contracts for security vulnerabilities

**Pricing:** 5 STX per audit (via x402 + VeilPay)

**Technology Stack:**
- **APIs:**
  - Stacks API (contract source) - FREE
  - OpenAI GPT-3.5-turbo - $0.002/1K tokens
- **Analysis:**
  - Static code analysis (pattern matching)
  - Vulnerability detection (reentrancy, overflow, access control)
  - AI-powered security insights
- **Cost:** $0.01-0.02 per audit with AI

**Input:**
```json
{
  "contractAddress": "ST1ABC...",
  "contractName": "my-defi-protocol",
  "network": "testnet"
}
```

**Output:**
```json
{
  "securityScore": "7.5/10",
  "vulnerabilities": [
    {
      "type": "unchecked-arithmetic",
      "severity": "medium",
      "line": 42,
      "description": "Potential integer overflow in balance calculation"
    },
    {
      "type": "reentrancy-risk",
      "severity": "high",
      "line": 108,
      "description": "External call before state update"
    }
  ],
  "recommendations": [
    "Add SafeMath or bounds checking",
    "Implement reentrancy guard pattern"
  ],
  "aiInsights": "The contract shows medium-high risk due to unchecked arithmetic operations. The most critical issue is the potential reentrancy vulnerability at line 108..."
}
```

**Capabilities:**
- Reentrancy detection
- Integer overflow/underflow
- Access control issues
- State manipulation risks
- Unchecked external calls
- Denial of service vectors

---

#### Bot 2: Tokenomics Analyzer Bot 📊

**Purpose:** Analyzes token economics, supply dynamics, and holder distribution

**Pricing:** 3 STX per analysis (via x402 + VeilPay)

**Technology Stack:**
- **APIs (all FREE):**
  - Stacks API (supply, holders)
  - Coingecko API (prices, market data)
  - DexScreener API (DEX liquidity)
- **Analysis:**
  - Market cap & FDV calculations
  - Holder concentration (Gini coefficient)
  - Liquidity analysis
  - Distribution metrics
- **Cost:** $0 (all free APIs)

**Input:**
```json
{
  "tokenContract": "ST1ABC...alex-token",
  "network": "testnet"
}
```

**Output:**
```json
{
  "metrics": {
    "totalSupply": "1000000000",
    "circulatingSupply": "500000000",
    "price": "$0.05",
    "marketCap": "$25M",
    "fdv": "$50M",
    "holders": 1250,
    "giniCoefficient": 0.65,
    "liquidityUSD": "$500K",
    "liquidityRatio": "2%"
  },
  "analysis": {
    "concentration": "Medium - Top 10 holders own 45%",
    "liquidity": "Good - 2% of market cap in DEX pools",
    "distribution": "Fair - Gini 0.65 indicates moderate inequality",
    "circulation": "50% - Half of supply is circulating"
  },
  "recommendation": "Moderate BUY - Good liquidity, moderate concentration",
  "riskLevel": "Medium"
}
```

**Capabilities:**
- Total/circulating supply analysis
- Holder distribution & concentration
- Price tracking & market cap
- DEX liquidity analysis
- Token velocity calculations
- Whale wallet tracking

---

#### Bot 3: Sentiment Analyzer Bot 📱

**Purpose:** Analyzes project sentiment via development activity, on-chain metrics, and news

**Pricing:** 2 STX per report (via x402 + VeilPay)

**Technology Stack:**
- **APIs:**
  - GitHub API (dev activity) - FREE (5000 req/hr)
  - Stacks API (on-chain activity) - FREE
  - CryptoPanic API (news) - FREE (50 req/day)
  - OpenAI GPT-3.5-turbo - $0.002/1K tokens
- **Analysis:**
  - Development velocity
  - On-chain transaction patterns
  - News sentiment (AI-powered)
  - Community activity scoring
- **Cost:** $0.01-0.02 per analysis with AI

**Input:**
```json
{
  "projectName": "alex-protocol",
  "githubRepo": "alexgo-io/alex-v1",
  "tokenContract": "ST1ABC...alex",
  "network": "testnet"
}
```

**Output:**
```json
{
  "developmentActivity": {
    "commits30d": 145,
    "prs30d": 23,
    "openIssues": 12,
    "contributors": 8,
    "lastCommit": "2 hours ago",
    "score": "High",
    "trend": "Increasing"
  },
  "onChainActivity": {
    "txVolume30d": "$2.5M",
    "activeAddresses": 3200,
    "dailyTxs": 850,
    "score": "Medium-High",
    "trend": "Stable"
  },
  "newsSentiment": {
    "positive": 12,
    "neutral": 8,
    "negative": 2,
    "score": "Positive",
    "recentHeadlines": [
      "ALEX Protocol announces new liquidity incentives",
      "Trading volume up 45% this week"
    ],
    "aiSummary": "Overall sentiment is bullish with strong development momentum and positive community reception to recent announcements..."
  },
  "overallSentiment": "Bullish",
  "confidence": "75%",
  "recommendation": "Positive outlook - strong dev activity and community sentiment"
}
```

**Capabilities:**
- GitHub commit/PR tracking
- Development team analysis
- On-chain transaction monitoring
- Active address tracking
- News aggregation & sentiment
- AI-powered text analysis
- Community engagement scoring

---

### Coordinator Bot: Investment Analyzer

**Purpose:** Orchestrates the 3 worker bots to provide comprehensive project analysis

**Pricing:** 10 STX per full analysis (pays 10 STX to workers, keeps profit via margin)

**Flow:**

```javascript
async function analyzeProject(projectData) {
  // 1. Coordinator deposits 10 STX to VeilPay pool
  const { secret, nonce } = await veilpayDeposit(10, 'STX');

  // 2. Create private x402 client
  const privateClient = createPrivateX402Client(secret, nonce, 'STX');

  // 3. Hire Security Bot (5 STX via VeilPay ZK proof)
  const securityReport = await privateClient.post(
    'http://security-bot:4001/audit',
    {
      contractAddress: projectData.contractAddress,
      contractName: projectData.contractName
    }
  );
  // Blockchain shows: "Someone paid 5 STX" (unlinkable)

  // 4. Hire Tokenomics Bot (3 STX via VeilPay ZK proof)
  const tokenomicsReport = await privateClient.post(
    'http://tokenomics-bot:4002/analyze',
    { tokenContract: projectData.tokenContract }
  );
  // Blockchain shows: "Someone paid 3 STX" (unlinkable to #3)

  // 5. Hire Sentiment Bot (2 STX via VeilPay ZK proof)
  const sentimentReport = await privateClient.post(
    'http://sentiment-bot:4003/analyze',
    {
      projectName: projectData.projectName,
      githubRepo: projectData.githubRepo
    }
  );
  // Blockchain shows: "Someone paid 2 STX" (unlinkable to #3 & #4)

  // 6. Aggregate results
  return {
    timestamp: new Date().toISOString(),
    project: projectData.projectName,
    security: securityReport.data,
    tokenomics: tokenomicsReport.data,
    sentiment: sentimentReport.data,
    overallScore: calculateOverallScore(
      securityReport.data.securityScore,
      tokenomicsReport.data.riskLevel,
      sentimentReport.data.overallSentiment
    ),
    recommendation: generateFinalRecommendation(...),
    privacyGuarantee: "✅ All 3 bot payments cryptographically unlinkable",
    costBreakdown: {
      security: "5 STX",
      tokenomics: "3 STX",
      sentiment: "2 STX",
      total: "10 STX",
      aiCost: "$0.05-0.07"
    }
  };
}
```

**Output Example:**

```json
{
  "project": "ALEX Protocol",
  "timestamp": "2026-02-10T15:30:00Z",
  "security": {
    "score": "7.5/10",
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 2
  },
  "tokenomics": {
    "marketCap": "$25M",
    "holders": 1250,
    "concentration": "Medium",
    "liquidity": "Good"
  },
  "sentiment": {
    "overall": "Bullish",
    "devActivity": "High",
    "community": "Positive"
  },
  "overallScore": "8.2/10",
  "recommendation": "BUY - Strong fundamentals with minor security concerns. High development activity and positive market sentiment. Address medium-severity vulnerabilities before major deployment.",
  "investmentThesis": "ALEX shows strong tokenomics and community support. Security audit reveals manageable risks that should be addressed. Overall a solid investment with 8.2/10 score.",
  "privacyGuarantee": "✅ All 3 bot payments are cryptographically unlinkable on-chain. No observer can determine that Security, Tokenomics, and Sentiment bots were hired by the same coordinator.",
  "costBreakdown": {
    "security": "5 STX ($5)",
    "tokenomics": "3 STX ($3)",
    "sentiment": "2 STX ($2)",
    "total": "10 STX ($10)",
    "aiCost": "$0.06 (GPT-3.5-turbo)"
  }
}
```

### Privacy Guarantees

**What's Hidden:**
- ✅ Which coordinator hired which worker bot
- ✅ How many bots a coordinator is using
- ✅ What project is being analyzed (bots see data, blockchain doesn't)
- ✅ Coordinator's identity/wallet address
- ✅ Correlation between multiple bot hires

**What's Public:**
- ❌ "Someone paid 5 STX to Security Bot" (visible)
- ❌ "Someone paid 3 STX to Tokenomics Bot" (visible)
- ❌ "Someone paid 2 STX to Sentiment Bot" (visible)
- ✅ **BUT:** No linkage between these 3 payments (cryptographically guaranteed)

**Attack Resistance:**
- **Transaction graph analysis:** IMPOSSIBLE (ZK proofs break linkability)
- **Timing correlation:** MITIGATED (nullifiers used at different times)
- **Amount-based tracking:** MITIGATED (common denominations)
- **IP tracking:** Use Tor/VPN (standard privacy practice)

### Cost Structure (Heavy AI Usage)

| Component | Free APIs | AI Processing | Total per Call | 100 Calls |
|-----------|-----------|---------------|----------------|-----------|
| **Security Bot** | $0 | $0.01-0.02 | $0.01-0.02 | $1-2 |
| **Tokenomics Bot** | $0 | $0 (no AI) | $0 | $0 |
| **Sentiment Bot** | $0 | $0.02-0.03 | $0.02-0.03 | $2-3 |
| **Coordinator** (aggregation) | $0 | $0.02 | $0.02 | $2 |
| **TOTAL per workflow** | $0 | $0.05-0.07 | **$0.05-0.07** | **$5-7** |

**For 100 complete analyses:**
- AI Cost: $5-7
- Bot payments: 1000 STX ($1000) revenue
- **Profit margin: 99.3%** (AI costs are negligible vs payment revenue)

### Bot Registry & Discovery

**Bot Registry Contract (Future):**
```clarity
;; bot-registry.clar
(define-map registered-bots
  { bot-id: (string-ascii 50) }
  {
    name: (string-ascii 100),
    endpoint: (string-ascii 200),
    price-stx: uint,
    capabilities: (list 10 (string-ascii 50)),
    reputation-score: uint,
    total-jobs: uint
  }
)

;; Register a new bot
(define-public (register-bot (bot-id (string-ascii 50)) (details {...}))
  ;; Bot operator registers their service
  ;; Pays registration fee
  ;; Gets listed in discoverable registry
)

;; Get bot details
(define-read-only (get-bot (bot-id (string-ascii 50)))
  (map-get? registered-bots { bot-id: bot-id })
)
```

**Discovery API:**
```javascript
// GET /bots/discover
{
  "bots": [
    {
      "id": "security-auditor-v1",
      "name": "Security Auditor Bot",
      "category": "security",
      "endpoint": "https://security-bot.veilpay.xyz",
      "pricing": {
        "asset": "STX",
        "amount": "5000000",
        "description": "5 STX per audit"
      },
      "capabilities": [
        "reentrancy-detection",
        "overflow-detection",
        "access-control-analysis"
      ],
      "reputation": 4.8,
      "totalJobs": 342,
      "supportsVeilPay": true,
      "privacyEnabled": true
    },
    {
      "id": "tokenomics-analyzer-v1",
      "name": "Tokenomics Analyzer Bot",
      "category": "analytics",
      "endpoint": "https://tokenomics-bot.veilpay.xyz",
      "pricing": {
        "asset": "STX",
        "amount": "3000000",
        "description": "3 STX per analysis"
      },
      "capabilities": [
        "supply-analysis",
        "holder-distribution",
        "liquidity-tracking"
      ],
      "reputation": 4.9,
      "totalJobs": 567,
      "supportsVeilPay": true,
      "privacyEnabled": true
    }
  ]
}
```

### Use Cases

#### Use Case 1: DAO Due Diligence (Privacy Critical)

**Scenario:** MegaDAO wants to analyze 5 potential investment targets without revealing interest

**Traditional Problem:**
```
MegaDAO wallet pays Research Bot for "Project X" analysis
→ On-chain transaction visible
→ Project X team sees DAO interest
→ Price manipulation before deal
→ Other VCs front-run the investment
```

**VeilPay Solution:**
```
MegaDAO uses Coordinator Bot via VeilPay
→ 5 complete analyses (Security + Tokenomics + Sentiment)
→ 15 total bot payments (5 projects × 3 bots)
→ Blockchain shows 15 unlinkable payments
→ IMPOSSIBLE to know MegaDAO is researching these projects
→ IMPOSSIBLE to correlate the 3 bots per project
→ DAO maintains competitive advantage
```

**Value:** Prevents front-running, maintains strategic secrecy

---

#### Use Case 2: VC Competitive Intelligence

**Scenario:** VC Fund evaluates 20 protocols per month

**Cost Comparison:**
```
Manual research:
├── 20 projects × 40 hours × $100/hr = $80,000/month
└── High cost, slow, inconsistent

VeilPay Bot-to-Bot:
├── 20 projects × 10 STX = 200 STX ($200)
├── AI costs: 20 × $0.07 = $1.40
└── Total: $201.40/month (99.7% cost reduction!)
```

**Privacy Benefit:**
- Competitors can't see which protocols VC is researching
- No price impact from public research activity
- Maintains information asymmetry advantage

---

#### Use Case 3: Trader Strategy Execution

**Scenario:** Algorithmic trader uses multiple signal bots

**Traditional Problem:**
```
Trader subscribes to:
├── Whale tracking bot
├── Liquidation alert bot
└── Technical analysis bot

On-chain evidence:
→ All 3 subscriptions visible
→ Front-runners see strategy
→ MEV bots sandwich trades
→ Profit margins erode
```

**VeilPay Solution:**
```
Trader uses Coordinator to hire bots privately
→ Signal aggregation unlinkable
→ No front-running possible
→ Strategy remains confidential
→ Maintains alpha
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
│   ├── veilpay-sbtc.clar       # sBTC privacy pool
│   ├── usdcx-trait.clar        # SIP-010 trait
│   ├── sbtc-trait.clar         # sBTC trait
│   ├── x402-router.clar        # Multi-asset routing (optional)
│   ├── bot-registry.clar       # NEW: Bot registration contract
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
├── bots/                       # 🆕 BOT ECOSYSTEM
│   ├── registry/
│   │   ├── bot-registry.js     # Bot registration system
│   │   ├── bot-discovery.js    # Bot discovery API
│   │   └── bot-types.js        # Bot schemas/interfaces
│   │
│   ├── examples/
│   │   ├── coordinator-bot/    # 🎯 COORDINATOR BOT
│   │   │   ├── index.js        # Main coordinator logic
│   │   │   ├── job-manager.js  # Job assignment
│   │   │   ├── result-aggregator.js  # Aggregate worker results
│   │   │   ├── scoring.js      # Overall score calculation
│   │   │   ├── package.json
│   │   │   └── .env.example    # VeilPay credentials
│   │   │
│   │   └── worker-bots/
│   │       ├── security-bot/   # 🔒 SECURITY AUDITOR
│   │       │   ├── index.js    # Express server (x402 endpoints)
│   │       │   ├── analyzer.js # Static analysis + pattern matching
│   │       │   ├── vulnerability-db.js  # Known vulnerabilities
│   │       │   ├── ai-insights.js  # GPT-3.5 integration (optional)
│   │       │   ├── package.json
│   │       │   └── .env.example  # OpenAI API key
│   │       │
│   │       ├── tokenomics-bot/ # 📊 TOKENOMICS ANALYZER
│   │       │   ├── index.js    # Express server (x402 endpoints)
│   │       │   ├── metrics.js  # Supply, holders, concentration
│   │       │   ├── dex-data.js # DEX liquidity fetcher
│   │       │   ├── calculator.js  # Gini coefficient, etc
│   │       │   ├── package.json
│   │       │   └── .env.example
│   │       │
│   │       └── sentiment-bot/  # 📱 SENTIMENT ANALYZER
│   │           ├── index.js    # Express server (x402 endpoints)
│   │           ├── github-scraper.js  # Dev activity
│   │           ├── onchain-metrics.js # Transaction volume
│   │           ├── news-fetcher.js  # CryptoPanic API
│   │           ├── ai-sentiment.js  # GPT-3.5 news analysis
│   │           ├── package.json
│   │           └── .env.example  # API keys
│   │
│   ├── marketplace/
│   │   ├── bot-marketplace-api.js  # Marketplace backend
│   │   └── bot-catalog.json    # Available bots catalog
│   │
│   └── README.md               # Bot development guide
│
├── relayer/                    # Node.js Relayer
│   ├── src/
│   │   ├── index.js            # Express server
│   │   ├── x402/
│   │   │   ├── handlers.js     # x402 endpoints (existing)
│   │   │   ├── middleware.js   # VeilPay x402 middleware
│   │   │   ├── bot-endpoints.js  # 🆕 Bot-specific routes
│   │   │   ├── bot-payment-tracker.js  # 🆕 Track bot payments
│   │   │   ├── schema.js       # x402scan schema
│   │   │   └── scan-schema.js  # x402scan registration
│   │   ├── merkle.js           # Merkle tree (Poseidon)
│   │   ├── verifier.js         # ZK proof verification
│   │   ├── indexer.js          # Blockchain events
│   │   ├── stacks-client.js    # Transaction builder
│   │   ├── multi-asset.js      # Asset routing
│   │   └── signer.js           # Relayer signatures
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.jsx             # Main app (updated with bot tabs)
│   │   ├── components/
│   │   │   ├── Deposit.jsx
│   │   │   ├── Withdraw.jsx
│   │   │   ├── X402Demo.jsx
│   │   │   ├── AssetSelector.jsx
│   │   │   ├── PrivacyBadge.jsx
│   │   │   ├── BotMarketplace.jsx  # 🆕 Bot marketplace UI
│   │   │   ├── BotCard.jsx         # 🆕 Individual bot display
│   │   │   ├── CoordinatorDashboard.jsx  # 🆕 Job management
│   │   │   ├── BotPaymentHistory.jsx  # 🆕 Payment tracking
│   │   │   └── TransactionGraph.jsx   # 🆕 Privacy visualization
│   │   ├── utils/
│   │   │   ├── crypto.js       # Poseidon hash
│   │   │   ├── proof.js        # ZK proof generation
│   │   │   └── x402-client.js  # x402 integration
│   │   └── main.jsx
│   ├── public/
│   │   └── circuits/
│   │       ├── withdraw.wasm
│   │       └── withdraw_final.zkey
│   └── package.json
│
├── docs/
│   ├── API.md                  # x402 API docs
│   ├── INTEGRATION.md          # Integration guide
│   ├── BOT-DEVELOPER-GUIDE.md  # 🆕 How to build bots
│   ├── BOT-TO-BOT-API.md       # 🆕 Bot-to-bot API reference
│   ├── BOT-EXAMPLES.md         # 🆕 Code examples
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

### Bots (.env) — NEW

**Security Bot:**
```env
PORT=4001
OPENAI_API_KEY=sk-...  # Optional for AI insights
USE_AI=true  # Set to false for $0 cost
STACKS_NETWORK=testnet
```

**Tokenomics Bot:**
```env
PORT=4002
COINGECKO_API_KEY=  # Optional (free tier works)
DEXSCREENER_API_KEY=  # Optional (free tier works)
STACKS_NETWORK=testnet
```

**Sentiment Bot:**
```env
PORT=4003
GITHUB_TOKEN=ghp_...  # GitHub personal access token (free)
CRYPTOPANIC_API_KEY=  # Free tier: 50 req/day
OPENAI_API_KEY=sk-...  # Optional for AI news analysis
USE_AI=true
STACKS_NETWORK=testnet
```

**Coordinator Bot:**
```env
PORT=4000
VEILPAY_SECRET=...  # Saved from VeilPay deposit
VEILPAY_NONCE=...   # Saved from VeilPay deposit
VEILPAY_ASSET=STX   # STX | USDCx | sBTC

# Worker bot endpoints
SECURITY_BOT_URL=http://localhost:4001
TOKENOMICS_BOT_URL=http://localhost:4002
SENTIMENT_BOT_URL=http://localhost:4003

# VeilPay relayer
RELAYER_URL=http://localhost:3001
STACKS_NETWORK=testnet
```

---

## 13. Key Dependencies

### Core VeilPay Dependencies

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
    "@stacks/network": "^7.0",
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

### Bot-Specific Dependencies (NEW)

**All Bots:**
```json
{
  "dependencies": {
    "express": "^4.18",
    "axios": "^1.6",
    "dotenv": "^16.0",
    "@stacks/transactions": "^7.0",
    "@stacks/network": "^7.0"
  }
}
```

**Security Bot (additional):**
```json
{
  "dependencies": {
    "openai": "^4.20.0"  // Optional for AI insights ($0.002/1K tokens)
  }
}
```

**Tokenomics Bot (additional):**
```json
{
  "dependencies": {
    "node-fetch": "^3.3"  // For API calls (free)
  }
}
```

**Sentiment Bot (additional):**
```json
{
  "dependencies": {
    "@octokit/rest": "^20.0",  // GitHub API (free)
    "openai": "^4.20.0"  // Optional for news analysis ($0.002/1K tokens)
  }
}
```

**Coordinator Bot (additional):**
```json
{
  "dependencies": {
    "veilpay-x402": "file:../../frontend/src/utils/x402-client.js"  // VeilPay client
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

### Bot-to-Bot Ecosystem Costs (NEW)

| Component | Cost per Analysis | 100 Analyses | Notes |
|-----------|-------------------|--------------|-------|
| **Security Bot** (with AI) | $0.01-0.02 | $1-2 | GPT-3.5 insights |
| **Tokenomics Bot** | $0 | $0 | Free APIs only |
| **Sentiment Bot** (with AI) | $0.02-0.03 | $2-3 | GPT-3.5 news analysis |
| **Coordinator** (aggregation) | $0.02 | $2 | Report generation |
| **TOTAL per workflow** | **$0.05-0.07** | **$5-7** | Heavy AI usage |

**Revenue Model:**
- Coordinator charges: 10 STX (~$10)
- AI costs: $0.05-0.07
- **Profit margin: 99.3%**

**Deployment Costs:**
- 3 Worker Bots on Render: $0 (free tier) or $21/month (3 × $7)
- Coordinator Bot on Render: $0 (free tier) or $7/month
- **Total hosting: $0-28/month**

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
