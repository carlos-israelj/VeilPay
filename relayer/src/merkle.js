import { MerkleTree } from 'merkletreejs';
import { buildPoseidon } from 'circomlibjs';

export class MerkleTreeManager {
  constructor(levels = 20) {
    this.levels = levels;
    this.leaves = [];
    this.tree = null;
    this.poseidon = null;
    this.initialize();
  }

  async initialize() {
    // Initialize Poseidon hash function
    this.poseidon = await buildPoseidon();
    this.rebuildTree();
  }

  /**
   * Hash function using Poseidon (same as in circuit)
   */
  hashFn(data) {
    if (!this.poseidon) {
      throw new Error('Poseidon not initialized');
    }
    const hash = this.poseidon([data]);
    return this.poseidon.F.toString(hash);
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
    if (!this.poseidon) return;

    // Fill tree to full capacity (2^levels)
    const capacity = Math.pow(2, this.levels);
    const paddedLeaves = [...this.leaves];

    while (paddedLeaves.length < capacity) {
      paddedLeaves.push('0'); // Pad with zeros
    }

    this.tree = new MerkleTree(
      paddedLeaves,
      (data) => this.hashFn(data),
      { sortPairs: false }
    );
  }

  /**
   * Get the current merkle root
   */
  getRoot() {
    if (!this.tree) {
      throw new Error('Tree not initialized');
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

    const index = this.leaves.indexOf(commitment);
    if (index === -1) {
      throw new Error('Commitment not found in tree');
    }

    const proof = this.tree.getProof(commitment, index);

    // Format proof for circuit
    const pathElements = proof.map(p => p.data.toString('hex'));
    const pathIndices = proof.map(p => p.position === 'right' ? 1 : 0);

    return {
      pathElements,
      pathIndices,
      root: this.getRoot().toString('hex'),
      leaf: commitment
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
