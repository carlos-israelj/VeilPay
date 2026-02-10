# VeilPay Bot-to-Bot Implementation Roadmap

**Fecha de inicio:** 2026-02-10
**Objetivo:** Implementar ecosistema Bot-to-Bot completo sobre arquitectura VeilPay x402 existente
**Tiempo estimado total:** 40-50 horas (5-7 días full-time)

---

## Estado Actual

### ✅ Completado
- [x] Arquitectura VeilPay x402 base (STX pool)
- [x] Frontend con Deposit/Withdraw/X402Demo
- [x] Relayer con x402 endpoints básicos
- [x] ZK circuits (withdraw.circom)
- [x] Multi-asset support (frontend ready)
- [x] ARCHITECTURE-x402.md actualizado

### ⏳ Pendiente
- [ ] Worker Bots (3)
- [ ] Coordinator Bot
- [ ] x402 bot endpoints en relayer
- [ ] Bot Marketplace UI
- [ ] Smart contracts USDCx/sBTC deployed
- [ ] Testing end-to-end
- [ ] Documentación
- [ ] Video demo

---

## FASE 1: Configuración Base (2-3 horas)

### 1.1 Crear estructura de directorios
**Tiempo:** 15 min
**Archivos a crear:**
```bash
mkdir -p bots/registry
mkdir -p bots/examples/coordinator-bot
mkdir -p bots/examples/worker-bots/security-bot
mkdir -p bots/examples/worker-bots/tokenomics-bot
mkdir -p bots/examples/worker-bots/sentiment-bot
mkdir -p bots/marketplace
mkdir -p docs/bots
```

**Comandos:**
```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay
# Ejecutar mkdir arriba
```

---

### 1.2 Configurar package.json para cada bot
**Tiempo:** 30 min
**Archivos a crear:**
- `bots/examples/worker-bots/security-bot/package.json`
- `bots/examples/worker-bots/tokenomics-bot/package.json`
- `bots/examples/worker-bots/sentiment-bot/package.json`
- `bots/examples/coordinator-bot/package.json`

**Dependencias comunes:**
```json
{
  "name": "veilpay-{bot-name}",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0",
    "@stacks/transactions": "^7.0.0",
    "@stacks/network": "^7.0.0"
  }
}
```

---

### 1.3 Obtener API Keys necesarias
**Tiempo:** 30 min
**APIs a configurar:**

| API | URL | Costo | Pasos |
|-----|-----|-------|-------|
| **OpenAI (GPT-3.5)** | platform.openai.com | $0.002/1K tokens | 1. Sign up<br>2. Create API key<br>3. Add $5-10 credits |
| **GitHub Token** | github.com/settings/tokens | GRATIS | 1. Settings → Developer<br>2. Generate token<br>3. Scope: `repo, read:org` |
| **CryptoPanic** | cryptopanic.com/developers/api | GRATIS (50/day) | 1. Sign up<br>2. Get API key |
| **Coingecko** | coingecko.com/api | GRATIS | No key needed (public) |
| **DexScreener** | dexscreener.com | GRATIS | No key needed (public) |

**Output:** Archivo `.env.example` en cada bot

---

### 1.4 Configurar .env files
**Tiempo:** 15 min
**Archivos a crear:**
```bash
bots/examples/worker-bots/security-bot/.env
bots/examples/worker-bots/tokenomics-bot/.env
bots/examples/worker-bots/sentiment-bot/.env
bots/examples/coordinator-bot/.env
```

**Templates ya están en ARCHITECTURE-x402.md sección 12**

---

## FASE 2: Worker Bot #1 - Security Auditor (4-5 horas)

### 2.1 Crear analyzer.js (Static Analysis)
**Tiempo:** 2 horas
**Archivo:** `bots/examples/worker-bots/security-bot/analyzer.js`

**Funciones a implementar:**
```javascript
// 1. detectVulnerabilities(contractSource)
//    - Reentrancy patterns
//    - Unchecked arithmetic
//    - Access control issues
//    - State manipulation
//    - Integer overflow/underflow

// 2. calculateSecurityScore(vulnerabilities)
//    - Scoring algorithm (0-10)

// 3. generateRecommendations(vulnerabilities)
//    - Actionable fixes per vulnerability
```

