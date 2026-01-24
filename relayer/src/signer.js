import { createHash } from 'crypto';
import {
  privateKeyToPublic,
  getAddressFromPrivateKey,
  signMessageHashRsv,
  Cl,
  cvToHex
} from '@stacks/transactions';

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
   * V7 API VERSION: Uses Cl helper and cvToHex for serialization
   */
  async signWithdrawal(nullifierHash, recipient, amount, root) {
    // Create Clarity values using modern Cl API
    const recipientCV = Cl.principal(recipient);
    const amountCV = Cl.uint(amount);

    // In v7.x, cvToHex returns hex string with '0x' prefix
    // This matches Clarity's to-consensus-buff? serialization format
    const recipientHex = cvToHex(recipientCV);
    const amountHex = cvToHex(amountCV);

    // Remove '0x' prefix and convert to Buffer
    const recipientBuff = Buffer.from(recipientHex.replace('0x', ''), 'hex');
    const amountBuff = Buffer.from(amountHex.replace('0x', ''), 'hex');

    console.log('[SIGNER] recipientBuff length:', recipientBuff.length, 'bytes');
    console.log('[SIGNER] amountBuff length:', amountBuff.length, 'bytes');

    // Construct message same way as Clarity contract does
    const message = Buffer.concat([
      Buffer.from(nullifierHash, 'hex'),
      Buffer.from(root, 'hex'),
      recipientBuff,
      amountBuff
    ]);

    console.log('[SIGNER] Total message length:', message.length, 'bytes');

    // Hash the message
    const messageHash = createHash('sha256').update(message).digest();

    console.log('[SIGNER] Message hash:', messageHash.toString('hex'));

    // Sign with secp256k1 - v7 API uses raw privateKeyHex string
    // In v7.x, signMessageHashRsv returns the signature hex string directly
    const signature = signMessageHashRsv({
      messageHash: messageHash.toString('hex'),
      privateKey: this.privateKeyHex
    });

    // Return both messageHash and signature for veilpay contract
    return {
      messageHash: messageHash.toString('hex'),
      signature: signature // v7 returns hex string directly, not object with .data
    };
  }
}
