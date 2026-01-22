import { buildPoseidon } from 'circomlibjs';

export class MerkleTreeManager {
  constructor(levels = 20) {
    this.levels = levels;
    this.leaves = [];
    this.poseidon = null;
    this.zeroCache = [];
  }

  async initialize() {
    // Initialize Poseidon hash function
    this.poseidon = await buildPoseidon();

    // Pre-calculate zero values for each level
    // zeros[0] = 0, zeros[i] = Poseidon(zeros[i-1], zeros[i-1])
    this.zeroCache[0] = 0n;
    for (let i = 1; i <= this.levels; i++) {
      this.zeroCache[i] = this.poseidon([this.zeroCache[i - 1], this.zeroCache[i - 1]]);
    }

    console.log('Merkle tree initialized (using Poseidon with', this.levels, 'levels)');
  }

  async ensureInitialized() {
    if (!this.poseidon) {
      await this.initialize();
    }
  }

  /**
   * Hash a pair of nodes using Poseidon(2)
   * This matches exactly what the circuit does
   */
  hashPair(left, right) {
    if (!this.poseidon) {
      throw new Error('Poseidon not initialized');
    }

    // Convert to BigInt if needed
    let leftBigInt, rightBigInt;

    if (typeof left === 'bigint') {
      leftBigInt = left;
    } else if (typeof left === 'string') {
      leftBigInt = BigInt('0x' + left);
    } else {
      leftBigInt = left;
    }

    if (typeof right === 'bigint') {
      rightBigInt = right;
    } else if (typeof right === 'string') {
      rightBigInt = BigInt('0x' + right);
    } else {
      rightBigInt = right;
    }

    // Poseidon(2) - takes 2 inputs
    const hash = this.poseidon([leftBigInt, rightBigInt]);
    return hash;
  }

  /**
   * Add a commitment to the tree
   */
  addLeaf(commitment) {
    this.leaves.push(commitment);
  }

  /**
   * Get the current merkle root
   * Builds the tree dynamically matching the circuit logic
   */
  getRoot() {
    if (this.leaves.length === 0) {
      return Buffer.alloc(32);
    }

    // Start with leaves
    let currentLevel = this.leaves.map(leaf => BigInt('0x' + leaf));

    // Build tree level by level
    for (let level = 0; level < this.levels; level++) {
      const nextLevel = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : this.zeroCache[level];

        const parent = this.hashPair(left, right);
        nextLevel.push(parent);
      }

      // If we've reduced to a single node, continue hashing with zeros
      if (nextLevel.length === 1 && level < this.levels - 1) {
        let node = nextLevel[0];
        for (let i = level + 1; i < this.levels; i++) {
          node = this.hashPair(node, this.zeroCache[i]);
        }
        const rootHex = this.poseidon.F.toString(node, 16).padStart(64, '0');
        return Buffer.from(rootHex, 'hex');
      }

      currentLevel = nextLevel;
    }

    const rootHex = this.poseidon.F.toString(currentLevel[0], 16).padStart(64, '0');
    return Buffer.from(rootHex, 'hex');
  }

  /**
   * Get merkle proof for a commitment
   */
  getProof(commitment) {
    // Find leaf index
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

    const pathElements = [];
    const pathIndices = [];

    // Build proof level by level
    let currentLevel = this.leaves.map(leaf => BigInt('0x' + leaf));
    let currentIndex = index;

    for (let level = 0; level < this.levels; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

      let sibling;
      if (siblingIndex < currentLevel.length) {
        sibling = currentLevel[siblingIndex];
      } else {
        sibling = this.zeroCache[level];
      }

      // Convert sibling to hex string
      const siblingHex = typeof sibling === 'bigint'
        ? sibling.toString(16).padStart(64, '0')
        : this.poseidon.F.toString(sibling, 16).padStart(64, '0');
      pathElements.push(siblingHex);
      pathIndices.push(isRightNode ? 1 : 0);

      // Build next level
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : this.zeroCache[level];
        nextLevel.push(this.hashPair(left, right));
      }

      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);

      // If we've reduced to a single node, fill remaining levels with zeros
      if (currentLevel.length === 1 && level < this.levels - 1) {
        for (let i = level + 1; i < this.levels; i++) {
          const zeroHex = typeof this.zeroCache[i] === 'bigint'
            ? this.zeroCache[i].toString(16).padStart(64, '0')
            : this.poseidon.F.toString(this.zeroCache[i], 16).padStart(64, '0');
          pathElements.push(zeroHex);
          pathIndices.push(0);
        }
        break;
      }
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
  }
}