**Vulnerabilidades a detectar:**
- `(stx-transfer?` sin reentrancy guard
- `(+ var1 var2)` sin bounds check
- `(is-eq tx-sender ...)` sin proper validation
- `(var-set ...)` sin assertions
- `(unwrap! ...)` without error handling

---

### 2.2 Crear ai-insights.js (GPT-3.5 Integration)
**Tiempo:** 1 hora
**Archivo:** `bots/examples/worker-bots/security-bot/ai-insights.js`

**Función:**
```javascript
export async function getAIInsights(contractSource, vulnerabilities) {
  // 1. Connect to OpenAI
  // 2. Build prompt with contract + vulnerabilities
  // 3. Call GPT-3.5-turbo (max 300 tokens)
  // 4. Return analysis
}
```

**Costo:** $0.01-0.02 per call

---

### 2.3 Crear index.js (Express Server)
**Tiempo:** 1.5 horas
**Archivo:** `bots/examples/worker-bots/security-bot/index.js`

**Endpoints:**
```javascript
// GET /info - Bot information
// POST /audit - Full security audit
// POST /scan - Quick scan (critical only)
```

**Features:**
- x402 payment requirement headers (402 response)
- Integration with VeilPay x402 middleware (future)
- Error handling
- Logging

---

### 2.4 Testing Security Bot
**Tiempo:** 30 min

**Tests:**
```bash
# 1. Start bot
cd bots/examples/worker-bots/security-bot
npm install
npm start

# 2. Test endpoints
curl http://localhost:4001/info

curl -X POST http://localhost:4001/audit \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "contractName": "alex-vault",
    "network": "testnet"
  }'

# 3. Verify output format
```

**Success criteria:**
- ✅ Bot starts on port 4001
- ✅ Returns vulnerability list
- ✅ Security score calculated
- ✅ AI insights included (if USE_AI=true)
- ✅ Response time < 10s

---

## FASE 3: Worker Bot #2 - Tokenomics Analyzer (3-4 horas)

### 3.1 Crear metrics.js (Token Metrics)
**Tiempo:** 1.5 horas
**Archivo:** `bots/examples/worker-bots/tokenomics-bot/metrics.js`

**Funciones:**
```javascript
// 1. fetchTokenSupply(contract) - via Stacks API
// 2. fetchHolderDistribution(contract) - via Stacks API
// 3. calculateGiniCoefficient(holders) - concentration metric
// 4. fetchPrice(symbol) - via Coingecko
// 5. calculateMarketCap(supply, price)
// 6. calculateFDV(totalSupply, price)
```

---

### 3.2 Crear dex-data.js (DEX Liquidity)
**Tiempo:** 1 hora
**Archivo:** `bots/examples/worker-bots/tokenomics-bot/dex-data.js`

**Funciones:**
```javascript
// 1. fetchDEXLiquidity(tokenAddress) - DexScreener API
// 2. fetchTradingVolume(tokenAddress)
// 3. calculateLiquidityRatio(liquidity, marketCap)
```

---

### 3.3 Crear index.js (Express Server)
**Tiempo:** 1 hora
**Archivo:** `bots/examples/worker-bots/tokenomics-bot/index.js`

**Endpoints:**
```javascript
// GET /info - Bot information
// POST /analyze - Full tokenomics analysis
// POST /quick - Quick metrics only
```

---

### 3.4 Testing Tokenomics Bot
**Tiempo:** 30 min

**Tests:**
```bash
cd bots/examples/worker-bots/tokenomics-bot
npm install
npm start

curl -X POST http://localhost:4002/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "tokenContract": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.alex-token",
    "network": "testnet"
  }'
```

**Success criteria:**
- ✅ Bot starts on port 4002
- ✅ Fetches supply, holders, price
- ✅ Calculates metrics (Gini, liquidity ratio)
- ✅ Returns recommendation
- ✅ Response time < 5s
- ✅ **Cost: $0** (all free APIs)

---

## FASE 4: Worker Bot #3 - Sentiment Analyzer (3-4 horas)

