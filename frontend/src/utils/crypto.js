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

  // Convert amount to micro-units (USDCx has 6 decimals)
  // If amount is a decimal number, multiply by 1,000,000
  const amountInMicroUnits = Math.floor(Number(amount) * 1_000_000);

  // Calculate commitment: poseidon(secret, amount, nonce)
  const commitment = p([secret, BigInt(amountInMicroUnits), nonce]);

  return {
    secret: secret.toString(),
    nonce: nonce.toString(),
    commitment: p.F.toString(commitment, 16).padStart(64, '0'),
    amount: amountInMicroUnits.toString()
  };
}

/**
 * Calculate commitment from secret, amount, and nonce
 */
export async function calculateCommitment(secret, amount, nonce) {
  const p = await getPoseidon();

  // Ensure amount is in micro-units (BigInt)
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : BigInt(amount);

  // Calculate commitment: poseidon(secret, amount, nonce)
  const commitment = p([BigInt(secret), amountBigInt, BigInt(nonce)]);
  return p.F.toString(commitment, 16).padStart(64, '0');
}

/**
 * Calculate nullifier hash
 */
export async function calculateNullifier(secret, nonce) {
  const p = await getPoseidon();
  const nullifier = p([BigInt(secret), BigInt(nonce)]);
  return p.F.toString(nullifier, 16).padStart(64, '0');
}

/**
 * Verify commitment
 */
export async function verifyCommitment(secret, amount, nonce, expectedCommitment) {
  const p = await getPoseidon();

  // Convert amount to micro-units if it's a decimal
  const amountInMicroUnits = typeof amount === 'number' && amount < 1000
    ? Math.floor(amount * 1_000_000)
    : BigInt(amount);

  const commitment = p([BigInt(secret), BigInt(amountInMicroUnits), BigInt(nonce)]);
  const commitmentHex = p.F.toString(commitment, 16);
  return commitmentHex === expectedCommitment;
}
