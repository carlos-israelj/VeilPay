import { createHash } from 'crypto';
import {
  createStacksPrivateKey,
  pubKeyfromPrivKey,
  publicKeyToAddress,
  AddressVersion,
  signMessageHashRsv
} from '@stacks/transactions';

export class RelayerSigner {
  constructor(privateKeyHex) {
    if (!privateKeyHex) {
      throw new Error('Private key required');
    }
    this.privateKey = createStacksPrivateKey(privateKeyHex);
    this.publicKey = pubKeyfromPrivKey(privateKeyHex);
  }

  /**
   * Get relayer address
   */
  getAddress(network = 'testnet') {
    const version = network === 'mainnet'
      ? AddressVersion.MainnetSingleSig
      : AddressVersion.TestnetSingleSig;

    return publicKeyToAddress(version, this.publicKey);
  }

  /**
   * Get public key in compressed format
   */
  getPublicKey() {
    return this.publicKey.data.toString('hex');
  }

  /**
   * Sign a withdrawal request
   * Creates same message hash that the Clarity contract expects
   */
  async signWithdrawal(nullifierHash, recipient, amount, root) {
    // Construct message same way as Clarity contract
    const message = Buffer.concat([
      Buffer.from(nullifierHash, 'hex'),
      Buffer.from(root, 'hex'),
      this.principalToBuffer(recipient),
      this.uintToBuffer(amount)
    ]);

    // Hash the message
    const messageHash = createHash('sha256').update(message).digest();

    // Sign with secp256k1
    const signature = signMessageHashRsv({
      messageHash: messageHash.toString('hex'),
      privateKey: this.privateKey
    });

    return signature.data.toString('hex');
  }

  /**
   * Convert Stacks principal to buffer (simplified)
   */
  principalToBuffer(principal) {
    // This is a simplified version - in production you'd use proper encoding
    return Buffer.from(principal, 'utf-8');
  }

  /**
   * Convert uint to buffer
   */
  uintToBuffer(num) {
    const buffer = Buffer.allocUnsafe(16);
    buffer.writeBigUInt64BE(BigInt(num), 0);
    return buffer;
  }
}
