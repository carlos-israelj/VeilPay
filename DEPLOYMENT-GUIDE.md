# VeilPay Production Deployment Guide

**Last Updated:** 2026-02-11
**Target Platform:** Render.com (Backend) + Vercel (Frontend)

---

## Overview

VeilPay consists of 6 services that need to be deployed:

1. **VeilPay Relayer** - Main API server with x402 endpoints
2. **Security Bot** - AI-powered contract auditing (5 STX)
3. **Tokenomics Bot** - Token metrics analysis (3 STX)
4. **Sentiment Bot** - Multi-source sentiment analysis (2 STX)
5. **Coordinator Bot** - Multi-bot orchestrator (10 STX)
6. **Frontend** - React application (Vercel)

---

## Prerequisites

### Accounts Required

- ✅ GitHub account (repo must be public)
- ✅ Render.com account (free tier works, but Starter plan recommended for production)
- ✅ Vercel account (free tier works)
- ✅ OpenAI API key (for Security, Sentiment, and Coordinator bots)
- ✅ Stacks wallet with testnet STX (for coordinator bot operations)

### Secret Keys Needed

You will need to set these in Render dashboard:

1. `RELAYER_PRIVATE_KEY` - Stacks private key for relayer wallet
2. `COORDINATOR_PRIVATE_KEY` - Stacks private key for coordinator bot
3. `OPENAI_API_KEY` - OpenAI API key (shared across bots)
4. `CRYPTOPANIC_API_KEY` - (Optional) For news sentiment in Sentiment Bot

---

## Deployment Steps

### Step 1: Deploy Backend Services to Render.com

VeilPay uses `render.yaml` for infrastructure-as-code deployment.

#### Option A: Automatic Deployment (Recommended)

1. **Connect GitHub Repository:**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub account
   - Select repository: `carlos-israelj/VeilPay`
   - Branch: `main`
   - Render will automatically detect `render.yaml`

2. **Configure Secret Environment Variables:**

   After deployment starts, go to each service's dashboard and add:

   **VeilPay Relayer:**
   - `RELAYER_PRIVATE_KEY`: Your Stacks wallet private key (hex format)
   - `OPENAI_API_KEY`: Your OpenAI API key

   **Security Bot:**
   - `OPENAI_API_KEY`: Your OpenAI API key

   **Sentiment Bot:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CRYPTOPANIC_API_KEY`: (Optional) Your CryptoPanic API key

   **Coordinator Bot:**
   - `COORDINATOR_PRIVATE_KEY`: Stacks private key for coordinator wallet
   - `OPENAI_API_KEY`: Your OpenAI API key

3. **Trigger Deployment:**
   - Click "Apply" to deploy all 5 backend services
   - Wait ~5-10 minutes for initial build
   - Verify health checks pass for all services

#### Option B: Manual Deployment

If Blueprint deployment doesn't work, deploy each service manually:

1. **Create New Web Service** (repeat for each service):
   - Name: `veilpay-x402-relayer`
   - Environment: `Node`
   - Build Command: `cd relayer && npm install`
   - Start Command: `cd relayer && npm start`
   - Add all environment variables from `render.yaml`

2. **Repeat for each bot:**
   - `veilpay-security-bot` (port 4001)
   - `veilpay-tokenomics-bot` (port 4002)
   - `veilpay-sentiment-bot` (port 4003)
   - `veilpay-coordinator-bot` (port 4004)

---

### Step 2: Verify Backend Deployments

Test each service after deployment:

#### Test Relayer

```bash
# Health check
curl https://veilpay-x402-relayer.onrender.com/health

# Expected response:
{
  "status": "ok",
  "service": "veilpay-relayer"
}

# Get Merkle root
curl https://veilpay-x402-relayer.onrender.com/root

# List available bots
curl https://veilpay-x402-relayer.onrender.com/x402/bots
```

#### Test Security Bot

```bash
curl https://veilpay-security-bot.onrender.com/health

