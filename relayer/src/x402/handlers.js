// VeilPay x402 HTTP Handlers
// Provides x402-compatible endpoints for programmatic payments with privacy

import { createVeilPayX402Middleware } from './middleware.js';
import { generateX402Schema } from './schema.js';
import { generateX402ScanSchema } from './scan-schema.js';
import { verifyProof } from '../verifier.js';
import { getAssetConfig } from '../multi-asset.js';

/**
 * Generate x402 payment-required response
 * Follows Coinbase x402 V2 spec
 */
function generatePaymentRequired(config) {
  const {
    asset = 'STX',
    amount,
    payTo,
    network = 'testnet',
    description = 'VeilPay private payment',
    requestId = generateRequestId(),
  } = config;

  // CAIP-2 network identifier
  const networkId = network === 'testnet' ? 'stacks:2147483648' : 'stacks:1';

  const paymentRequest = {
    version: '2.0',
    network: networkId,
    payTo: payTo,
    amount: amount,
    asset: asset,
    description: description,
    requestId: requestId,
    facilitator: process.env.X402_FACILITATOR_URL || 'https://facilitator.veilpay.dev',

    // VeilPay extension: support privacy payments
    extensions: {
      veilpay: {
        enabled: true,
        privacyPool: getContractAddress(asset, network),
        instructions: 'Include x-veilpay-proof and x-veilpay-nullifier headers for private payment',
      }
    }
  };

  return paymentRequest;
}

/**
 * GET /x402/schema
 * Returns x402scan registration schema
 */
function getSchemaHandler(req, res) {
  try {
    const schema = generateX402Schema();
    res.json(schema);
  } catch (error) {
    console.error('[x402] Schema generation error:', error);
    res.status(500).json({
      error: 'Failed to generate schema',
      details: error.message,
    });
  }
}

/**
 * GET /x402/scan
 * Returns x402scan-compatible schema (for registry submission)
 */
function getScanSchemaHandler(req, res) {
  try {
    const schema = generateX402ScanSchema();
    res.json(schema);
  } catch (error) {
    console.error('[x402] Scan schema generation error:', error);
    res.status(500).json({
      error: 'Failed to generate scan schema',
      details: error.message,
    });
  }
}

/**
 * GET /x402/demo
 * Demo endpoint that requires payment
 */
function getDemoContentHandler(req, res, next) {
  // This endpoint is protected by x402 middleware
  // If we reach here, payment was verified

  const paymentInfo = req.veilpayPayment;

  res.json({
    success: true,
    message: 'Welcome to VeilPay x402 Demo!',
    content: {
      secretData: 'This content was unlocked via private payment',
      timestamp: new Date().toISOString(),
      payment: paymentInfo ? {
        nullifier: paymentInfo.nullifier,
        amount: paymentInfo.amount,
        asset: paymentInfo.asset,
        transaction: paymentInfo.transaction,
        payer: 'anonymous', // VeilPay privacy guarantee
      } : null,
    },
    privacy: {
      guarantee: 'Your payment is cryptographically private',
      technology: 'ZK-SNARK (Groth16) with Poseidon hash',
      anonymitySet: 'All deposits in the pool',
    }
  });
}

/**
 * GET /x402/content/:contentId
 * Generic paid content endpoint
 */
function getPaidContentHandler(req, res, next) {
  const { contentId } = req.params;
  const paymentInfo = req.veilpayPayment;

  // In a real application, you would fetch content from database
  // based on contentId and payment verification

  res.json({
    success: true,
    contentId: contentId,
    content: `Premium content #${contentId}`,
    payment: paymentInfo ? {
      asset: paymentInfo.asset,
      amount: paymentInfo.amount,
      transaction: paymentInfo.transaction,
      timestamp: paymentInfo.timestamp,
    } : null,
  });
}

/**
 * POST /x402/api/execute
 * Paid API execution endpoint
 */
function postExecuteApiHandler(req, res, next) {
  const { operation, params } = req.body;
  const paymentInfo = req.veilpayPayment;

  // Execute paid operation
  const result = executePaidOperation(operation, params);

  res.json({
    success: true,
    operation: operation,
    result: result,
    payment: paymentInfo ? {
      asset: paymentInfo.asset,
      amount: paymentInfo.amount,
      transaction: paymentInfo.transaction,
    } : null,
  });
}

