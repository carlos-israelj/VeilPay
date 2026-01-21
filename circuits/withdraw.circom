pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Merkle tree proof verification
template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input root;

    component hashers[levels];
    component selectors[levels];

    signal computedHash[levels + 1];
    computedHash[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        selectors[i] = Selector();
        selectors[i].in[0] <== computedHash[i];
        selectors[i].in[1] <== pathElements[i];
        selectors[i].index <== pathIndices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].out[0];
        hashers[i].inputs[1] <== selectors[i].out[1];

        computedHash[i + 1] <== hashers[i].out;
    }

    root === computedHash[levels];
}

// Selector for merkle tree (left or right)
template Selector() {
    signal input in[2];
    signal input index;
    signal output out[2];

    signal tmp;
    tmp <== (in[1] - in[0]) * index;
    out[0] <== in[0] + tmp;
    out[1] <== in[1] - tmp;
}

template Withdraw(levels) {
    // Private inputs
    signal input secret;
    signal input amount;
    signal input nonce;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public inputs
    signal input root;           // Merkle root of the pool
    signal input nullifierHash;  // To prevent double-spending
    signal input recipient;      // Who receives (commitment to address)

    // 1. Verify we know the preimage of the commitment
    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== secret;
    commitmentHasher.inputs[1] <== amount;
    commitmentHasher.inputs[2] <== nonce;
    signal commitment <== commitmentHasher.out;

    // 2. Verify the commitment is in the merkle tree
    component tree = MerkleProof(levels);
    tree.leaf <== commitment;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // 3. Calculate nullifier (must match public input)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== secret;
    nullifierHasher.inputs[1] <== nonce;
    nullifierHash === nullifierHasher.out;
}

component main {public [root, nullifierHash, recipient]} = Withdraw(20);