### 4.1 Crear github-scraper.js
**Tiempo:** 1 hour
**Archivo:** `bots/examples/worker-bots/sentiment-bot/github-scraper.js`

**Funciones:**
```javascript
// 1. fetchCommits(repo, days=30) - via @octokit/rest
// 2. fetchPRs(repo, days=30)
// 3. fetchIssues(repo)
// 4. fetchContributors(repo)
// 5. calculateDevScore(metrics)
```

---

### 4.2 Crear onchain-metrics.js
**Tiempo:** 45 min
**Archivo:** `bots/examples/worker-bots/sentiment-bot/onchain-metrics.js`

**Funciones:**
```javascript
// 1. fetchTransactionVolume(contract, days=30) - Stacks API
// 2. fetchActiveAddresses(contract, days=30)
// 3. fetchDailyTransactions(contract)
// 4. calculateActivityScore(metrics)
```

---

### 4.3 Crear news-fetcher.js
**Tiempo:** 45 min
**Archivo:** `bots/examples/worker-bots/sentiment-bot/news-fetcher.js`

**Funciones:**
```javascript
// 1. fetchNews(query) - CryptoPanic API
// 2. categorizeNews(articles) - positive/neutral/negative
// 3. calculateSentimentScore(categories)
```

---

### 4.4 Crear ai-sentiment.js (GPT-3.5)
**Tiempo:** 45 min
**Archivo:** `bots/examples/worker-bots/sentiment-bot/ai-sentiment.js`

**Función:**
```javascript
// Analyze news headlines with GPT-3.5
export async function analyzeNewsSentiment(headlines) {
  // Returns: bullish/neutral/bearish with confidence
}
```

**Costo:** $0.02-0.03 per analysis

---

### 4.5 Crear index.js (Express Server)
**Tiempo:** 1 hour
**Archivo:** `bots/examples/worker-bots/sentiment-bot/index.js`

**Endpoints:**
```javascript
// GET /info - Bot information
// POST /analyze - Full sentiment analysis
// POST /dev-only - Development activity only
// POST /onchain-only - On-chain metrics only
```

---

### 4.6 Testing Sentiment Bot
**Tiempo:** 30 min

**Tests:**
```bash
cd bots/examples/worker-bots/sentiment-bot
npm install
npm start

curl -X POST http://localhost:4003/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "alex-protocol",
    "githubRepo": "alexgo-io/alex-v1",
    "tokenContract": "ST1ABC...alex",
    "network": "testnet"
  }'
```

**Success criteria:**
- ✅ Bot starts on port 4003
- ✅ GitHub metrics fetched
- ✅ On-chain activity tracked
- ✅ News sentiment analyzed
- ✅ AI summary included
- ✅ Response time < 8s

---

## FASE 5: Coordinator Bot (5-6 horas)

### 5.1 Crear job-manager.js
**Tiempo:** 1.5 horas
**Archivo:** `bots/examples/coordinator-bot/job-manager.js`

**Funciones:**
```javascript
// 1. createJob(projectData)
// 2. assignJobToWorkers(job) - calls 3 worker bots
// 3. trackJobStatus(jobId)
// 4. handleWorkerFailure(workerId, error)
```

---

### 5.2 Crear veilpay-client.js
**Tiempo:** 2 horas
**Archivo:** `bots/examples/coordinator-bot/veilpay-client.js`

**CRÍTICO:** Este módulo maneja pagos privados

**Funciones:**
```javascript
// 1. initVeilPayClient(secret, nonce, asset)
//    - Creates createPrivateX402Client instance

// 2. async hireBot(botEndpoint, params, price)
//    - Makes x402 request with VeilPay ZK proof
//    - Handles 402 automatically
//    - Returns bot result

// 3. async hireBotsBatch([bot1, bot2, bot3])
//    - Hires multiple bots in sequence
//    - Tracks nullifiers used
```

**Integration:**
```javascript
import { createPrivateX402Client } from '../../../frontend/src/utils/x402-client.js';
```

---

### 5.3 Crear result-aggregator.js
**Tiempo:** 1 hour
**Archivo:** `bots/examples/coordinator-bot/result-aggregator.js`

