import * as stacksTransactions from '@stacks/transactions';
import * as stacksNetwork from '@stacks/network';

const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  uintCV,
  principalCV,
  contractPrincipalCV
} = stacksTransactions;

const { STACKS_TESTNET, STACKS_MAINNET } = stacksNetwork;

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
    console.log('[STACKS-CLIENT] messageHash length:', messageHash.length, 'characters =', messageHash.length / 2, 'bytes');
    console.log('[STACKS-CLIENT] signature length:', signature.length, 'characters =', signature.length / 2, 'bytes');

    const functionArgs = [
      bufferCV(Buffer.from(nullifierHash, 'hex')),
      principalCV(recipient),
      uintCV(amount),
      bufferCV(Buffer.from(root, 'hex')),
      bufferCV(Buffer.from(messageHash, 'hex')),
      bufferCV(Buffer.from(signature, 'hex')),
      contractPrincipalCV(this.usdcxAddress, this.usdcxName)
    ];

    console.log('[STACKS-CLIENT] functionArgs count:', functionArgs.length);

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
    const broadcastResponse = await broadcastTransaction(transaction, this.network);

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
        bufferCV(Buffer.from(newRoot, 'hex'))
      ],
      senderKey: process.env.RELAYER_PRIVATE_KEY,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);

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
