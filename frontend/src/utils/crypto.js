import { buildPoseidon } from 'circomlibjs';

let poseidon = null;

async function getPoseidon() {
  if (!poseidon) {
    poseidon = await buildPoseidon();
  }
  return poseidon;
}

/**
 * Generate random field element
 */
function randomFieldElement() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
}

/**
 * Generate deposit commitment
 */
export async function generateDeposit(amount) {
  const p = await getPoseidon();

  const secret = randomFieldElement();
  const nonce = randomFieldElement();

  // Calculate commitment: poseidon(secret, amount, nonce)
  const commitment = p([secret, BigInt(amount), nonce]);

  return {
    secret: secret.toString(),
    nonce: nonce.toString(),
    commitment: p.F.toString(commitment, 16),
    amount: amount.toString()
  };
}

/**
 * Calculate nullifier hash
 */
export async function calculateNullifier(secret, nonce) {
  const p = await getPoseidon();
  const nullifier = p([BigInt(secret), BigInt(nonce)]);
  return p.F.toString(nullifier, 16);
}

/**
 * Verify commitment
 */
export async function verifyCommitment(secret, amount, nonce, expectedCommitment) {
  const p = await getPoseidon();
  const commitment = p([BigInt(secret), BigInt(amount), BigInt(nonce)]);
  const commitmentHex = p.F.toString(commitment, 16);
  return commitmentHex === expectedCommitment;
}