**Funciones:**
```javascript
// 1. aggregateResults(securityReport, tokenomicsReport, sentimentReport)
// 2. calculateOverallScore(reports)
// 3. generateRecommendation(overallScore, reports)
// 4. formatFinalReport(aggregatedData)
```

**Output format:**
```json
{
  "project": "...",
  "timestamp": "...",
  "security": { "score": "7.5/10", ... },
  "tokenomics": { "marketCap": "$25M", ... },
  "sentiment": { "overall": "Bullish", ... },
  "overallScore": "8.2/10",
  "recommendation": "BUY - Strong fundamentals...",
  "costBreakdown": { ... },
  "privacyGuarantee": "✅ All payments unlinkable"
}
```

---

### 5.4 Crear index.js (Main Coordinator)
**Tiempo:** 1.5 hours
**Archivo:** `bots/examples/coordinator-bot/index.js`

**Endpoints:**
```javascript
// GET /info - Coordinator information
// POST /analyze - Full project analysis (orchestrates 3 bots)
// GET /job/:jobId - Check job status
// GET /history - Analysis history
```

**Main flow:**
```javascript
app.post('/analyze', async (req, res) => {
  const { projectAddress, tokenContract, githubRepo } = req.body;

  // 1. Create VeilPay client
  const client = initVeilPayClient(secret, nonce, 'STX');

  // 2. Hire Security Bot (5 STX via VeilPay)
  const security = await hireBot(
    'http://security-bot:4001/audit',
    { contractAddress: projectAddress },
    5
  );

  // 3. Hire Tokenomics Bot (3 STX via VeilPay)
  const tokenomics = await hireBot(
    'http://tokenomics-bot:4002/analyze',
    { tokenContract },
    3
  );

  // 4. Hire Sentiment Bot (2 STX via VeilPay)
  const sentiment = await hireBot(
    'http://sentiment-bot:4003/analyze',
    { projectName, githubRepo },
    2
  );

  // 5. Aggregate
  const report = aggregateResults(security, tokenomics, sentiment);

  res.json(report);
});
```

---

### 5.5 Testing Coordinator Bot
**Tiempo:** 30 min

**Setup:**
```bash
# 1. Deposit to VeilPay pool first!
# Frontend → Deposit tab → 10 STX
# Save secret & nonce!

# 2. Configure coordinator .env
cd bots/examples/coordinator-bot
cat > .env << EOF
VEILPAY_SECRET=123456789...
VEILPAY_NONCE=987654321...
VEILPAY_ASSET=STX
SECURITY_BOT_URL=http://localhost:4001
TOKENOMICS_BOT_URL=http://localhost:4002
SENTIMENT_BOT_URL=http://localhost:4003
RELAYER_URL=http://localhost:3001
EOF

# 3. Start coordinator
npm install
npm start
```

**Test:**
```bash
curl -X POST http://localhost:4000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectAddress": "ST1ABC...protocol",
    "tokenContract": "ST1ABC...token",
    "githubRepo": "project/repo"
  }'
```

**Expected:**
- ✅ Coordinator calls all 3 bots
- ✅ VeilPay ZK proofs generated (3 payments)
- ✅ Blockchain shows 3 unlinkable payments
- ✅ Aggregated report returned
- ✅ Total time: 15-25 seconds

---

## FASE 6: x402 Integration in Relayer (3-4 horas)

### 6.1 Actualizar relayer con bot endpoints
**Tiempo:** 2 hours
**Archivo:** `relayer/src/x402/bot-endpoints.js` (NUEVO)

**Funciones:**
```javascript
// 1. createBotX402Middleware(botConfig)
//    - Wraps VeilPay middleware for bots
//    - Validates ZK proofs
//    - Tracks bot payments

// 2. registerBotRoutes(app)
//    - Proxies to worker bots with x402 protection
//    - /bots/security/audit
//    - /bots/tokenomics/analyze
//    - /bots/sentiment/analyze
```

---

### 6.2 Bot payment tracking
**Tiempo:** 1 hour
**Archivo:** `relayer/src/x402/bot-payment-tracker.js` (NUEVO)

**Funciones:**
```javascript
// 1. trackBotPayment(botId, nullifier, amount, asset)
// 2. getBotStats(botId) - total payments, volume
// 3. getCoordinatorStats() - track coordinator activity
```

