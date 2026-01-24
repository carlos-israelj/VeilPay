# VeilPay Deployment Status

**Date:** 2026-01-24
**Status:** ✅ RUNNING

---

## Services Running

### 1. Relayer Service
- **Status:** ✅ Running
- **URL:** http://localhost:3001
- **Process:** Node.js (PID: 324593)
- **Directory:** `/mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay/relayer`

**Health Check:**
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","service":"veilpay-relayer"}
```

**Current Stats:**
```json
{
    "totalDeposits": 14,
    "currentRoot": "1d202a9571482d9920bc05aa55a9150d0969f1f49092206c049e804da14e041c",
    "relayerAddress": "ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1"
}
```

**Key Features:**
- ✅ Poseidon hash initialized
- ✅ Merkle tree manager active (14 deposits indexed)
- ✅ Blockchain indexer monitoring
- ✅ nullifierHash decimal-to-hex conversion fix applied

### 2. Frontend Service
- **Status:** ✅ Running
- **URL:** http://localhost:3003
- **Framework:** Vite 5.4.21 + React 18.2.0
- **Directory:** `/mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay/frontend`

**Access:**
- Open browser to: **http://localhost:3003**
- Frontend connects to relayer at: http://localhost:3001

---

## Environment Configuration

### Relayer (.env)
```bash
PORT=3001
STACKS_NETWORK=testnet
CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
CONTRACT_NAME=veilpay
USDCX_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
USDCX_NAME=usdcx
RELAYER_PRIVATE_KEY=866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01
```

### Frontend (.env)
```bash
VITE_CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
VITE_CONTRACT_NAME=veilpay
VITE_USDCX_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
VITE_USDCX_NAME=usdcx
VITE_RELAYER_URL=http://localhost:3001
VITE_STACKS_NETWORK=testnet
```

---

## Testing the Deployment

### 1. Test Relayer Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get current Merkle root
curl http://localhost:3001/root

# Get stats
curl http://localhost:3001/stats

# Get proof for a commitment (example)
curl http://localhost:3001/proof/<COMMITMENT_HEX>
```

### 2. Test Frontend

1. Open browser to: http://localhost:3003
2. You should see the VeilPay interface
3. Connect a Stacks wallet (Leather or Hiro)
4. Try making a deposit or withdrawal

### 3. End-to-End Test Flow

**Deposit:**
1. Open http://localhost:3003
2. Connect wallet
3. Enter amount (e.g., 1 USDCx = 1000000 micro-units)
4. Click "Deposit"
5. Save the secret and nonce (IMPORTANT!)
6. Wait for relayer to index (~30 seconds)

**Verify Deposit Indexed:**
```bash
curl http://localhost:3001/stats
# Check that totalDeposits increased
```

**Withdraw:**
1. Enter saved secret and nonce
2. Enter recipient address
3. Click "Withdraw"
4. Wait for ZK proof generation
5. Transaction should be submitted without ERR-INVALID-SIGNATURE

---

## Recent Fixes Applied

### ✅ nullifierHash Conversion Fix
**Issue:** ERR-INVALID-SIGNATURE during withdrawals
**Cause:** nullifierHash received as decimal string but treated as hex
**Fix:** Convert decimal → hex before signing (see `SIGNATURE-FIX-VALIDATION.md`)

**Files Modified:**
- `relayer/src/index.js` (lines 95-101)
- `relayer/src/stacks-client.js` (lines 32-42)

**Validation:**
```bash
# Test script confirms fix:
node test-signature-fix.js
```

---

## Known Issues & Warnings

### ⚠️ Workspace Dependencies
The project uses npm workspaces, which can cause dependency resolution issues in WSL. Dependencies are being hoisted to the root `node_modules`.

**Workaround Applied:**
- Installed dependencies locally in each subdirectory
- Using `--legacy-peer-deps` flag for installations

### ⚠️ Vite Deprecation Warning
```
The CJS build of Vite's Node API is deprecated.
```
**Impact:** Cosmetic only, doesn't affect functionality
**Fix:** Can be addressed by adding `"type": "module"` to package.json

### ⚠️ Port Assignment
- Relayer: Port 3001 (as configured)
- Frontend: Port 3003 (auto-selected, ports 3000-3002 were in use)

