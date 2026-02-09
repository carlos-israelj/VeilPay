// VeilPay x402 Middleware
// Integrates x402-stacks payment protocol with VeilPay privacy layer

import { paymentMiddleware } from 'x402-stacks';
import { verifyProof } from '../verifier.js';
import { processWithdrawal } from '../withdraw-handler.js';

/**
 * Custom x402 middleware that uses VeilPay privacy instead of direct payment
 *
 * Flow:
 * 1. x402 detects 402 response
 * 2. Instead of paying directly, client generates ZK proof
 * 3. Server verifies proof via VeilPay relayer
 * 4. If valid, trigger withdrawal from pool to vendor
 * 5. Grant access to resource
 */

/**
 * Create VeilPay-enabled x402 middleware
 * @param {Object} config - Configuration object
 * @param {string} config.asset - Asset type: 'STX' | 'USDCx' | 'sBTC'
 * @param {string} config.amount - Amount in micro-units (string or bigint)
 * @param {string} config.payTo - Vendor's Stacks address
 * @param {string} config.network - Network: 'testnet' | 'mainnet'
 * @param {string} config.facilitatorUrl - x402 facilitator URL
 * @param {string} config.description - Human-readable description
 */
function createVeilPayX402Middleware(config) {
  const {
    asset = 'STX',
    amount,
    payTo,
    network = 'testnet',
    facilitatorUrl,
    description = 'VeilPay private payment',
  } = config;

  return async (req, res, next) => {
    // Check if this is a VeilPay private payment (has ZK proof headers)
    const hasVeilPayProof = req.headers['x-veilpay-proof'];
    const hasVeilPayNullifier = req.headers['x-veilpay-nullifier'];

    if (hasVeilPayProof && hasVeilPayNullifier) {
      // VEILPAY FLOW: Verify ZK proof instead of standard x402 payment
      try {
        console.log('[VeilPay x402] Detected ZK proof payment');

        // Decode proof from base64
        const proofData = JSON.parse(
          Buffer.from(req.headers['x-veilpay-proof'], 'base64').toString()
        );
        const nullifierHash = req.headers['x-veilpay-nullifier'];

        // Verify ZK proof
        const isValid = await verifyProof(proofData.proof, proofData.publicSignals);

        if (!isValid) {
          return res.status(402).json({
            error: 'Invalid ZK proof',
            details: 'Proof verification failed',
          });
        }

        // Check nullifier not used (prevent double-spend)
        const nullifierUsed = await checkNullifierUsed(nullifierHash, asset);
        if (nullifierUsed) {
          return res.status(402).json({
            error: 'Nullifier already used',
            details: 'This payment has already been claimed',
          });
        }

        // Mark nullifier as used
        await markNullifierUsed(nullifierHash, asset);

        // Trigger withdrawal from VeilPay pool to vendor
        const withdrawalResult = await processWithdrawal({
          nullifierHash,
          recipient: payTo,
          amount,
          asset,
          root: proofData.publicSignals[0], // root is first public signal
        });

        if (!withdrawalResult.success) {
          return res.status(500).json({
            error: 'Withdrawal failed',
            details: withdrawalResult.error,
          });
        }

        // Payment successful - attach payment info to request
        req.veilpayPayment = {
          nullifier: nullifierHash,
          recipient: payTo,
          amount: amount,
          asset: asset,
          transaction: withdrawalResult.txid,
          timestamp: new Date().toISOString(),
        };

        // Add payment-response header (x402 spec)
        res.set('payment-response', Buffer.from(JSON.stringify({
          success: true,
          transaction: withdrawalResult.txid,
          payer: 'anonymous', // VeilPay privacy
          network: network === 'testnet' ? 'stacks:2147483648' : 'stacks:1',
        })).toString('base64'));

        console.log('[VeilPay x402] Payment verified ✅');
        return next();

      } catch (error) {
        console.error('[VeilPay x402] Error processing ZK proof:', error);
        return res.status(500).json({
          error: 'Payment processing error',
          details: error.message,
        });
      }

    } else {
      // STANDARD x402 FLOW: Use normal x402-stacks middleware
      // This responds with 402 Payment Required if no payment provided
      const standardMiddleware = paymentMiddleware({
        amount: amount,
        payTo: payTo,
        network: network,
        facilitatorUrl: facilitatorUrl,
        asset: asset,
        description: description,
      });

      return standardMiddleware(req, res, next);
    }
  };
}

/**
 * Helper: Check if nullifier has been used
 */
async function checkNullifierUsed(nullifier, asset) {
  const nullifiers = global.usedNullifiers || {};
  const assetNullifiers = nullifiers[asset] || [];
  return assetNullifiers.includes(nullifier);
}

/**
 * Helper: Mark nullifier as used
 */
async function markNullifierUsed(nullifier, asset) {
  if (!global.usedNullifiers) {
    global.usedNullifiers = {};
  }
  if (!global.usedNullifiers[asset]) {
    global.usedNullifiers[asset] = [];
  }
  global.usedNullifiers[asset].push(nullifier);

  // Also mark on-chain via smart contract
  // TODO: Call smart contract to mark nullifier (done in withdraw call)
}

/**
 * Get payment info from VeilPay request
 */
function getVeilPayPayment(req) {
  return req.veilpayPayment || null;
}

export {
  createVeilPayX402Middleware,
  getVeilPayPayment,
};
