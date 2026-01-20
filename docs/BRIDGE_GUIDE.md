# USDCx Bridge Integration Guide

## Overview

VeilPay works seamlessly with Circle's xReserve protocol to enable private transfers of USDC bridged from Ethereum to Stacks. This guide explains how to bridge USDC and use it privately with VeilPay.

## What is xReserve?

**xReserve** is Circle's cross-chain transfer protocol that enables USDC transfers between Ethereum and Stacks:

- **Secure**: Circle-operated bridge with institutional-grade security
- **Fast**: Deposits confirmed within minutes
- **Trusted**: Backed by Circle's USDC reserves
- **Native**: Creates native USDCx tokens on Stacks (not wrapped)

## Bridge Flow with VeilPay

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. ETHEREUM (Sepolia/Mainnet)
   User has USDC
   ↓
   [Bridge via xReserve]
   ↓
2. STACKS
   User receives USDCx
   ↓
   [Deposit into VeilPay]
   ↓
3. VEILPAY POOL
   USDCx locked, commitment stored
   User has private secret
   ↓
   [Time passes...]
   ↓
4. VEILPAY WITHDRAWAL
   User generates ZK proof
   USDCx sent to recipient address
   ↓
5. STACKS (Recipient)
   Recipient has USDCx
   ↓
   [Optional: Bridge back to Ethereum]
   ↓
6. ETHEREUM
   Recipient receives USDC
```

## Step-by-Step: Bridging USDC to Stacks

### Prerequisites

**For Testnet**:
- Ethereum wallet (MetaMask) with Sepolia testnet
- Stacks wallet (Leather or Hiro)
- Sepolia testnet ETH for gas
- Sepolia testnet USDC

**For Mainnet**:
- Ethereum wallet with mainnet
- Stacks wallet
- ETH for gas
- USDC to bridge

### Step 1: Get USDC on Ethereum

**Testnet (Sepolia)**:
```bash
# Get Sepolia ETH from faucet
https://sepoliafaucet.com/

# Get Sepolia USDC from Circle faucet
https://faucet.circle.com/
```

**Mainnet**:
- Purchase USDC on Ethereum (Coinbase, Uniswap, etc.)
- Or swap ETH → USDC on a DEX

### Step 2: Bridge USDC to Stacks

**Official Bridge Guide**: https://docs.stacks.co/more-guides/bridging-usdcx

**Bridge Process (Ethereum → Stacks)**:

1. **Approve xReserve Contract**:
   - Approve USDC spending by xReserve bridge
   - Contract: `0x008888878f94C0d87defdf0B07f46B93C1934442` (testnet)
   - Wait for Ethereum confirmation

2. **Call depositToRemote()**:
   - Amount: Minimum 1 USDC (testnet) or 10 USDC (mainnet)
   - Recipient: Your Stacks address (encoded as bytes32)
   - Domain ID: 10003 (Stacks domain)
   - Transaction on Ethereum

3. **Wait for Attestation**:
   - Circle's attestation service verifies deposit
   - Duration: ~15 minutes (both testnet and mainnet)
   - Automatic minting process

4. **Receive USDCx on Stacks**:
   - USDCx minted to your Stacks address
   - Contract: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`
   - Check balance in Stacks wallet or explorer

**Important Minimums**:
- **Testnet**: 1 USDC minimum
- **Mainnet**: 10 USDC minimum

### Step 3: Use USDCx with VeilPay

Once you have USDCx on Stacks:

1. **Open VeilPay App**: [App URL]

2. **Connect Stacks Wallet**: Click "Connect Wallet"

3. **Deposit into Privacy Pool**:
   ```
   Amount: 10 USDCx (or your amount)
   → Click "Deposit"
   → Approve transaction
   → Save your commitment secret!
   ```

4. **Withdraw Privately** (later):
   ```
   Select your deposit
   Recipient: [Any Stacks address]
   → Click "Withdraw"
   → Wait for ZK proof (~5 seconds)
   → USDCx sent privately!
   ```

## USDCx Token Details

### Contract Information

