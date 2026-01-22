import { createHash } from 'crypto';
import {
  createStacksPrivateKey,
  pubKeyfromPrivKey,
  publicKeyToAddress,
  AddressVersion,
  signMessageHashRsv,
  serializeCV,
  principalCV,
  uintCV
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

    // Sign with secp256k1
    const signature = signMessageHashRsv({
      messageHash: messageHash.toString('hex'),
      privateKey: this.privateKey
    });

    // Return only signature (signature.data is already a hex string)
    return signature.data;
  }
}