**Database:** Simple JSON file or in-memory for MVP

---

### 6.3 Update relayer index.js
**Tiempo:** 30 min
**Archivo:** `relayer/src/index.js`

**Changes:**
```javascript
import { registerBotRoutes } from './x402/bot-endpoints.js';

// ... existing code ...

// Register bot routes
registerBotRoutes(app);

console.log('Bot ecosystem endpoints registered:');
console.log('  POST /bots/security/audit');
console.log('  POST /bots/tokenomics/analyze');
console.log('  POST /bots/sentiment/analyze');
```

---

### 6.4 Testing relayer bot endpoints
**Tiempo:** 30 min

**Test:**
```bash
# Start relayer
cd relayer
npm start

# Test bot proxy (should require x402 payment)
curl -X POST http://localhost:3001/bots/security/audit \
  -H "Content-Type: application/json" \
  -d '{
    "contractAddress": "ST1ABC...",
    "contractName": "test"
  }'

# Expected: 402 Payment Required
```

---

## FASE 7: Frontend Bot Marketplace (6-8 horas)

### 7.1 Crear BotCard.jsx
**Tiempo:** 1.5 hours
**Archivo:** `frontend/src/components/BotCard.jsx`

**Props:**
```javascript
{
  bot: {
    id, name, category, description,
    pricing: { asset, amount },
    capabilities: [],
    reputation, totalJobs,
    endpoint
  }
}
```

**UI:** Cryptographic noir aesthetic (consistent with existing)

---

### 7.2 Crear BotMarketplace.jsx
**Tiempo:** 3 hours
**Archivo:** `frontend/src/components/BotMarketplace.jsx`

**Features:**
- Grid de bots disponibles
- Filtros por categoría (security, analytics, sentiment)
- Búsqueda
- "Hire Bot" button → triggers x402 payment via VeilPay
- Bot details modal

---

### 7.3 Crear CoordinatorDashboard.jsx
**Tiempo:** 2 hours
**Archivo:** `frontend/src/components/CoordinatorDashboard.jsx`

**Features:**
- Input para project analysis (address, repo, etc)
- "Analyze Project" button
- Loading state (shows 3 bots being hired)
- Results display (security, tokenomics, sentiment)
- Overall recommendation

---

### 7.4 Crear BotPaymentHistory.jsx
**Tiempo:** 1 hour
**Archivo:** `frontend/src/components/BotPaymentHistory.jsx`

**Features:**
- Lista de pagos a bots
- Cada pago muestra: bot name, amount, asset, timestamp
- Privacy badge: "✅ Unlinkable payment"

---

### 7.5 Crear TransactionGraph.jsx (Bonus)
**Tiempo:** 1.5 hours
**Archivo:** `frontend/src/components/TransactionGraph.jsx`

**Features:**
- Visualización de grafo de transacciones
- Muestra que los 3 pagos son unlinkable
- D3.js o React Flow para visualización
- Educational: "See how privacy works"

---

### 7.6 Actualizar App.jsx
**Tiempo:** 30 min
**Archivo:** `frontend/src/App.jsx`

**Changes:**
```jsx
// Add new tabs
<Tab name="Bot Marketplace" component={<BotMarketplace />} />
<Tab name="Coordinator" component={<CoordinatorDashboard />} />
<Tab name="Bot Payments" component={<BotPaymentHistory />} />
```

---

### 7.7 Testing Frontend
**Tiempo:** 1 hour

**Tests:**
1. Bot Marketplace loads with 3 bots
2. "Hire Bot" triggers VeilPay x402 flow
3. Coordinator can analyze project
4. Payment history shows unlinkable payments
5. Mobile responsive

---

## FASE 8: Deploy Smart Contracts (3-4 horas)

### 8.1 Deploy veilpay-usdcx.clar
**Tiempo:** 1 hour

**Steps:**
```bash
cd contracts

# 1. Test contract locally
clarinet check

# 2. Deploy to testnet
clarinet integrate --testnet

# 3. Save contract address
# Output: ST2...veilpay-usdcx
```

**Update `.env`:**
```
CONTRACT_USDCX=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx
```

