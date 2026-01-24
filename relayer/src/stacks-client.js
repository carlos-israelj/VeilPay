import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Cl
} from '@stacks/transactions';

import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export class StacksClient {
  constructor(networkType = 'testnet') {
    this.network = networkType === 'mainnet'
      ? STACKS_MAINNET
      : STACKS_TESTNET;

    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractName = process.env.CONTRACT_NAME || 'veilpay';

    // USDCx token contract (official Circle deployment)
    this.usdcxAddress = process.env.USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.usdcxName = process.env.USDCX_NAME || 'usdcx';
  }

  /**
   * Submit a withdrawal transaction
   * Includes message-hash parameter for signature verification
   */
  async submitWithdrawal({ nullifierHash, recipient, amount, root, messageHash, signature }) {
    console.log('[STACKS-CLIENT] Submitting withdrawal');

    // Convert nullifierHash from decimal string to hex if needed
    let nullifierHashHex = nullifierHash;
    if (typeof nullifierHash === 'string' && nullifierHash.length !== 64) {
      // It's likely a decimal string (not 64 hex chars), convert to hex
      nullifierHashHex = BigInt(nullifierHash).toString(16).padStart(64, '0');
      console.log('[STACKS-CLIENT] Converted nullifierHash from decimal to hex:', nullifierHashHex);
    } else if (typeof nullifierHash === 'number' || typeof nullifierHash === 'bigint') {
      // It's a number, convert to hex
      nullifierHashHex = BigInt(nullifierHash).toString(16).padStart(64, '0');
      console.log('[STACKS-CLIENT] Converted nullifierHash from number to hex:', nullifierHashHex);
    }

    console.log('[STACKS-CLIENT] Raw inputs:');
    console.log('  nullifierHash:', nullifierHashHex, `(${nullifierHashHex.length} chars = ${nullifierHashHex.length / 2} bytes)`);
    console.log('  recipient:', recipient);
    console.log('  amount:', amount);
    console.log('  root:', root, `(${root.length} chars = ${root.length / 2} bytes)`);
    console.log('  messageHash:', messageHash, `(${messageHash.length} chars = ${messageHash.length / 2} bytes)`);
    console.log('  signature:', signature, `(${signature.length} chars = ${signature.length / 2} bytes)`);

    const functionArgs = [
      Cl.buffer(Buffer.from(nullifierHashHex, 'hex')),
      Cl.principal(recipient),
      Cl.uint(amount),
      Cl.buffer(Buffer.from(root, 'hex')),
      Cl.buffer(Buffer.from(signature, 'hex')),
      Cl.contractPrincipal(this.usdcxAddress, this.usdcxName)
    ];

    console.log('[STACKS-CLIENT] Clarity function args:');
    functionArgs.forEach((arg, idx) => {
      console.log(`  [${idx}]:`, arg);
    });

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'withdraw',
      functionArgs,
      senderKey: process.env.RELAYER_PRIVATE_KEY,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    console.log('Transaction prepared, broadcasting...');

    // In v7.x, broadcastTransaction expects { transaction, network }
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: this.network
    });

    console.log('Broadcast response:', JSON.stringify(broadcastResponse, null, 2));

    // Check if broadcast was successful
    if (broadcastResponse.error) {
      throw new Error(`Broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
    }

    return broadcastResponse.txid;
  }

  /**
   * Update merkle root on contract
   */
  async updateRoot(newRoot) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'update-root',
      functionArgs: [
        Cl.buffer(Buffer.from(newRoot, 'hex'))
      ],
      senderKey: process.env.RELAYER_PRIVATE_KEY,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);

    // In v7.x, broadcastTransaction expects { transaction, network }
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: this.network
    });

    // Check if broadcast was successful
    if (broadcastResponse.error) {
      throw new Error(`Broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
    }

    return broadcastResponse.txid;
  }

  /**
   * Check if nullifier has been used
   */
  async isNullifierUsed(nullifier) {
    // Implementation would use Stacks API to call read-only function
    // For now, this is a placeholder
    return false;
  }

  /**
   * Get current merkle root from contract
   */
  async getCurrentRoot() {
    // Implementation would use Stacks API to call read-only function
    // For now, this is a placeholder
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}
