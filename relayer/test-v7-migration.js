#!/usr/bin/env node

/**
 * VeilPay Relayer - v7.x API Migration Test Suite
 * Tests that all v7.x API changes are working correctly
 */

import { Cl, cvToHex, signMessageHashRsv, makeContractCall } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { RelayerSigner } from './src/signer.js';
import { StacksClient } from './src/stacks-client.js';

console.log('=================================================');
console.log('VeilPay Relayer - v7.x API Migration Test Suite');
console.log('=================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Cl helper API
  console.log('Test 1: Cl helper API');
  try {
    const testPrincipal = Cl.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const testUint = Cl.uint(1000000);
    const testBuffer = Cl.buffer(Buffer.from('0123456789abcdef', 'hex'));
    console.log('  ✅ Cl.principal() works');
    console.log('  ✅ Cl.uint() works');
    console.log('  ✅ Cl.buffer() works');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Test 2: cvToHex serialization
  console.log('\nTest 2: cvToHex serialization');
  try {
    const testCV = Cl.uint(42);
    const hex = cvToHex(testCV);
    if (typeof hex !== 'string' || !hex.startsWith('0x')) {
      throw new Error('cvToHex should return hex string with 0x prefix');
    }
    console.log('  ✅ cvToHex returns:', hex);

    const principalCV = Cl.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const principalHex = cvToHex(principalCV);
    const principalBytes = Buffer.from(principalHex.replace('0x', ''), 'hex');
    console.log('  ✅ Principal serializes to', principalBytes.length, 'bytes');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Test 3: signMessageHashRsv
  console.log('\nTest 3: signMessageHashRsv');
  try {
    const testHash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const testPrivateKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const signature = signMessageHashRsv({
      messageHash: testHash,
      privateKey: testPrivateKey
    });

    if (typeof signature !== 'string') {
      throw new Error('signMessageHashRsv should return hex string');
    }
    if (signature.length !== 130) {
      throw new Error(`Signature should be 130 chars (65 bytes), got ${signature.length}`);
    }
    console.log('  ✅ signMessageHashRsv returns 65-byte signature');
    console.log('  ✅ Signature:', signature.substring(0, 32) + '...');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Test 4: RelayerSigner
  console.log('\nTest 4: RelayerSigner module');
  try {
    const testPrivateKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const signer = new RelayerSigner(testPrivateKey);

    const address = signer.getAddress('testnet');
    console.log('  ✅ Signer initialized, address:', address);

    const result = await signer.signWithdrawal(
      '1111111111111111111111111111111111111111111111111111111111111111',
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      1000000,
      '2222222222222222222222222222222222222222222222222222222222222222'
    );

    if (!result.signature || !result.messageHash) {
      throw new Error('Signature result missing fields');
    }
    if (result.signature.length !== 130) {
      throw new Error(`Signature should be 130 chars, got ${result.signature.length}`);
    }
    console.log('  ✅ signWithdrawal generates valid signature');
    console.log('  ✅ Message hash:', result.messageHash.substring(0, 16) + '...');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Test 5: StacksClient
  console.log('\nTest 5: StacksClient module');
  try {
    process.env.CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    process.env.CONTRACT_NAME = 'veilpay';
    process.env.RELAYER_PRIVATE_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const client = new StacksClient('testnet');

    if (!client.network || !client.contractAddress) {
      throw new Error('StacksClient not properly initialized');
    }

    console.log('  ✅ StacksClient initialized');
    console.log('  ✅ Contract:', client.contractAddress + '.' + client.contractName);
    console.log('  ✅ Network: testnet');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Test 6: Network constants
  console.log('\nTest 6: Network constants');
  try {
    if (!STACKS_TESTNET) {
      throw new Error('STACKS_TESTNET not available');
    }
    console.log('  ✅ STACKS_TESTNET is available');
    console.log('  ✅ Network URL:', STACKS_TESTNET.coreApiUrl || 'default');
    passed++;
  } catch (err) {
    console.error('  ❌ Failed:', err.message);
    failed++;
  }

  // Summary
  console.log('\n=================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('=================================================');

  if (failed === 0) {
    console.log('✅ All tests passed! v7.x migration successful.\n');
    return 0;
  } else {
    console.log('❌ Some tests failed. Please review the errors.\n');
    return 1;
  }
}

runTests().then(code => process.exit(code)).catch(err => {
  console.error('❌ Test suite error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