# Expected response:
{
  "status": "ok",
  "service": "veilpay-security-bot",
  "version": "1.0.0"
}
```

#### Test Tokenomics Bot

```bash
curl https://veilpay-tokenomics-bot.onrender.com/health
```

#### Test Sentiment Bot

```bash
curl https://veilpay-sentiment-bot.onrender.com/health
```

#### Test Coordinator Bot

```bash
curl https://veilpay-coordinator-bot.onrender.com/health
```

**All health checks should return `200 OK`.**

---

### Step 3: Deploy Frontend to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/VeilPay
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: veilpay
# - Directory: frontend
# - Build settings: default (Vite)

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. **Import Project:**
   - Go to https://vercel.com/new
   - Import `carlos-israelj/VeilPay`
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Configure Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `frontend/.env.production`:
     ```
     VITE_API_URL=https://veilpay-x402-relayer.onrender.com
     VITE_RELAYER_URL=https://veilpay-x402-relayer.onrender.com
     VITE_STACKS_NETWORK=testnet
     VITE_CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
     VITE_CONTRACT_NAME=veilpay
     VITE_USDCX_CONTRACT=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx
     VITE_SBTC_CONTRACT=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc-v2
     ```

3. **Deploy:**
   - Click "Deploy"
   - Wait ~3-5 minutes for build
   - Visit deployment URL

#### Verify Frontend Deployment

Visit your Vercel URL (e.g., `https://veilpay.vercel.app`):

- ✅ Home page loads
- ✅ Can connect Stacks wallet
- ✅ Tabs work: HOME, DEPOSIT, WITHDRAW, BRIDGE, X402, BOTS
- ✅ Bot Marketplace shows all 4 bots
- ✅ Asset selector shows STX, USDCx, sBTC

---

### Step 4: Configure Custom Domain (Optional)

#### Vercel Custom Domain

1. **Add Domain:**
   - Go to Project Settings → Domains
   - Add `veilpay.lat` (or your domain)
   - Follow DNS configuration instructions

2. **Update CORS:**
   - Add custom domain to relayer CORS whitelist
   - Redeploy relayer if needed

---

### Step 5: x402scan Registration

Register VeilPay with x402scan for discoverability:

1. **Verify Schema Endpoint:**
   ```bash
   curl https://veilpay-x402-relayer.onrender.com/
   ```

   Should return HTTP 402 with x402 schema:
   ```json
   {
     "x402Version": 2,
     "name": "VeilPay x402 Multi-Asset Privacy Protocol",
     "image": "https://veilpay.vercel.app/veilpay-icon.png",
     "accepts": [...]
   }
   ```

2. **Submit to x402scan:**
   - Go to https://x402scan.com/submit (or similar)
   - Enter relayer URL: `https://veilpay-x402-relayer.onrender.com`
   - Wait for approval (~24-48 hours)

3. **Verify Discovery:**
   - Check https://x402scan.com
   - Search for "VeilPay"
   - Verify all endpoints appear

---

## Post-Deployment Verification

### End-to-End Test

1. **Deposit Test:**
   - Open https://veilpay.vercel.app
   - Connect Leather wallet
   - Deposit 1 STX
   - Verify commitment appears in deposit history
   - Check relayer logs for "Adding commitment"

2. **Bot Marketplace Test:**
   - Navigate to BOTS tab
   - Click "Hire Bot" on Security Bot
   - Enter test contract: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.veilpay`
   - Verify 402 payment prompt appears
   - (Don't complete payment unless testing end-to-end)

3. **Withdrawal Test:**
   - Go to WITHDRAW tab
   - Enter secret/nonce from deposit
   - Generate ZK proof (~15s)
   - Submit withdrawal
   - Verify STX received at recipient address

---

## Monitoring & Maintenance

### Render Dashboard

Monitor all 5 backend services:
- https://dashboard.render.com

**Key Metrics:**
- Health check status (should be green)
- Request count
- Error rate
- Response time

### Vercel Dashboard

Monitor frontend:
- https://vercel.com/dashboard

**Key Metrics:**
- Build status
- Traffic analytics
- Error tracking

### Logs

**Relayer Logs:**
```bash
# View live logs in Render dashboard
https://dashboard.render.com/web/veilpay-x402-relayer → Logs

