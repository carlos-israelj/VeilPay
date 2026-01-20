# VeilPay Testnet Quick Start Guide

Complete guide to testing VeilPay on Stacks testnet with USDCx bridged from Ethereum Sepolia.

## Prerequisites

### 1. Ethereum Sepolia Wallet
- Install MetaMask or similar Ethereum wallet
- Switch to Sepolia testnet
- Get Sepolia ETH: https://sepoliafaucet.com/
- Get Sepolia USDC: https://faucet.circle.com/

### 2. Stacks Testnet Wallet
- Install Leather Wallet or Hiro Wallet
- Switch to testnet mode
- Get testnet STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet

## Official Contract Addresses (Testnet)

### Ethereum Sepolia
- **USDC Token**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **xReserve Bridge**: `0x008888878f94C0d87defdf0B07f46B93C1934442`
- **Domain ID**: 0

### Stacks Testnet
- **USDCx Token**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`
- **USDCx-v1 (Entry Point)**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx-v1`
- **VeilPay Contract**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.veilpay`
- **Domain ID**: 10003

### Stacks Mainnet
- **USDCx Token**: `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx`
- **USDCx-v1 (Entry Point)**: `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx-v1`
- **VeilPay Contract**: [To be deployed]
- **Domain ID**: 10003

## Step-by-Step Testing

### Phase 1: Bridge USDC to Stacks

**Minimum Amount**: 1 USDC
**Time**: ~15 minutes

1. **Get Sepolia USDC**:
   ```
   Visit: https://faucet.circle.com/
   Connect MetaMask
   Request testnet USDC
   ```

2. **Approve xReserve** (First time only):
   ```javascript
   // Using ethers.js or similar
   const usdcContract = new ethers.Contract(
     '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
     erc20Abi,
     signer
   );

   await usdcContract.approve(
     '0x008888878f94C0d87defdf0B07f46B93C1934442',
     ethers.utils.parseUnits('10', 6) // 10 USDC
   );
   ```

3. **Bridge to Stacks**:
   ```javascript
   const xReserveContract = new ethers.Contract(
     '0x008888878f94C0d87defdf0B07f46B93C1934442',
     xReserveAbi,
     signer
   );

   // Convert Stacks address to bytes32
   const stacksAddressBytes32 = '0x' +
     Buffer.from(stacksAddress).toString('hex').padStart(64, '0');

   await xReserveContract.depositToRemote(
     ethers.utils.parseUnits('10', 6), // amount
     10003,                              // Stacks domain
     stacksAddressBytes32,               // recipient
     '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC token
     0,                                  // maxFee
     '0x'                                // hookData
   );
   ```

4. **Wait for Attestation**:
   - Transaction on Ethereum: 1-2 minutes
   - Circle attestation service: ~15 minutes
   - USDCx minted on Stacks automatically

5. **Verify USDCx Balance**:
   ```
   Check in Stacks wallet or explorer:
   https://explorer.hiro.so/?chain=testnet

   Search for your address
   Look for USDCx balance
   ```

### Phase 2: Use VeilPay for Private Transfers

**Minimum Deposit**: 1 USDCx (1,000,000 micro-units)

1. **Access VeilPay** (when deployed):
   ```
   Visit: [VeilPay testnet URL]
   Connect Stacks wallet
   ```

2. **Deposit into Privacy Pool**:
   ```
   Click "Deposit" tab
   Enter amount: 10 USDCx
   Click "Deposit"
   Approve transaction in wallet

   IMPORTANT: Save the commitment secret shown!
   Store it securely - you'll need it to withdraw
   ```

3. **Wait for Confirmation**:
   - Transaction confirmation: 1-2 minutes
   - Merkle tree update: Automatic
   - Your commitment is now private on-chain

4. **Withdraw to Different Address** (Privacy!):
   ```
   Click "Withdraw" tab
   Select your deposit from list
   Enter recipient address (can be ANY Stacks address)
   Click "Withdraw"

   ZK proof generation: ~5-10 seconds
   Transaction submitted by relayer
   ```

5. **Verify Privacy**:
   ```
   Check blockchain explorer:
   - Deposit visible from your address
   - Withdrawal visible to recipient
   - NO LINK between the two transactions!

   Privacy achieved! 🎉
   ```

### Phase 3: Bridge Back to Ethereum (Optional)

**Minimum Amount**: 4.80 USDCx (includes $4.80 burn fee)
**Time**: ~25 minutes on testnet

1. **Burn USDCx on Stacks**:
   ```clarity
   ;; Call burn function
   (contract-call?
     'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx-v1
     burn
     u10000000  ;; 10 USDCx
     u0         ;; Ethereum domain
     0x[your-eth-address-padded-to-32-bytes]
   )
   ```

2. **Wait for Processing**:
   - Burn confirmed on Stacks: 1-2 minutes
   - xReserve verification: ~25 minutes
   - USDC released on Ethereum

3. **Verify on Ethereum**:
   ```
   Check Sepolia explorer:
   https://sepolia.etherscan.io/

   Your address should receive USDC
   ```

## Expected Fees (Testnet)

### Bridge Ethereum → Stacks
- Minimum: 1 USDC
- Gas: Free (Sepolia ETH from faucet)
- Bridge fee: $0
- Time: ~15 minutes

### VeilPay Deposit
- Minimum: 1 USDCx
- Gas: ~0.1 STX (from faucet)
- Protocol fee: $0
- Time: 1-2 minutes

### VeilPay Withdrawal
- Gas: ~0.1 STX
- Relayer fee: ~$0.50 (testnet may be $0)
- Time: 5-10 seconds (proof) + 1-2 min (tx)

### Bridge Stacks → Ethereum
- Minimum: 4.80 USDCx
- Gas: ~0.5 STX
- Bridge fee: $4.80 (burned)
- Time: ~25 minutes

## Troubleshooting

### "Insufficient USDC balance"
- Get more from Circle faucet
- Wait for faucet cooldown period
- Try with smaller amount (min 1 USDC)

### "Bridge taking too long"
- Testnet attestation can take up to 20 minutes
- Check Ethereum tx confirmed on Sepolia
- Verify correct Stacks address used
- Wait patiently - it will arrive!

### "Can't deposit to VeilPay"
- Verify USDCx balance in Stacks wallet
- Check minimum 1 USDCx (1,000,000 micro-units)
- Ensure wallet connected to testnet
- Try refreshing page

### "Withdrawal proof generation failed"
- Check you have correct commitment secret
- Verify deposit was confirmed
- Try again - proof generation is CPU intensive
- Check browser console for errors

### "Bridge back to Ethereum not working"
- Minimum is 4.80 USDCx (includes fee)
- Ensure Ethereum address padded to 32 bytes
- Wait full 25 minutes before checking
- Check Stacks tx confirmed first

## Testing Checklist

- [ ] Get Sepolia ETH from faucet
- [ ] Get Sepolia USDC from Circle faucet
- [ ] Bridge 10 USDC from Ethereum to Stacks
- [ ] Verify USDCx received on Stacks
- [ ] Deposit 10 USDCx into VeilPay
- [ ] Save commitment secret
- [ ] Withdraw to different Stacks address
- [ ] Verify privacy (no link between deposit/withdrawal)
- [ ] (Optional) Bridge 5 USDCx back to Ethereum
- [ ] (Optional) Verify USDC received on Ethereum

## Resources

### Faucets
- **Sepolia ETH**: https://sepoliafaucet.com/
- **Sepolia USDC**: https://faucet.circle.com/
- **Stacks STX**: https://explorer.hiro.so/sandbox/faucet?chain=testnet

### Explorers
- **Sepolia**: https://sepolia.etherscan.io/
- **Stacks Testnet**: https://explorer.hiro.so/?chain=testnet

### Documentation
- **Official Bridge Guide**: https://docs.stacks.co/more-guides/bridging-usdcx
- **VeilPay Docs**: [GitHub repo]/docs/
- **Circle xReserve**: https://www.circle.com/cross-chain-transfer-protocol

### Support
- **Stacks Discord**: https://stacks.chat
- **VeilPay GitHub**: https://github.com/carlos-israelj/VeilPay/issues
- **Circle Support**: https://support.circle.com/

## Example Transactions

Will be updated with real testnet transaction examples once contracts are deployed.

### Successful Bridge (Ethereum → Stacks)
```
Ethereum Tx: 0x...
Stacks Tx: 0x...
Time: 14 minutes
```

### Successful VeilPay Deposit
```
Stacks Tx: 0x...
Commitment: 0x...
Time: 1.5 minutes
```

### Successful VeilPay Withdrawal
```
Stacks Tx: 0x...
Nullifier: 0x...
Time: 8 seconds (proof) + 1.2 minutes (tx)
Privacy: Confirmed ✅
```

---

**Ready to test VeilPay on testnet?** Follow this guide step by step and experience true privacy for USDCx on Stacks!
