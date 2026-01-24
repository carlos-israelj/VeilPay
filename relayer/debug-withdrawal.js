#!/usr/bin/env node

/**
 * Debug withdrawal argument construction
 */

import { Cl, cvToHex } from '@stacks/transactions';

// Test with sample data similar to what we'd use in a real withdrawal
const nullifierHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; //  64 chars = 32 bytes
const recipient = 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1';
const amount = 1000000; // 1 USDCx
const root = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'; // 64 chars = 32 bytes
const messageHash = 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'; // 64 chars = 32 bytes
const signature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01'; // 130 chars = 65 bytes
const usdcxAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const usdcxName = 'usdcx';

console.log('Input lengths:');
console.log(' nullifierHash:', nullifierHash.length, 'chars =', nullifierHash.length / 2, 'bytes');
console.log(' recipient:', recipient);
console.log(' amount:', amount);
console.log(' root:', root.length, 'chars =', root.length / 2, 'bytes');
console.log(' messageHash:', messageHash.length, 'chars =', messageHash.length / 2, 'bytes');
console.log(' signature:', signature.length, 'chars =', signature.length / 2, 'bytes');
console.log();

try {
  const functionArgs = [
    Cl.buffer(Buffer.from(nullifierHash, 'hex')),
    Cl.principal(recipient),
    Cl.uint(amount),
    Cl.buffer(Buffer.from(root, 'hex')),
    Cl.buffer(Buffer.from(messageHash, 'hex')),
    Cl.buffer(Buffer.from(signature, 'hex')),
    Cl.contractPrincipal(usdcxAddress, usdcxName)
  ];

  console.log('Clarity function args constructed successfully:');
  functionArgs.forEach((arg, idx) => {
    const names = ['nullifier-hash', 'recipient', 'amount', 'root', 'message-hash', 'signature', 'token-contract'];
    console.log(`  [${idx}] ${names[idx]}:`, arg);

    // For buffers, show the byte length
    if (arg.type === 2) { // ClarityType.Buffer
      console.log(`       Buffer length: ${arg.buffer.length} bytes`);
    }
  });

  console.log('\n✅ All arguments constructed successfully');
  console.log('Expected contract signature:');
  console.log('  (nullifier-hash (buff 32))');
  console.log('  (recipient principal)');
  console.log('  (amount uint)');
  console.log('  (root (buff 32))');
  console.log('  (message-hash (buff 32))');
  console.log('  (relayer-signature (buff 65))');
  console.log('  (token-contract <ft-trait>)');

} catch (err) {
  console.error('❌ Error constructing arguments:', err.message);
  console.error(err.stack);
}