---

### 8.2 Deploy veilpay-sbtc.clar
**Tiempo:** 1 hour

Same process as USDCx

---

### 8.3 Update relayer indexers
**Tiempo:** 1 hour
**Archivo:** `relayer/src/indexer.js`

**Changes:**
```javascript
// Monitor all 3 contracts
const contracts = [
  { name: 'veilpay', asset: 'STX' },
  { name: 'veilpay-usdcx', asset: 'USDCx' },
  { name: 'veilpay-sbtc', asset: 'sBTC' }
];

// Index deposits for each
```

---

### 8.4 Update frontend contract addresses
**Tiempo:** 15 min

**Archivo:** `frontend/src/components/AssetSelector.jsx`

Update contract addresses with deployed ones

---

## FASE 9: End-to-End Testing (4-5 horas)

### 9.1 Test Worker Bots independently
**Tiempo:** 1 hour

**For each bot:**
```bash
# Start bot
npm start

# Test endpoint
curl -X POST ...

# Verify output
```

---

### 9.2 Test Coordinator with VeilPay
**Tiempo:** 2 hours

**Critical flow:**
```bash
# 1. Deposit 20 STX to VeilPay (frontend)
# 2. Save secret & nonce
# 3. Configure coordinator .env
# 4. Start all 4 bots (3 workers + coordinator)
# 5. Call coordinator /analyze
# 6. Verify:
#    - All 3 bots called
#    - 3 ZK proofs generated
#    - 3 unlinkable payments on blockchain
#    - Aggregated report returned
```

---

### 9.3 Test Frontend Bot Marketplace
**Tiempo:** 1 hour

**Tests:**
1. Bot Marketplace displays correctly
2. Can hire individual bot
3. Coordinator Dashboard works
4. Payment history updates
5. Transaction graph shows privacy

---

### 9.4 Performance Testing
**Tiempo:** 30 min

**Benchmarks:**
- Security Bot: < 10s
- Tokenomics Bot: < 5s
- Sentiment Bot: < 8s
- Coordinator (full): < 25s
- AI cost per workflow: $0.05-0.07

---

### 9.5 Edge Cases & Error Handling
**Tiempo:** 30 min

**Test:**
- Bot timeout
- Invalid contract address
- GitHub repo not found
- Insufficient VeilPay balance
- ZK proof generation failure
- Network errors

---

## FASE 10: Deploy to Production (3-4 horas)

### 10.1 Deploy Bots to Render
**Tiempo:** 2 hours

**For each bot:**
```bash
# 1. Create GitHub repo or push to existing
# 2. Render.com → New Web Service
# 3. Connect GitHub repo
# 4. Configure:
#    - Build Command: npm install
#    - Start Command: npm start
#    - Environment Variables (from .env)
# 5. Deploy
# 6. Save URL
```

**URLs:**
- Security Bot: `https://security-bot-xyz.onrender.com`
- Tokenomics Bot: `https://tokenomics-bot-xyz.onrender.com`
- Sentiment Bot: `https://sentiment-bot-xyz.onrender.com`
- Coordinator: `https://coordinator-bot-xyz.onrender.com`

**Cost:** $0 (free tier) or $28/month (4 × $7)

---

### 10.2 Deploy Relayer to Render
**Tiempo:** 30 min

Already done, just update with new bot endpoints

---

### 10.3 Deploy Frontend to Vercel
**Tiempo:** 30 min

```bash
cd frontend
vercel --prod
```

Update environment variables:
```
VITE_API_URL=https://veilpay-relayer.onrender.com
VITE_SECURITY_BOT_URL=https://security-bot-xyz.onrender.com
...
```

---

### 10.4 Update x402scan
**Tiempo:** 30 min

Register all bot endpoints on x402scan registry

---

## FASE 11: Documentation (4-5 horas)

### 11.1 BOT-DEVELOPER-GUIDE.md
**Tiempo:** 2 hours
**Archivo:** `docs/BOT-DEVELOPER-GUIDE.md`

**Sections:**
1. Introduction to VeilPay Bot Economy
2. How to build a worker bot
3. x402 integration guide
4. VeilPay payment integration
5. Testing your bot
6. Deploying to production
7. Best practices
8. Example bots walkthrough