**Testnet (Sepolia)**:
- **USDCx (Stacks)**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`
- **USDC (Ethereum)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **xReserve Bridge**: `0x008888878f94C0d87defdf0B07f46B93C1934442`
- Symbol: USDCx
- Decimals: 6
- Standard: SIP-010

**Mainnet**:
- **USDCx (Stacks)**: [To be deployed on mainnet]
- **USDC (Ethereum)**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **xReserve Bridge**: [Mainnet address]
- Symbol: USDCx
- Decimals: 6
- Standard: SIP-010

**Bridge Configuration**:
- **Stacks Domain ID**: 10003 (constant across all networks)
- **Ethereum Domain ID**: 0

### Token Format

USDCx uses 6 decimals (same as USDC on Ethereum):
- 1 USDCx = 1,000,000 micro-units
- 10 USDCx = 10,000,000 micro-units
- 100 USDCx = 100,000,000 micro-units

## Privacy Considerations with Bridging

### Best Practices for Maximum Privacy

1. **Use Common Amounts**:
   - Bridge common amounts (10, 100, 1000 USDCx)
   - Increases anonymity set
   - Harder to correlate deposits/withdrawals

2. **Wait Between Bridge and Deposit**:
   - Don't deposit immediately after bridging
   - Let some time pass
   - Makes timing analysis harder

3. **Use Different Addresses**:
   - Bridge to Address A
   - Deposit from Address A
   - Withdraw to Address B
   - Maximum separation

4. **Batch with Others**:
   - Bridge when many users are bridging
   - Larger anonymity set
   - Better privacy

### What's Visible On-Chain

**Ethereum Side** (Public):
- Your Ethereum address bridged X USDC
- Destination Stacks address
- Amount bridged

**Stacks Side** (Public):
- Your Stacks address received X USDCx
- Your Stacks address deposited to VeilPay
- VeilPay commitment hash (no amount visible)

**VeilPay Side** (Private):
- Commitment hash only
- No sender/receiver link
- Withdrawal goes to any address
- **Privacy achieved!**

## Bridging Back to Ethereum

After withdrawing from VeilPay, you can bridge USDCx back to Ethereum:

1. **Withdraw from VeilPay** → Receive USDCx on Stacks

2. **Burn USDCx on Stacks**:
   - Call `burn()` on `.usdcx-v1` contract
   - Specify amount (minimum 4.80 USDCx)
   - Specify Ethereum domain (0) and recipient address
   - Recipient address must be padded to 32 bytes

3. **Wait for Verification**:
   - Duration: ~25 minutes (testnet) or ~60 minutes (mainnet)
   - xReserve verifies burn transaction

4. **Receive USDC on Ethereum**:
   - USDC released from xReserve to your Ethereum address
   - No link to original bridge transaction!
   - **Privacy maintained through VeilPay!**

## Fees

### Bridge Fees (xReserve)

**Ethereum → Stacks (Deposit)**:
- **Testnet**:
  - Minimum: 1 USDC
  - Gas fee: Sepolia ETH (free from faucet)
  - Bridge fee: None
  - Duration: ~15 minutes

- **Mainnet**:
  - Minimum: 10 USDC
  - Gas fee: ~$5-20 (depends on Ethereum gas price)
  - Bridge fee: None (Circle covers operational costs)
  - Duration: ~15 minutes

**Stacks → Ethereum (Withdrawal)**:
- **Testnet**:
  - Minimum: 4.80 USDCx
  - Gas fee: STX (from faucet)
  - Bridge fee: $4.80 USDC (burned)
  - Duration: ~25 minutes

- **Mainnet**:
  - Minimum: 4.80 USDCx
  - Gas fee: ~1-2 STX (~$1-2)
  - Bridge fee: $4.80 USDC (burned)
  - Duration: ~60 minutes

### VeilPay Fees

- **Deposit**: Gas only (~0.1 STX)
- **Withdrawal**: Gas + optional relayer fee (<0.5%)
- **No protocol fee**: VeilPay doesn't charge fees

### Total Cost Example (Mainnet)

Bridge 100 USDC from Ethereum → Use VeilPay → Bridge back:

```
1. Ethereum → Stacks (Deposit):
   - Amount: 100 USDC
   - Ethereum gas: ~$10
   - Bridge fee: $0 (Circle covers)
   - Duration: ~15 minutes
   - Total cost: ~$10

2. Deposit to VeilPay:
   - Amount: 100 USDCx
   - Stacks gas: ~$0.10
   - VeilPay fee: $0
   - Total cost: ~$0.10

3. Withdraw from VeilPay (Private!):
   - Amount: 100 USDCx
   - Stacks gas: ~$0.10
   - Relayer fee: ~$0.50
   - Total cost: ~$0.60

4. Stacks → Ethereum (Burn):
   - Amount: 95.20 USDCx (after bridge fee)
   - Stacks gas: ~$1
   - Bridge fee: $4.80 (minimum burn)
   - Duration: ~60 minutes
   - Total cost: ~$5.80

GRAND TOTAL: ~$16.50 for complete privacy
RECEIVED: 95.20 USDC on Ethereum
PRIVACY COST: ~$16.50 (or ~17.3% for this amount)

Note: For larger amounts, privacy cost percentage decreases
      (e.g., $1000 USDC = only ~2% privacy cost)
```

## Troubleshooting

### Bridge Issues

**Problem**: Bridge transaction pending for too long

**Solutions**:
- Check Ethereum gas price (may need to speed up)
- Verify sufficient ETH for gas
- Check bridge status page
- Contact Circle support if >1 hour

**Problem**: USDCx not appearing on Stacks

**Solutions**:
- Wait 5-10 minutes for confirmation
- Check Stacks explorer for transaction
- Verify correct Stacks address
- Check wallet is on correct network (testnet/mainnet)

### VeilPay Integration Issues

**Problem**: Can't deposit USDCx into VeilPay

**Solutions**:
- Verify USDCx balance in wallet
- Check if amount meets minimum (1 USDCx)
- Approve token spending first
- Check wallet is connected

**Problem**: Withdrawal not working

**Solutions**:
- Ensure proof generation completed
- Check relayer is online
- Verify commitment exists
- Try again after a few minutes

## Code Examples

### Bridge USDC from Ethereum to Stacks

```typescript
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Contract addresses (Testnet)
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const XRESERVE_ADDRESS = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const STACKS_DOMAIN_ID = 10003;

