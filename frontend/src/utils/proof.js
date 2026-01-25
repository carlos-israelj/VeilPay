import { groth16 } from 'snarkjs';

// Load circuit files from GitHub Releases
const GITHUB_RELEASE_URL = 'https://github.com/carlos-israelj/VeilPay/releases/download/v1.0.0-circuits';
const CIRCUIT_WASM = `${GITHUB_RELEASE_URL}/withdraw.wasm`;
const ZKEY_FILE = `${GITHUB_RELEASE_URL}/withdraw_final.zkey`;

/**
 * Generate ZK proof for withdrawal
 */
export async function generateProof({
  secret,
  nonce,
  amount,
  recipient,
  pathElements,
  pathIndices,
  root
}) {
  try {
    // Convert hex strings to BigInt strings for circuit
    const convertHexToBigInt = (hex) => {
      // Remove 0x prefix if present
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
      return BigInt('0x' + cleanHex).toString();
    };

    // Calculate nullifier hash
    const nullifierHash = await calculateNullifier(secret, nonce);

    // Prepare circuit inputs
    const input = {
      secret: secret,
      amount: amount,
      nonce: nonce,
      pathElements: pathElements.map(convertHexToBigInt),
      pathIndices: pathIndices,
      root: convertHexToBigInt(root),
      nullifierHash: convertHexToBigInt(nullifierHash),
      recipient: recipientToFieldElement(recipient)
    };

    console.log('Generating proof with inputs:', input);

    // Generate proof
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      CIRCUIT_WASM,
      ZKEY_FILE
    );

    console.log('Proof generated successfully');

    return { proof, publicSignals };
  } catch (error) {
    console.error('Proof generation error:', error);
    throw error;
  }
}

/**
 * Verify a proof (for testing)
 */
export async function verifyProof(proof, publicSignals) {
  try {
    const vkey = await fetch(`${GITHUB_RELEASE_URL}/verification_key.json`).then(r => r.json());
    const verified = await groth16.verify(vkey, publicSignals, proof);
    return verified;
  } catch (error) {
    console.error('Proof verification error:', error);
    return false;
  }
}

/**
 * Convert recipient address to field element
 * (Simplified - in production you'd use proper encoding)
 */
function recipientToFieldElement(address) {
  // Hash the address to get a field element
  const encoder = new TextEncoder();
  const data = encoder.encode(address);
  let hash = 0n;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 256n + BigInt(data[i])) % (2n ** 254n);
  }
  return hash.toString();
}

/**
 * Calculate nullifier (same as in crypto.js but included here for convenience)
 */
async function calculateNullifier(secret, nonce) {
  const { buildPoseidon } = await import('circomlibjs');
  const poseidon = await buildPoseidon();
  const nullifier = poseidon([BigInt(secret), BigInt(nonce)]);
  return poseidon.F.toString(nullifier, 16);
}