---

### 11.2 BOT-TO-BOT-API.md
**Tiempo:** 1.5 hours
**Archivo:** `docs/BOT-TO-BOT-API.md`

**Sections:**
1. API Reference for all 3 worker bots
2. Coordinator API
3. x402 payment flow
4. Request/response schemas
5. Error codes
6. Rate limits
7. Code examples (JS, Python, cURL)

---

### 11.3 BOT-EXAMPLES.md
**Tiempo:** 1 hour
**Archivo:** `docs/BOT-EXAMPLES.md`

**Sections:**
1. Complete examples for each bot
2. How to hire a bot (code examples)
3. How to build a coordinator
4. Common patterns
5. Troubleshooting

---

### 11.4 Update README.md
**Tiempo:** 30 min

Add section: "🤖 Bot-to-Bot Economy"

---

## FASE 12: Video Demo (4-5 horas)

### 12.1 Script & Storyboard
**Tiempo:** 1 hour

**Script (5 minutes):**
```
0:00-0:30  HOOK
"AI agents are paying for APIs. But every payment is public.
 Competitors can see your strategy. VeilPay Bot-to-Bot fixes that."

0:30-1:00  PROBLEM
- Show standard x402 bot payment
- Blockchain explorer: "Everyone sees transaction graph"
- "This reveals your AI agent strategy"

1:00-2:00  SOLUTION
- VeilPay Bot-to-Bot architecture
- 3 Worker Bots + Coordinator
- All payments via ZK proofs

2:00-3:30  DEMO
- Live: Coordinator analyzes project
- Shows hiring Security Bot (5 STX via VeilPay)
- Shows hiring Tokenomics Bot (3 STX via VeilPay)
- Shows hiring Sentiment Bot (2 STX via VeilPay)
- Blockchain: 3 payments, ZERO linkage

3:30-4:30  TECHNICAL
- ZK-SNARKs explanation
- Privacy guarantees
- Multi-asset support
- Cost: $0.05-0.07 per analysis

4:30-5:00  CLOSE
- First autonomous bot economy with privacy
- Try it: veilpay.lat/bots
- GitHub: github.com/carlos-israelj/VeilPay
```

---

### 12.2 Record Demo
**Tiempo:** 2 hours

**Tools:**
- OBS Studio (screen recording)
- Clean browser window
- Terminal for logs
- Blockchain explorer side-by-side

**Recording:**
1. Setup scene (2 terminals + 1 browser)
2. Start all services
3. Execute coordinator analysis
4. Show blockchain explorer (3 unlinkable payments)
5. Show aggregated report

---

### 12.3 Edit Video
**Tiempo:** 1.5 hours

**Software:** DaVinci Resolve (free)

**Edits:**
- Add intro slide
- Add captions
- Speed up slow parts (ZK proof generation)
- Add transitions
- Add music (optional)
- Export in 1080p

---

### 12.4 Upload & Publish
**Tiempo:** 30 min

**Platforms:**
- YouTube (public)
- Loom (for hackathon submission)
- Twitter (promotion)

---

## TIMELINE SUMMARY

| Fase | Descripción | Horas | Días (8h/día) |
|------|-------------|-------|---------------|
| 1 | Configuración Base | 2-3h | 0.3 |
| 2 | Security Bot | 4-5h | 0.6 |
| 3 | Tokenomics Bot | 3-4h | 0.5 |
| 4 | Sentiment Bot | 3-4h | 0.5 |
| 5 | Coordinator Bot | 5-6h | 0.7 |
| 6 | x402 Relayer Integration | 3-4h | 0.5 |
| 7 | Frontend Marketplace | 6-8h | 1.0 |
| 8 | Deploy Contracts | 3-4h | 0.5 |
| 9 | End-to-End Testing | 4-5h | 0.6 |
| 10 | Deploy Production | 3-4h | 0.5 |
| 11 | Documentation | 4-5h | 0.6 |
| 12 | Video Demo | 4-5h | 0.6 |
| **TOTAL** | | **44-56h** | **5.5-7 días** |

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Día 1 (8 horas)
- [x] Fase 1: Configuración (2h)
- [x] Fase 2: Security Bot (4h)
- [x] Fase 3: Tokenomics Bot (2h inicio)

