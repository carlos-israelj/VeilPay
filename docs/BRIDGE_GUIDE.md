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

**Using the Bridge**:

1. **Visit xReserve Bridge**:
   - Testnet: [Testnet bridge URL]
   - Mainnet: [Mainnet bridge URL]

2. **Connect Wallets**:
   - Connect Ethereum wallet (source)
   - Connect Stacks wallet (destination)

3. **Initiate Bridge**:
   ```
   From: Ethereum (Sepolia/Mainnet)
   To: Stacks
   Token: USDC
   Amount: [Enter amount]
   ```

4. **Approve USDC**:
   - First transaction: Approve USDC spending
   - Wait for confirmation

5. **Deposit USDC**:
   - Second transaction: Deposit to bridge
   - Wait for confirmation (2-5 minutes)

6. **Receive USDCx on Stacks**:
   - USDCx appears in your Stacks wallet
   - Check balance in wallet or explorer

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

**Testnet**:
- Contract: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`
- Symbol: USDCx
- Decimals: 6
- Standard: SIP-010

**Mainnet**:
- Contract: [Mainnet USDCx contract]
- Symbol: USDCx
- Decimals: 6
- Standard: SIP-010

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

2. **Bridge USDCx to Ethereum**:
   - Use xReserve bridge in reverse
   - Connect Stacks wallet (source)
   - Connect Ethereum wallet (destination)
   - Bridge USDCx → USDC

3. **Receive USDC on Ethereum**:
   - USDC appears in your Ethereum wallet
   - No link to original bridge transaction!

## Fees

### Bridge Fees (xReserve)

**Ethereum → Stacks**:
- Gas fee: ~$5-20 (depends on Ethereum gas price)
- Bridge fee: 0.1% of amount (Circle fee)
- Minimum: Varies by network conditions

**Stacks → Ethereum**:
- Gas fee: ~1-2 STX (~$1-2)
- Bridge fee: 0.1% of amount
- Settlement time: 5-10 minutes

### VeilPay Fees

- **Deposit**: Gas only (~0.1 STX)
- **Withdrawal**: Gas + optional relayer fee (<0.5%)
- **No protocol fee**: VeilPay doesn't charge fees

### Total Cost Example

Bridge 100 USDC from Ethereum → Use VeilPay → Bridge back:

```
1. Ethereum → Stacks:
   - 100 USDC bridge fee: $0.10
   - Ethereum gas: ~$10
   - Total: ~$10.10

2. Deposit to VeilPay:
   - Stacks gas: ~$0.10
   - Total: ~$0.10

3. Withdraw from VeilPay:
   - Stacks gas: ~$0.10
   - Relayer fee: ~$0.50
   - Total: ~$0.60

4. Stacks → Ethereum:
   - 100 USDC bridge fee: $0.10
   - Stacks gas: ~$1
   - Total: ~$1.10

GRAND TOTAL: ~$11.90 for complete privacy
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

### Check USDCx Balance

```clarity
;; Read-only call to check balance
(contract-call? .usdcx get-balance tx-sender)
```

```javascript
// JavaScript/TypeScript
import { callReadOnlyFunction } from '@stacks/transactions';

const balance = await callReadOnlyFunction({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'usdcx',
  functionName: 'get-balance',
  functionArgs: [principalCV(address)],
  network: new StacksTestnet()
});
```

### Deposit USDCx to VeilPay

```javascript
import { makeContractCall, bufferCV, uintCV, contractPrincipalCV } from '@stacks/transactions';

// Generate commitment
const { commitment } = await generateDeposit(amount);

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
  // ... other options
};

await makeContractCall(txOptions);
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
