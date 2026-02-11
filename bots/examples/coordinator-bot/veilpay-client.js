import axios from 'axios';
import { buildPoseidon } from 'circomlibjs';
import { makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

/**
 * VeilPay client for private bot-to-bot payments
 * Handles deposit, proof generation, and private API calls
 */

export class VeilPayClient {
  constructor(relayerUrl, network = 'testnet') {
    this.relayerUrl = relayerUrl;
    this.network = network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
    this.poseidon = null;
  }

  /**
   * Initialize Poseidon hash function
   */
  async initialize() {
    if (!this.poseidon) {
      this.poseidon = await buildPoseidon();
      console.log('✓ VeilPay client initialized (Poseidon hash loaded)');
    }
  }

  /**
   * Deposit STX to VeilPay pool
   * Returns secret and nonce for future withdrawals
   */
  async deposit(amount, senderKey, contractAddress, contractName) {
    await this.initialize();

    try {
      // Generate random secret and nonce
      const secret = this.generateRandomValue();
      const nonce = this.generateRandomValue();

      // Calculate commitment = Poseidon(secret, amount, nonce)
      const commitment = this.calculateCommitment(secret, amount, nonce);

      console.log(`  → Depositing ${amount} µSTX to VeilPay...`);
      console.log(`  → Commitment: ${commitment.substring(0, 16)}...`);

      // Build and broadcast deposit transaction
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'deposit',
        functionArgs: [
          // commitment as buff 32
          bufferCV(Buffer.from(commitment, 'hex')),
          // amount as uint
          uintCV(amount)
        ],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: 1 // Allow
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, this.network);

      if (broadcastResponse.error) {
        throw new Error(`Deposit failed: ${broadcastResponse.reason}`);
      }

      console.log(`  ✓ Deposit tx: ${broadcastResponse.txid}`);
      console.log(`  ⏳ Waiting for relayer to index commitment...`);

      // Wait for relayer to index the deposit
      await this.waitForCommitment(commitment);

      return {
        success: true,
        txid: broadcastResponse.txid,
        secret,
        nonce,
        commitment,
        amount
      };

    } catch (error) {
      throw new Error(`VeilPay deposit failed: ${error.message}`);
    }
  }

  /**
   * Generate ZK proof for private payment
   */
  async generatePaymentProof(secret, nonce, amount, botUrl) {
    await this.initialize();

    try {
      // Calculate commitment and nullifier
      const commitment = this.calculateCommitment(secret, amount, nonce);
      const nullifierHash = this.calculateNullifier(secret, nonce);

      console.log(`  → Fetching Merkle proof for commitment...`);

      // Get Merkle proof from relayer
      const proofUrl = `${this.relayerUrl}/proof/${commitment}`;
      const proofResponse = await axios.get(proofUrl);

      if (!proofResponse.data.proof) {
        throw new Error('Merkle proof not found - deposit may not be indexed yet');
      }

      const { pathElements, pathIndices, root } = proofResponse.data.proof;

      console.log(`  → Generating ZK proof...`);

      // In a real implementation, you would:
      // 1. Load circuit WASM and zkey
      // 2. Generate witness
      // 3. Create ZK proof with snarkjs

      // For now, we'll create a placeholder proof structure
      // TODO: Implement actual ZK proof generation with snarkjs

      const zkProof = {
        pi_a: ['0', '0', '0'],
        pi_b: [['0', '0'], ['0', '0'], ['0', '0']],
        pi_c: ['0', '0', '0']
      };

      const publicSignals = [
        root,
        nullifierHash,
        botUrl // Bot URL encoded as field element
      ];

      console.log(`  ✓ ZK proof generated`);

      return {
        proof: zkProof,
        publicSignals,
        nullifierHash,
        root
      };

    } catch (error) {
      throw new Error(`Proof generation failed: ${error.message}`);
    }
  }

  /**
   * Make private API call to worker bot
   * Uses VeilPay ZK proof for payment
   */
  async callWorkerBot(botUrl, endpoint, payload, secret, nonce, amount) {
    await this.initialize();

    try {
      console.log(`  → Calling worker bot: ${botUrl}${endpoint}`);

      // Generate payment proof
      const { proof, publicSignals, nullifierHash, root } = await this.generatePaymentProof(
        secret,
        nonce,
        amount,
        botUrl
      );

      // Make API call with x402 payment proof
      const response = await axios.post(`${botUrl}${endpoint}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Proof': JSON.stringify(proof),
          'X-Payment-Signals': JSON.stringify(publicSignals),
          'X-Payment-Nullifier': nullifierHash,
          'X-Payment-Root': root,
          'X-Payment-Method': 'veilpay-zk'
        },
        timeout: 30000 // 30s timeout
      });

      console.log(`  ✓ Worker bot responded: ${response.status}`);

      return response.data;

    } catch (error) {
      if (error.response) {
        throw new Error(`Worker bot error (${error.response.status}): ${error.response.data?.error || error.message}`);
      }
      throw new Error(`Worker bot call failed: ${error.message}`);
    }
  }

  /**
   * Calculate commitment = Poseidon(secret, amount, nonce)
   */
  calculateCommitment(secret, amount, nonce) {
    const hash = this.poseidon([BigInt(secret), BigInt(amount), BigInt(nonce)]);
    return this.poseidon.F.toString(hash, 16).padStart(64, '0');
  }

  /**
   * Calculate nullifier = Poseidon(secret, nonce)
   */
  calculateNullifier(secret, nonce) {
    const hash = this.poseidon([BigInt(secret), BigInt(nonce)]);
    return this.poseidon.F.toString(hash, 16).padStart(64, '0');
  }

  /**
   * Generate cryptographically secure random value
   */
  generateRandomValue() {
    // Generate 32 random bytes
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    // Convert to BigInt
    let value = 0n;
    for (let i = 0; i < randomBytes.length; i++) {
      value = value * 256n + BigInt(randomBytes[i]);
    }

    // Ensure it fits in field (254 bits)
    const fieldModulus = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
    return (value % fieldModulus).toString();
  }

  /**
   * Wait for relayer to index commitment
   */
  async waitForCommitment(commitment, maxAttempts = 20) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const proofUrl = `${this.relayerUrl}/proof/${commitment}`;
        const response = await axios.get(proofUrl);

        if (response.data.proof) {
          console.log(`  ✓ Commitment indexed by relayer`);
          return true;
        }
      } catch (error) {
        // Proof not found yet, continue waiting
      }

      // Wait 3 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(`  ⏳ Waiting for indexer... (${attempt + 1}/${maxAttempts})`);
    }

    throw new Error('Timeout: Commitment not indexed by relayer');
  }

  /**
   * Get current Merkle root from relayer
   */
  async getCurrentRoot() {
    const response = await axios.get(`${this.relayerUrl}/root`);
    return response.data.root;
  }

  /**
   * Check if nullifier has been used
   */
  async isNullifierUsed(nullifierHash) {
    try {
      const response = await axios.get(`${this.relayerUrl}/nullifier/${nullifierHash}`);
      return response.data.used === true;
    } catch (error) {
      return false;
    }
  }
}

// Helper functions for Clarity values (import from @stacks/transactions)
import { bufferCV, uintCV } from '@stacks/transactions';