# Key events to watch:
- "VeilPay Relayer running on port 4000"
- "Adding commitment: ..."
- "New merkle root: ..."
- "Withdrawal submitted successfully"
```

**Bot Logs:**
- Security Bot: https://dashboard.render.com/web/veilpay-security-bot → Logs
- Tokenomics Bot: https://dashboard.render.com/web/veilpay-tokenomics-bot → Logs
- Sentiment Bot: https://dashboard.render.com/web/veilpay-sentiment-bot → Logs
- Coordinator Bot: https://dashboard.render.com/web/veilpay-coordinator-bot → Logs

---

## Troubleshooting

### Issue: Relayer Health Check Failing

**Solution:**
1. Check Render logs for errors
2. Verify `RELAYER_PRIVATE_KEY` is set
3. Verify contracts are deployed to testnet
4. Restart service in Render dashboard

### Issue: Frontend Can't Connect to Relayer

**Solution:**
1. Verify `VITE_API_URL` environment variable in Vercel
2. Check CORS configuration in relayer
3. Verify relayer is running (test `/health` endpoint)
4. Redeploy frontend

### Issue: Bot Returns 500 Error

**Solution:**
1. Check bot logs in Render dashboard
2. Verify `OPENAI_API_KEY` is set and valid
3. Check bot dependencies installed correctly
4. Restart bot service

### Issue: ZK Proof Generation Fails

**Solution:**
1. Check browser console for errors
2. Verify circuit files exist in `frontend/public/circuits/`
3. Check commitment exists in Merkle tree (GET `/proof/:commitment`)
4. Clear browser localStorage and try new deposit

### Issue: Deposit Not Indexed

**Solution:**
1. Wait 30-60 seconds (indexer runs every 30s)
2. Check relayer logs for "Adding commitment"
3. Verify transaction succeeded on Stacks explorer
4. Check relayer has correct `CONTRACT_ADDRESS` env var

---

## Security Checklist

Before going to production:

- [ ] All private keys stored in Render environment variables (NOT in code)
- [ ] CORS configured to allow only production domains
- [ ] Rate limiting enabled on relayer endpoints
- [ ] OpenAI API key has usage limits set
- [ ] Smart contracts audited (if mainnet)
- [ ] Test wallets funded with minimal STX
- [ ] Monitoring alerts configured
- [ ] Backup relayer private key securely

---

## Cost Estimation

### Render.com (Starter Plan - $7/month per service)

- Relayer: $7/month
- Security Bot: $7/month
- Tokenomics Bot: $7/month
- Sentiment Bot: $7/month
- Coordinator Bot: $7/month

**Total Render:** $35/month

### Vercel (Free Tier)

- Frontend: $0/month (hobby project)
- Bandwidth: 100GB/month free
- Builds: Unlimited

**Total Vercel:** $0/month

### OpenAI API

- Security Bot: ~$0.05 per audit
- Sentiment Bot: ~$0.03 per analysis
- Coordinator Bot: ~$0.10 per full analysis

**Estimated:** $5-10/month (depends on usage)

### Total Monthly Cost: ~$40-45/month

---

## Scaling Recommendations

### For Production Traffic:

1. **Upgrade Render Plans:**
   - Standard ($25/month) for relayer
   - Add Redis for caching
   - Add PostgreSQL for state management

2. **CDN for Circuit Files:**
   - Upload `withdraw.wasm` and `.zkey` to CDN
   - Reduce frontend load time

3. **Decentralized Relayer:**
   - Deploy multiple relayer instances
   - Implement load balancing
   - Add failover logic

4. **Bot Optimization:**
   - Cache analysis results
   - Implement request queuing
   - Add rate limiting per user

---

## Support

**Issues:** https://github.com/carlos-israelj/VeilPay/issues
**Documentation:** https://github.com/carlos-israelj/VeilPay/tree/main/docs
**Community:** Stacks Discord - https://discord.gg/stacks

---

**Deployment Complete!** 🎉

Your VeilPay instance is now live at:
- Frontend: `https://veilpay.vercel.app`
- Relayer API: `https://veilpay-x402-relayer.onrender.com`
- Bot Marketplace: `https://veilpay.vercel.app/#/bots`

Enjoy building the future of private payments on Stacks! 🔒✨
