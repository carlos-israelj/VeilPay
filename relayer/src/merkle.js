import { MerkleTree } from 'merkletreejs';
import { buildPoseidon } from 'circomlibjs';

export class MerkleTreeManager {
  constructor(levels = 20) {
    this.levels = levels;
    this.leaves = [];
    this.tree = null;
    this.poseidon = null;
  }

  async initialize() {
    // Initialize Poseidon hash function
    this.poseidon = await buildPoseidon();
    console.log('Merkle tree initialized (using Poseidon)');
  }

  async ensureInitialized() {
    if (!this.poseidon) {
      await this.initialize();
    }
  }

  /**
   * Hash function using Poseidon
   * This must match the hash used in the ZK circuit
   */
  hashFn(data) {
    if (!this.poseidon) {
      throw new Error('Poseidon not initialized');
    }

    // Convert hex string to BigInt if needed
    let value;
    if (typeof data === 'string') {
      // Remove 0x prefix if present
      const cleanHex = data.startsWith('0x') ? data.slice(2) : data;
      value = BigInt('0x' + cleanHex);
    } else if (typeof data === 'bigint') {
      value = data;
    } else {
      value = BigInt(data);
    }

    // Poseidon hash returns a field element
    const hash = this.poseidon([value]);
    // Convert to hex string for merkletreejs
    return Buffer.from(this.poseidon.F.toString(hash, 16).padStart(64, '0'), 'hex');
  }

  /**
   * Add a commitment to the tree
   */
  addLeaf(commitment) {
    this.leaves.push(commitment);
    this.rebuildTree();
  }

  /**
   * Rebuild the merkle tree
   */
  rebuildTree() {
    try {
      console.log(`Rebuilding tree with ${this.leaves.length} leaves`);
      // Don't pad to full capacity - just use actual leaves
      // The Merkle tree library will handle the tree structure
      const leavesToUse = this.leaves.length > 0 ? this.leaves : ['0'];

      this.tree = new MerkleTree(
        leavesToUse,
        (data) => this.hashFn(data),
        { sortPairs: false }
      );
      console.log('Tree rebuilt successfully');
    } catch (error) {
      console.error('Error rebuilding tree:', error);
      throw error;
    }
  }

  /**
   * Get the current merkle root
   */
  getRoot() {
    if (!this.tree) {
      // Return empty root for uninitialized tree
      return Buffer.alloc(32);
    }
    return this.tree.getRoot();
  }

  /**
   * Get merkle proof for a commitment
   */
  getProof(commitment) {
    if (!this.tree) {
      throw new Error('Tree not initialized');
    }

    // Try exact match first
    let index = this.leaves.indexOf(commitment);
    let matchedLeaf = commitment;

    // If not found, try finding a leaf that starts with the commitment (partial match)
    if (index === -1) {
      index = this.leaves.findIndex(leaf =>
        leaf.startsWith(commitment) || commitment.startsWith(leaf)
      );
      if (index !== -1) {
        matchedLeaf = this.leaves[index];
      }
    }

    if (index === -1) {
      throw new Error('Commitment not found in tree');
    }

    const proof = this.tree.getProof(matchedLeaf, index);

    // Format proof for circuit
    const pathElements = proof.map(p => p.data.toString('hex'));
    const pathIndices = proof.map(p => p.position === 'right' ? 1 : 0);

    // Pad arrays to match circuit depth (20 levels)
    const TREE_LEVELS = 20;
    const zeroPad = '0000000000000000000000000000000000000000000000000000000000000000';

    while (pathElements.length < TREE_LEVELS) {
      pathElements.push(zeroPad);
      pathIndices.push(0);
    }

    return {
      pathElements,
      pathIndices,
      root: this.getRoot().toString('hex'),
      leaf: matchedLeaf
    };
  }

  /**
   * Get the number of leaves
   */
  getLeafCount() {
    return this.leaves.length;
  }

  /**
   * Export tree state
   */
  export() {
    return {
      leaves: this.leaves,
      root: this.getRoot().toString('hex'),
      levels: this.levels
    };
  }

  /**
   * Import tree state
   */
  import(state) {
    this.leaves = state.leaves;
    this.levels = state.levels;
    this.rebuildTree();
  }
}
