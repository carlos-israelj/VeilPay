/**
 * VeilPay x402 Client
 * Axios wrapper with automatic payment handling via x402-stacks
 * Supports both private (ZK proof) and standard payment modes
 */

import axios from 'axios';
import { wrapAxiosWithPayment } from 'x402-stacks';
import { generateProof } from './proof';
import { calculateCommitment, calculateNullifier } from './crypto';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'https://veilpay-x402-relayer.onrender.com';

/**
 * Create x402 client with private payment support
 * @param {Object} options - Configuration options
 * @param {boolean} options.usePrivatePayment - Use ZK proof for private payments
 * @param {string} options.secret - Secret for ZK proof (if private)
 * @param {string} options.nonce - Nonce for ZK proof (if private)
 * @param {string} options.asset - Asset type: 'STX' | 'USDCx' | 'sBTC'
 * @param {Function} options.onPaymentRequired - Callback when payment is required
 * @param {Function} options.onPaymentSuccess - Callback when payment succeeds
 * @returns {AxiosInstance} Configured axios instance
 */
export function createX402Client(options = {}) {
  const {
    usePrivatePayment = false,
    secret = null,
    nonce = null,
    asset = 'STX',
    onPaymentRequired = null,
    onPaymentSuccess = null,
  } = options;

  // Create base axios instance
  const baseClient = axios.create({
    baseURL: RELAYER_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // If using standard x402 (no privacy)
  if (!usePrivatePayment) {
    return wrapAxiosWithPayment(baseClient, {
      network: import.meta.env.VITE_STACKS_NETWORK || 'testnet',
      facilitatorUrl: import.meta.env.VITE_X402_FACILITATOR_URL || 'https://facilitator.stacksx402.com',
      onPaymentRequired: (paymentRequest) => {
        console.log('[x402] Payment required:', paymentRequest);
        if (onPaymentRequired) onPaymentRequired(paymentRequest);
      },
      onPaymentSuccess: (paymentResponse) => {
        console.log('[x402] Payment successful:', paymentResponse);
        if (onPaymentSuccess) onPaymentSuccess(paymentResponse);
      },
    });
  }

  // Private payment mode with ZK proofs
  // Intercept 402 responses and inject ZK proof headers
  baseClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 402 Payment Required
      if (error.response?.status === 402 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          if (onPaymentRequired) {
            onPaymentRequired(error.response.data);
          }

          console.log('[VeilPay x402] 402 detected - generating ZK proof...');

          // Parse payment requirements
          const paymentData = error.response.data;
          const requiredAmount = paymentData.amount || paymentData.payment?.amount;
          const requiredAsset = paymentData.asset || asset;

          // Calculate commitment and nullifier
          const commitment = await calculateCommitment(secret, requiredAmount, nonce);
          const nullifierHash = await calculateNullifier(secret, nonce);

          // Get Merkle proof from relayer
          const proofResponse = await axios.get(
            `${RELAYER_URL}/proof/${commitment}?asset=${requiredAsset}`
          );

          if (!proofResponse.data.proof) {
            throw new Error('Commitment not found. Ensure you have a deposit in the privacy pool.');
          }

          const { pathElements, pathIndices } = proofResponse.data.proof;

          // Get current root
          const rootResponse = await axios.get(`${RELAYER_URL}/root?asset=${requiredAsset}`);
          const root = rootResponse.data.root;

          // Get recipient (vendor address from payment request)
          const recipient = paymentData.payTo || paymentData.payment?.payTo;

          // Generate ZK proof
          const { proof, publicSignals } = await generateProof({
            secret,
            nonce,
            amount: requiredAmount,
            recipient,
            pathElements,
            pathIndices,
            root,
          });

          // Encode proof as base64
          const proofData = {
            proof,
            publicSignals,
          };
          const proofBase64 = Buffer.from(JSON.stringify(proofData)).toString('base64');

          // Retry request with ZK proof headers
          originalRequest.headers['x-veilpay-proof'] = proofBase64;
          originalRequest.headers['x-veilpay-nullifier'] = nullifierHash;

          console.log('[VeilPay x402] ZK proof generated - retrying request...');

          const retryResponse = await baseClient.request(originalRequest);

          if (onPaymentSuccess) {
            onPaymentSuccess({
              success: true,
              nullifier: nullifierHash,
              asset: requiredAsset,
              amount: requiredAmount,
              privacy: 'ZK-SNARK',
            });
          }

          return retryResponse;
        } catch (zkError) {
          console.error('[VeilPay x402] ZK proof generation failed:', zkError);
          throw zkError;
        }
      }

      return Promise.reject(error);
    }
  );

  return baseClient;
}

/**
 * Create simple x402 client (standard mode)
 * @returns {AxiosInstance} Standard x402 client without privacy
 */
export function createStandardX402Client() {
  return createX402Client({ usePrivatePayment: false });
}

/**
 * Create private x402 client (ZK proof mode)
 * @param {string} secret - Secret from deposit
 * @param {string} nonce - Nonce from deposit
 * @param {string} asset - Asset type
 * @returns {AxiosInstance} Private x402 client with ZK proofs
 */
export function createPrivateX402Client(secret, nonce, asset = 'STX') {
  return createX402Client({
    usePrivatePayment: true,
    secret,
    nonce,
    asset,
  });
}

/**
 * Example usage:
 *
 * // Standard payment (public, no privacy)
 * const client = createStandardX402Client();
 * const response = await client.get('/x402/demo');
 *
 * // Private payment (ZK proof, fully anonymous)
 * const privateClient = createPrivateX402Client('secret123...', 'nonce456...', 'STX');
 * const response = await privateClient.get('/x402/demo');
 */

export default {
  createX402Client,
  createStandardX402Client,
  createPrivateX402Client,
};