/**
 * GET /x402/stats
 * Public stats endpoint (no payment required)
 */
function getStatsHandler(req, res) {
  const stats = {
    totalPayments: global.x402Stats?.totalPayments || 0,
    totalVolume: global.x402Stats?.totalVolume || {
      STX: 0,
      USDCx: 0,
      sBTC: 0,
    },
    privacyGuarantee: 'All payments are cryptographically private',
    activeAssets: ['STX', 'USDCx', 'sBTC'],
    network: process.env.STACKS_NETWORK || 'testnet',
  };

  res.json(stats);
}

/**
 * POST /x402/verify-proof
 * Manually verify a ZK proof (for debugging)
 */
async function postVerifyProofHandler(req, res) {
  try {
    const { proof, publicSignals } = req.body;

    const isValid = await verifyProof(proof, publicSignals);

    res.json({
      valid: isValid,
      details: isValid ? 'Proof is valid' : 'Proof is invalid',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[x402] Proof verification error:', error);
    res.status(400).json({
      valid: false,
      error: 'Verification failed',
      details: error.message,
    });
  }
}

/**
 * Helper: Get contract address for asset
 */
function getContractAddress(asset, network) {
  const config = getAssetConfig(asset);
  return config.contractAddress[network];
}

/**
 * Helper: Generate unique request ID
 */
function generateRequestId() {
  return `veilpay-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Helper: Execute paid operation (placeholder)
 */
function executePaidOperation(operation, params) {
  // Placeholder for actual paid API logic
  switch (operation) {
    case 'compute':
      return { result: 'Computation completed', params };
    case 'query':
      return { result: 'Query executed', params };
    default:
      return { result: 'Operation executed', params };
  }
}

/**
 * Register x402 routes with Express app
 */
function registerX402Routes(app) {
  console.log('[x402] Registering routes...');

  // Public routes (no payment required)
  app.get('/x402/schema', getSchemaHandler);
  app.get('/x402/scan', getScanSchemaHandler);
  app.get('/x402/stats', getStatsHandler);
  app.post('/x402/verify-proof', postVerifyProofHandler);

  // Protected routes with different asset configurations

  // Demo endpoint - STX payment
  app.get('/x402/demo',
    createVeilPayX402Middleware({
      asset: 'STX',
      amount: '1000000', // 1 STX
      payTo: process.env.VENDOR_ADDRESS,
      network: process.env.STACKS_NETWORK || 'testnet',
      facilitatorUrl: process.env.X402_FACILITATOR_URL,
      description: 'VeilPay x402 Demo (1 STX)',
    }),
    getDemoContentHandler
  );

  // Premium content - USDCx payment
  app.get('/x402/content/:contentId',
    createVeilPayX402Middleware({
      asset: 'USDCx',
      amount: '5000000', // 5 USDCx
      payTo: process.env.VENDOR_ADDRESS,
      network: process.env.STACKS_NETWORK || 'testnet',
      facilitatorUrl: process.env.X402_FACILITATOR_URL,
      description: 'Premium Content (5 USDCx)',
    }),
    getPaidContentHandler
  );

  // API execution - sBTC payment
  app.post('/x402/api/execute',
    createVeilPayX402Middleware({
      asset: 'sBTC',
      amount: '10000', // 0.0001 BTC
      payTo: process.env.VENDOR_ADDRESS,
      network: process.env.STACKS_NETWORK || 'testnet',
      facilitatorUrl: process.env.X402_FACILITATOR_URL,
      description: 'Paid API Execution (0.0001 BTC)',
    }),
    postExecuteApiHandler
  );

  console.log('[x402] Routes registered ✅');
  console.log('[x402] Available endpoints:');
  console.log('  GET  /x402/schema');
  console.log('  GET  /x402/scan (for x402scan registry)');
  console.log('  GET  /x402/stats');
  console.log('  POST /x402/verify-proof');
  console.log('  GET  /x402/demo (1 STX)');
  console.log('  GET  /x402/content/:id (5 USDCx)');
  console.log('  POST /x402/api/execute (0.0001 BTC)');
}

export {
  generatePaymentRequired,
  getSchemaHandler,
  getScanSchemaHandler,
  getDemoContentHandler,
  getPaidContentHandler,
  postExecuteApiHandler,
  getStatsHandler,
  postVerifyProofHandler,
  registerX402Routes,
};