// Initialize clients
const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
const client = createWalletClient({
  account,
  chain: sepolia,
  transport: http()
});

// Step 1: Approve USDC spending
const approveHash = await client.writeContract({
  address: USDC_ADDRESS,
  abi: erc20Abi,
  functionName: 'approve',
  args: [XRESERVE_ADDRESS, parseUnits('10', 6)] // 10 USDC
});

await publicClient.waitForTransactionReceipt({ hash: approveHash });

// Step 2: Deposit to Stacks
// Convert Stacks address to bytes32
const stacksAddressBytes32 = '0x' + Buffer.from(stacksAddress).toString('hex').padStart(64, '0');

const depositHash = await client.writeContract({
  address: XRESERVE_ADDRESS,
  abi: xReserveAbi,
  functionName: 'depositToRemote',
  args: [
    parseUnits('10', 6),           // amount
    STACKS_DOMAIN_ID,              // destination domain
    stacksAddressBytes32           // recipient
  ]
});

console.log('Deposit transaction:', depositHash);
console.log('Wait ~15 minutes for USDCx to appear on Stacks');
```

### Check USDCx Balance on Stacks

```typescript
import { callReadOnlyFunction, principalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const balance = await callReadOnlyFunction({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'usdcx',
  functionName: 'get-balance',
  functionArgs: [principalCV(stacksAddress)],
  network: new StacksTestnet(),
  senderAddress: stacksAddress
});

console.log('USDCx Balance:', balance.value);
```

### Deposit USDCx to VeilPay

```typescript
import { makeContractCall, bufferCV, uintCV, contractPrincipalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { generateDeposit } from './crypto'; // VeilPay utility

// Amount in micro-units (6 decimals)
const amount = 10_000_000; // 10 USDCx

// Generate private commitment
const { secret, nonce, commitment } = await generateDeposit(amount);

// Store secret and nonce securely!
localStorage.setItem('veilpay_secret', JSON.stringify({ secret, nonce, commitment }));

// Deposit to VeilPay
const txOptions = {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'veilpay',
  functionName: 'deposit',
  functionArgs: [
    bufferCV(Buffer.from(commitment, 'hex')),
    uintCV(amount),
    contractPrincipalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'usdcx')
  ],
  network: new StacksTestnet(),
  anchorMode: 'any',
  postConditionMode: 'allow',
  onFinish: (data) => {
    console.log('Deposit successful!', data.txId);
  }
};

await makeContractCall(txOptions);
```

### Burn USDCx to Bridge Back to Ethereum

```typescript
import { makeContractCall, uintCV, bufferCV } from '@stacks/transactions';

// Ethereum address as bytes32 (padded)
const ethereumAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const recipientBytes32 = ethereumAddress.slice(2).padStart(64, '0');

// Burn USDCx (minimum 4.80 USDCx)
const burnTxOptions = {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'usdcx-v1',
  functionName: 'burn',
  functionArgs: [
    uintCV(10_000_000),                              // amount (10 USDCx)
    uintCV(0),                                       // Ethereum domain ID
    bufferCV(Buffer.from(recipientBytes32, 'hex'))   // recipient bytes32
  ],
  network: new StacksTestnet(),
  anchorMode: 'any',
  onFinish: (data) => {
    console.log('Burn initiated!', data.txId);
    console.log('Wait ~25 minutes for USDC on Ethereum');
  }
};

await makeContractCall(burnTxOptions);
```

## Resources

### Official Documentation
- [Stacks USDCx Bridge Guide](https://docs.stacks.co/more-guides/bridging-usdcx)
- [Circle xReserve Documentation](https://www.circle.com/cross-chain-transfer-protocol)
- [VeilPay Documentation](../README.md)

### Tools & Explorers
- Ethereum Sepolia Explorer: https://sepolia.etherscan.io
- Stacks Explorer: https://explorer.stacks.co
- Stacks Testnet Explorer: https://explorer.stacks.co/?chain=testnet

### Support
- Stacks Discord: https://stacks.chat
- Circle Support: https://support.circle.com
- VeilPay GitHub: https://github.com/carlos-israelj/VeilPay/issues

## Security Notes

### Trust Assumptions

1. **xReserve Bridge**: Trust Circle to operate bridge honestly
2. **USDCx Token**: Trust Circle to maintain USDC reserves
3. **VeilPay Relayer**: Trust relayer to verify proofs (can't steal funds)

### Risk Mitigation

- Use testnet first to understand the flow
- Start with small amounts
- Verify contract addresses
- Keep commitment secrets secure
- Use hardware wallet for large amounts

### Privacy Best Practices

- Don't reuse addresses
- Use common denominations
- Wait between bridge and deposit
- Mix with other users' transactions
- Consider using Tor for extra privacy

---

**Ready to use VeilPay with USDCx?**

1. Bridge USDC from Ethereum to Stacks
2. Deposit into VeilPay privacy pool
3. Withdraw to any address privately
4. Enjoy complete financial privacy!
