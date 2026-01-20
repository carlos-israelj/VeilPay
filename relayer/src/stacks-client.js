import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  uintCV,
  principalCV,
  contractPrincipalCV
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export class StacksClient {
  constructor(networkType = 'testnet') {
    this.network = networkType === 'mainnet'
      ? new StacksMainnet()
      : new StacksTestnet();

    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.contractName = process.env.CONTRACT_NAME || 'veilpay';

    // USDCx token contract (official Circle deployment)
    this.usdcxAddress = process.env.USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    this.usdcxName = process.env.USDCX_NAME || 'usdcx';
  }

  /**
   * Submit a withdrawal transaction
   */
  async submitWithdrawal({ nullifierHash, recipient, amount, root, signature }) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'withdraw',
      functionArgs: [
        bufferCV(Buffer.from(nullifierHash, 'hex')),
        principalCV(recipient),
        uintCV(amount),
        bufferCV(Buffer.from(root, 'hex')),
        bufferCV(Buffer.from(signature, 'hex')),
        contractPrincipalCV(this.usdcxAddress, this.usdcxName)
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
