/**
 * VeilPay x402 Client
 * Axios wrapper with automatic payment handling via x402-stacks
 * Supports both private (ZK proof) and standard payment modes
 */

import axios from 'axios';
import { wrapAxiosWithPayment, privateKeyToAccount } from 'x402-stacks';
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
    userSession = null,
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

  // DEBUG: Add interceptor to log raw 402 responses BEFORE x402-stacks processes them
  baseClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 402) {
        console.log('[DEBUG] Raw 402 response headers:', error.response.headers);
        console.log('[DEBUG] payment-required header:', error.response.headers['payment-required']);
        console.log('[DEBUG] Response data:', error.response.data);

        // Try to decode header manually
        const paymentHeader = error.response.headers['payment-required'];
        if (paymentHeader) {
          try {
            const decoded = Buffer.from(paymentHeader, 'base64').toString('utf-8');
            console.log('[DEBUG] Decoded payment header:', decoded);
            console.log('[DEBUG] Parsed payment header:', JSON.parse(decoded));
          } catch (e) {
            console.error('[DEBUG] Failed to decode payment header:', e);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  // DEBUG: Log all outgoing requests to see if payment-signature is included
  baseClient.interceptors.request.use(
    (config) => {
      if (config.headers['payment-signature']) {
        console.log('[DEBUG] Request with payment-signature header detected');
        console.log('[DEBUG] payment-signature:', config.headers['payment-signature']);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // If using standard x402 (no privacy)
  if (!usePrivatePayment) {
    // Check if user is signed in
    if (!userSession?.isUserSignedIn()) {
      throw new Error('Please connect your wallet to use x402 payments');
    }

    // Extract Stacks account from userSession
    const userData = userSession.loadUserData();
    const appPrivateKey = userData.appPrivateKey;

    // Get network type (testnet or mainnet)
    const networkEnv = import.meta.env.VITE_STACKS_NETWORK || 'testnet';

    // Create StacksAccount using privateKeyToAccount
    const account = privateKeyToAccount(appPrivateKey, networkEnv);

    console.log('[x402] Created account:', {
      address: account.address,
      network: account.network
    });

    // Add circuit breaker BEFORE wrapping with x402
    // This prevents infinite loops by catching errors early
    const MAX_RETRIES = 2;
    const FATAL_ERRORS = [
      'unexpected_settle_error',
      'settlement_failed',
      'insufficient_funds',
      'transaction_failed',
      'invalid_signature'
    ];

    let retryCount = 0;
    let lastRequestUrl = '';

    baseClient.interceptors.response.use(
      (response) => {
        // Reset retry count on success
        retryCount = 0;
        return response;
      },
      (error) => {
        const currentUrl = error.config?.url || '';

        // Reset counter if this is a new request
        if (currentUrl !== lastRequestUrl) {
          retryCount = 0;
          lastRequestUrl = currentUrl;
        }

        // Handle 402 Payment Required
        if (error.response?.status === 402) {
          const errorData = error.response?.data;
          const errorType = errorData?.error || '';

          // Check for fatal errors
          if (FATAL_ERRORS.includes(errorType)) {
            console.error(`[x402] Fatal payment error detected: ${errorType}`);
            retryCount = 0; // Reset

            // Convert to non-402 error to prevent x402-stacks retry
            const fatalError = new Error(
              `Payment Error: ${errorType}. ${errorData?.message || 'Please check your wallet balance and try again.'}`
            );
            fatalError.status = 500; // Change status to prevent x402 retry
            fatalError.originalError = errorData;

            return Promise.reject(fatalError);
          }

          // Increment retry counter
          retryCount++;

          if (retryCount > MAX_RETRIES) {
            console.error(`[x402] Max retries (${MAX_RETRIES}) exceeded`);
            retryCount = 0; // Reset

            const maxRetriesError = new Error(
              `Payment failed after ${MAX_RETRIES} attempts. Please try again later.`
            );
            maxRetriesError.status = 500;

            return Promise.reject(maxRetriesError);
          }

          console.log(`[x402] Payment attempt ${retryCount}/${MAX_RETRIES}`);
        } else {
          // Non-402 error
          retryCount = 0;
        }

        return Promise.reject(error);
      }
    );

    // Wrap axios with x402 payment handling (only 2 params!)
    const x402Client = wrapAxiosWithPayment(baseClient, account);

    return x402Client;
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
 * @param {Object} userSession - Stacks user session for signing transactions
 * @returns {AxiosInstance} Standard x402 client without privacy
 */
export function createStandardX402Client(userSession) {
  return createX402Client({ usePrivatePayment: false, userSession });
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
