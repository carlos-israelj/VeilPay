import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to verification key
const VERIFICATION_KEY_PATH = path.join(
  __dirname,
  '../circuits/verification_key.json'
);

let verificationKey = null;

// Load verification key
function loadVerificationKey() {
  if (!verificationKey) {
    verificationKey = JSON.parse(
      fs.readFileSync(VERIFICATION_KEY_PATH, 'utf-8')
    );
  }
  return verificationKey;
}

/**
 * Verify a ZK proof
 * @param {Object} proof - The proof object
 * @param {Array} publicSignals - Public inputs to the circuit
 * @returns {Promise<boolean>} - True if proof is valid
 */
export async function verifyProof(proof, publicSignals) {
  try {
    const vKey = loadVerificationKey();
    const verified = await groth16.verify(vKey, publicSignals, proof);
    return verified;
  } catch (error) {
    console.error('Proof verification error:', error);
    return false;
  }
}

/**
 * Verify proof with additional business logic checks
 * @param {Object} proof - The proof object
 * @param {Array} publicSignals - [root, nullifierHash, recipient]
 * @param {string} expectedRoot - Expected merkle root
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyProofWithChecks(proof, publicSignals, expectedRoot) {
  const [root, nullifierHash, recipient] = publicSignals;

  // Check root matches
  if (root !== expectedRoot) {
    return {
      valid: false,
      error: 'Root mismatch'
    };
  }

  // Verify the ZK proof
  const isValid = await verifyProof(proof, publicSignals);

  return {
    valid: isValid,
    root,
    nullifierHash,
    recipient
  };
}
