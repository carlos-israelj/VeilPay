# VeilPay x402 Deployment Guide - Render

This guide walks through deploying VeilPay x402 Multi-Asset Relayer to Render.com.

## Prerequisites

- GitHub account with VeilPay repository
- Render account (sign up at https://render.com)
- Relayer private key (from `.env`)

## Step 1: Prepare Repository

1. **Commit all changes to git:**

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay

# Add all new files
git add .

# Commit
git commit -m "Add x402 multi-asset support

- Add veilpay-usdcx and veilpay-sbtc-v2 contracts
- Add x402 middleware and handlers
- Add multi-asset support (STX, USDCx, sBTC)
- Add Render deployment configuration"

# Push to GitHub
git push origin main
```

2. **Verify repository is up to date:**
   - Go to https://github.com/carlos-israelj/VeilPay
   - Ensure all files are pushed

## Step 2: Create Render Service

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository:**
   - Select "Connect GitHub repository"
   - Find and select `carlos-israelj/VeilPay`
   - Click "Connect"

3. **Configure Service:**

   **Basic Settings:**
   - Name: `veilpay-x402-relayer`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: _(leave empty)_

   **Build & Deploy:**
   - Build Command: `cd relayer && npm install`
   - Start Command: `cd relayer && npm start`

   **Plan:**
   - Select `Starter` (free tier for testing)
   - For production: Select `Starter+` or higher

## Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

### Required Variables (Set these manually):

```bash
# CRITICAL: Relayer Private Key (DO NOT COMMIT TO GIT)
RELAYER_PRIVATE_KEY=866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01
```

### Network Configuration:

```bash
PORT=4000
STACKS_NETWORK=testnet  # Change to "mainnet" for production
```

### Contract Addresses (Testnet):

```bash
CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
CONTRACT_NAME=veilpay

# Multi-Asset Contracts
USDCX_CONTRACT_TESTNET=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx
SBTC_CONTRACT_TESTNET=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc-v2

# Token Contracts
USDCX_TOKEN_TESTNET=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
SBTC_TOKEN_TESTNET=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc
```

### x402 Configuration:

```bash
X402_FACILITATOR_URL=https://facilitator.stacksx402.com
VENDOR_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1

# X402_BASE_URL will be auto-set to your Render URL
# Example: https://veilpay-x402-relayer.onrender.com
```

### Optional Configuration:

```bash
RELAYER_FEE_PERCENTAGE=0.1
MIN_DEPOSIT_AMOUNT=1000000
MIN_WITHDRAWAL_AMOUNT=4800000
```

## Step 4: Deploy

1. **Click "Create Web Service"**
   - Render will automatically deploy your service
   - Wait for build to complete (~3-5 minutes)

2. **Monitor Deployment:**
   - Watch logs in real-time
   - Look for success messages:
     ```
     VeilPay x402 Multi-Asset Relayer
     ============================================================
     Port: 4000
     Relayer address: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
     Network: testnet
     ============================================================
     Ready to process private payments! 🚀
     ```

3. **Get Your Public URL:**
   - Render will assign a URL like: `https://veilpay-x402-relayer.onrender.com`
   - Copy this URL

## Step 5: Update X402_BASE_URL

1. **Go back to Environment Variables in Render**
2. **Add/Update:**
   ```bash
   X402_BASE_URL=https://veilpay-x402-relayer.onrender.com
   ```
3. **Save changes** (this will trigger automatic redeployment)

## Step 6: Test Deployment

Once deployed, test your endpoints:

### Health Check:
```bash
curl https://veilpay-x402-relayer.onrender.com/health
# Expected: {"status":"ok","service":"veilpay-relayer"}
```

### Stats:
```bash
curl https://veilpay-x402-relayer.onrender.com/stats
# Should show relayer stats and multi-asset data
```

### x402 Schema:
```bash
curl https://veilpay-x402-relayer.onrender.com/x402/schema
# Should return full x402 schema
```

### Test 402 Payment:
```bash
curl -i https://veilpay-x402-relayer.onrender.com/x402/demo
# Expected: HTTP/1.1 402 Payment Required
```

## Step 7: Register on x402scan

1. **Go to x402scan:**
   - Visit https://x402scan.com (or wherever x402scan is hosted)

2. **Register Your Service:**
   - Submit schema URL: `https://veilpay-x402-relayer.onrender.com/x402/schema`
   - Fill in service details
   - Submit registration

3. **Verify Registration:**
   - Your service should appear in x402scan directory
   - Users can discover your privacy-enabled payment endpoints

## Troubleshooting

### Issue: Build fails with "Module not found"
**Solution:** Ensure `package.json` is in the `relayer/` directory and build command is correct:
```bash
cd relayer && npm install
```

### Issue: Service starts but crashes immediately
**Solution:** Check logs for errors. Common issues:
- Missing `RELAYER_PRIVATE_KEY` environment variable
- Invalid private key format
- Port conflicts (ensure PORT=4000 or use Render's default PORT)

### Issue: 404 errors on all endpoints
**Solution:** Verify start command:
```bash
cd relayer && npm start
```

### Issue: "Cannot connect to Stacks API"
**Solution:**
- Check network configuration (testnet vs mainnet)
- Verify contract addresses are correct
- Check Render logs for specific error messages

### Issue: Relayer address mismatch
**Solution:** Ensure `RELAYER_PRIVATE_KEY` matches the one used to initialize contracts

## Production Deployment Checklist

Before going to mainnet:

- [ ] **Update Network:**
  - Set `STACKS_NETWORK=mainnet`
  - Update all contract addresses to mainnet versions
  - Update token contract addresses to mainnet

- [ ] **Security:**
  - Use a fresh relayer private key (not exposed in git history)
  - Enable Render's secret environment variables
  - Set up proper CORS policy
  - Add rate limiting

- [ ] **Monitoring:**
  - Set up Render alerts
  - Monitor service health
  - Set up error tracking (Sentry, etc.)

- [ ] **Backup:**
  - Document all contract addresses
  - Backup relayer private key securely
  - Document deployment configuration

- [ ] **Testing:**
  - Test all endpoints on mainnet
  - Verify contract initialization
  - Test deposit/withdrawal flow
  - Verify x402 payment flow

## Render Configuration Options

### Free Tier (Starter):
- 512 MB RAM
- Shared CPU
- Auto-sleep after 15 minutes of inactivity
- 750 hours/month
- Good for: Testing, hackathon demos

### Paid Tier (Starter+):
- 512 MB RAM
- Shared CPU
- No auto-sleep
- Custom domains
- Good for: Light production use

### Professional ($25/month):
- 2 GB RAM
- Dedicated CPU
- Priority support
- Good for: Production deployments

## Custom Domain (Optional)

1. **Purchase domain** (e.g., veilpay.dev)
2. **In Render Dashboard:**
   - Go to Settings → Custom Domain
   - Add your domain
3. **Configure DNS:**
   - Add CNAME record pointing to Render URL
4. **Update environment variables:**
   ```bash
   X402_BASE_URL=https://api.veilpay.dev
   ```

## Continuous Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update x402 configuration"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Run build command
# 3. Deploy new version
# 4. Keep previous version running until new one is healthy
```

## Environment-Specific Deployment

### Staging Environment:
```bash
# Create separate service in Render
# Use branch: develop
# Name: veilpay-x402-staging
# Keep STACKS_NETWORK=testnet
```

### Production Environment:
```bash
# Use branch: main
# Name: veilpay-x402-production
# Set STACKS_NETWORK=mainnet
# Use mainnet contract addresses
```

## Support & Resources

- **Render Docs:** https://render.com/docs
- **VeilPay GitHub:** https://github.com/carlos-israelj/VeilPay
- **x402-stacks:** https://www.npmjs.com/package/x402-stacks
- **Stacks Docs:** https://docs.stacks.co

## Cost Estimate

**Testnet (Free Tier):**
- $0/month
- Sufficient for testing and hackathons
- Service may sleep after inactivity

**Production (Starter+):**
- $7/month
- Always-on service
- Suitable for production MVP

**Production (Professional):**
- $25/month
- Better performance
- Recommended for high-traffic production use

---

## Quick Reference Commands

```bash
# View live logs
# Go to Render Dashboard → veilpay-x402-relayer → Logs

# Manual redeploy
# Go to Render Dashboard → veilpay-x402-relayer → Manual Deploy → Deploy latest commit

# Restart service
# Go to Render Dashboard → veilpay-x402-relayer → Manual Deploy → Clear build cache & deploy

# Check service health
curl https://your-service.onrender.com/health

# View x402 schema
curl https://your-service.onrender.com/x402/schema | jq '.'
```

---

**Deployment Status:** Ready to deploy! ✅

Follow these steps to get VeilPay x402 running in production on Render.