### Día 2 (8 horas)
- [x] Fase 3: Tokenomics Bot (2h terminar)
- [x] Fase 4: Sentiment Bot (4h)
- [x] Fase 5: Coordinator Bot (2h inicio)

### Día 3 (8 horas)
- [x] Fase 5: Coordinator Bot (4h terminar)
- [x] Fase 6: x402 Relayer (4h)

### Día 4 (8 horas)
- [x] Fase 7: Frontend Marketplace (7h)
- [x] Fase 8: Deploy Contracts (1h inicio)

### Día 5 (8 horas)
- [x] Fase 8: Deploy Contracts (3h terminar)
- [x] Fase 9: Testing (5h)

### Día 6 (8 horas)
- [x] Fase 10: Deploy Production (4h)
- [x] Fase 11: Documentation (4h)

### Día 7 (8 horas)
- [x] Fase 11: Documentation (1h terminar)
- [x] Fase 12: Video Demo (5h)
- [x] Buffer / Polish (2h)

---

## DEPENDENCIAS CRÍTICAS

**Debe completarse ANTES de:**

| Tarea | Depende de |
|-------|-----------|
| Coordinator Bot | 3 Worker Bots funcionando |
| Frontend Marketplace | Coordinator + Relayer |
| End-to-End Testing | TODO lo anterior |
| Deploy Production | Testing completo |
| Video Demo | Deploy Production |

**Bloqueadores potenciales:**
1. ❌ OpenAI API key sin créditos
2. ❌ GitHub token sin permisos
3. ❌ VeilPay deposit sin suficientes fondos
4. ❌ Render free tier sleep (usar paid $7/mo)
5. ❌ Stacks testnet faucet sin fondos

---

## RIESGOS & MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **API rate limits** | Media | Bajo | Use free tier carefully, upgrade if needed |
| **ZK proof slow** | Baja | Medio | Already optimized, 5-8s is acceptable |
| **Bot timeout** | Media | Medio | Add retry logic, increase timeouts |
| **VeilPay out of funds** | Alta | Alto | Monitor balance, deposit more STX |
| **Relayer downtime** | Media | Alto | Use Render paid tier for 24/7 uptime |
| **OpenAI API cost spike** | Baja | Medio | Monitor usage, set limits |
| **Contract deployment failure** | Baja | Alto | Test thoroughly on testnet first |

---

## MÉTRICAS DE ÉXITO

### Technical Metrics
- ✅ All 3 worker bots functional
- ✅ Coordinator orchestrates correctly
- ✅ ZK proofs generated (3 per analysis)
- ✅ Payments unlinkable on blockchain
- ✅ Response time < 25s for full analysis
- ✅ AI cost < $0.10 per analysis
- ✅ 99% uptime on production

### Product Metrics
- ✅ Frontend loads in < 3s
- ✅ Bot Marketplace shows all bots
- ✅ Can hire individual bot
- ✅ Can run full analysis via Coordinator
- ✅ Payment history updates correctly
- ✅ Mobile responsive

### Demo Metrics
- ✅ Video < 5 minutes
- ✅ Shows complete workflow
- ✅ Demonstrates privacy (blockchain proof)
- ✅ Professional quality
- ✅ Clear value proposition

---

## NEXT IMMEDIATE ACTION

**START HERE:**

```bash
# 1. Create directories
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay
mkdir -p bots/examples/worker-bots/security-bot
mkdir -p bots/examples/worker-bots/tokenomics-bot
mkdir -p bots/examples/worker-bots/sentiment-bot
mkdir -p bots/examples/coordinator-bot
mkdir -p bots/registry
mkdir -p bots/marketplace

# 2. Get OpenAI API key
# Visit: https://platform.openai.com/api-keys
# Add $10 credits

# 3. Start implementing Security Bot
cd bots/examples/worker-bots/security-bot
# Create package.json, .env, analyzer.js, index.js
```

---

**¿Quieres que empiece a implementar ahora? 🚀**
**Dime si procedo con Fase 1 + Fase 2 (Security Bot)**
