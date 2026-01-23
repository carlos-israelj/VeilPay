import { createHash } from 'crypto';
import * as stacksTransactions from '@stacks/transactions';

const {
  privateKeyToPublic,
  privateKeyToAddress,
  getAddressFromPrivateKey,
  signWithKey,
  serializeCV,
  principalCV,
  uintCV
} = stacksTransactions;

export class RelayerSigner {
  constructor(privateKeyHex) {
    if (!privateKeyHex) {
      throw new Error('Private key required');
    }
    // Store the raw hex private key (v7 API doesn't use createStacksPrivateKey)
    this.privateKeyHex = privateKeyHex;
    // Get the public key from private key
    this.publicKey = privateKeyToPublic(privateKeyHex);
  }

  /**
   * Get relayer address
   */
  getAddress(network = 'testnet') {
    // Use getAddressFromPrivateKey which handles both mainnet/testnet
    return getAddressFromPrivateKey(this.privateKeyHex, network);
  }

  /**
   * Get public key in compressed format
   */
  getPublicKey() {
    return this.publicKey;
  }

  /**
   * Sign a withdrawal request
   * Creates same message hash that the Clarity contract expects
   *
   * FIXED VERSION: to-consensus-buff? INCLUDES the type byte!
   */
  async signWithdrawal(nullifierHash, recipient, amount, root) {
    // Serialize values using serializeCV (same as to-consensus-buff?)
    const recipientCV = principalCV(recipient);
    const amountCV = uintCV(amount);

    const recipientSerialized = serializeCV(recipientCV);
    const amountSerialized = serializeCV(amountCV);

    // KEY FIX: Do NOT remove type byte! to-consensus-buff? includes it
    const recipientBuff = recipientSerialized;  // Keep full serialization
    const amountBuff = amountSerialized;        // Keep full serialization

    console.log('[SIGNER-FIXED] recipientBuff length:', recipientBuff.length, 'bytes');
    console.log('[SIGNER-FIXED] amountBuff length:', amountBuff.length, 'bytes');

    // Construct message same way as Clarity contract does
    const message = Buffer.concat([
      Buffer.from(nullifierHash, 'hex'),
      Buffer.from(root, 'hex'),
      recipientBuff,
      amountBuff
    ]);

    console.log('[SIGNER-FIXED] Total message length:', message.length, 'bytes');

    // Hash the message
    const messageHash = createHash('sha256').update(message).digest();

    console.log('[SIGNER-FIXED] Message hash:', messageHash.toString('hex'));

    // Sign with secp256k1 - v7 API uses raw privateKeyHex string
    const signature = signMessageHashRsv({
      messageHash: messageHash.toString('hex'),
      privateKey: this.privateKeyHex
    });

    // Return both messageHash and signature for veilpay contract
    return {
      messageHash: messageHash.toString('hex'),
      signature: signature.data
    };
  }
}