---

## Process Management

### View Running Processes
```bash
# Check relayer
lsof -i :3001

# Check frontend
lsof -i :3003

# Or use netstat
netstat -tulpn | grep -E '3001|3003'
```

### Stop Services

**Relayer:**
```bash
# Find PID
lsof -i :3001
# Kill process
kill <PID>
```

**Frontend:**
```bash
# Find PID
lsof -i :3003
# Kill process
kill <PID>

# Or use Ctrl+C in the terminal where it's running
```

### Restart Services

**Relayer:**
```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay/relayer
node src/index.js &
```

**Frontend:**
```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Stacks/VeilPay/frontend
npx vite &
```

---

## Logs & Monitoring

### Relayer Logs
**Expected output on startup:**
```
VeilPay Relayer running on port 3001
Relayer address: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1
Contract: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay
Initializing Poseidon...
Merkle tree initialized (using Poseidon)
Starting blockchain indexer...
Starting blockchain monitoring (every 30s)...
```

**During deposit indexing:**
```
Fetching events from: https://api.testnet.hiro.so/extended/v1/contract/...
Found 1 deposit events
Adding commitment: 312080a32b7d8f5e... (1.0 USDCx)
New merkle root: 4a7d8e3f2b1c9a5d...
Total commitments in tree: 15
```

**During withdrawal:**
```
Verifying ZK proof...
Proof verification result: true
Current root: 1d202a9571482d9920bc05aa55a9150d0969f1f49092206c049e804da14e041c
Provided root: 1d202a9571482d9920bc05aa55a9150d0969f1f49092206c049e804da14e041c
Signing withdrawal...
[INDEX] Converted nullifierHash for signing: 0235c5a17b2f4e8d...
[SIGNER] Message hash: 7e2d8511d42a1b02...
Submitting transaction to Stacks...
Transaction submitted! TxID: 0x...
```

### Frontend Console
Open browser DevTools (F12) and check for:
- ✅ Successful API calls to http://localhost:3001
- ✅ ZK proof generation progress
- ✅ Transaction submission confirmations

---

## Next Steps for Testing

1. **Make a Test Deposit:**
   - Use testnet USDCx
   - Start with small amount (1 USDCx)
   - **SAVE the secret/nonce!**

2. **Wait for Indexing:**
   - Monitor relayer logs
   - Check `/stats` endpoint
   - Should take ~30 seconds

3. **Test Withdrawal:**
   - Use saved secret/nonce
   - Enter recipient address
   - Monitor for signature verification success
   - Should NOT see ERR-INVALID-SIGNATURE

4. **Verify Privacy:**
   - Withdraw to different address than deposit
   - Check that commitment → nullifier linkage is hidden
   - Verify transaction on Stacks explorer

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:** Reinstall relayer dependencies
```bash
cd relayer && npm install --legacy-peer-deps
```

### Issue: "vite: not found"
**Solution:** Use npx to run vite
```bash
cd frontend && npx vite
```

### Issue: "Port already in use"
**Solution:** Kill existing process
```bash
lsof -i :<PORT>
kill <PID>
```

### Issue: "ERR-INVALID-SIGNATURE"
**Check:** Ensure nullifierHash conversion fix is applied
```bash
# Verify in relayer/src/index.js line 95-101
# Should see: BigInt(nullifierHash).toString(16).padStart(64, '0')
```

---

## Quick Reference

**Relayer:**
- Start: `cd relayer && node src/index.js`
- Health: `curl http://localhost:3001/health`
- Stats: `curl http://localhost:3001/stats`

**Frontend:**
- Start: `cd frontend && npx vite`
- Access: http://localhost:3003
- Config: `frontend/.env`

**Both Services:**
```bash
# Terminal 1
cd relayer && node src/index.js

# Terminal 2
cd frontend && npx vite
```

---

## Summary

✅ **Relayer:** Running on port 3001, 14 deposits indexed
✅ **Frontend:** Running on port 3003, connected to relayer
✅ **Fix Applied:** nullifierHash conversion (decimal → hex)
✅ **Ready for Testing:** End-to-end deposit/withdrawal flow

**Status:** Both services are operational and ready for testing the signature fix!
