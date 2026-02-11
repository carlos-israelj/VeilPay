import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { JobManager } from './job-manager.js';
import { ResultAggregator } from './result-aggregator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Job Manager
const jobManager = new JobManager({
  veilpayUrl: process.env.VEILPAY_API || 'http://localhost:3001',
  network: process.env.STACKS_NETWORK || 'testnet',
  securityBotUrl: process.env.SECURITY_BOT_URL || 'http://localhost:4001',
  tokenomicsBotUrl: process.env.TOKENOMICS_BOT_URL || 'http://localhost:4002',
  sentimentBotUrl: process.env.SENTIMENT_BOT_URL || 'http://localhost:4003'
});

console.log('✓ Coordinator Bot initialized');

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    // Check worker bot status
    const workerStatus = await jobManager.checkWorkerBots();

    res.json({
      status: 'ok',
      service: 'veilpay-coordinator-bot',
      version: '1.0.0',
      workers: workerStatus,
      pricing: {
        full: parseInt(process.env.COORDINATOR_PRICE_STX) || 10,
        quick: 2,
        currency: 'STX'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Get bot info (for bot discovery)
 */
app.get('/info', (req, res) => {
  res.json({
    name: process.env.COORDINATOR_NAME || 'VeilPay Multi-Bot Coordinator',
    description: process.env.COORDINATOR_DESCRIPTION || 'Orchestrates Security + Tokenomics + Sentiment analysis',
    version: '1.0.0',
    pricing: {
      full: parseInt(process.env.COORDINATOR_PRICE_STX) || 10,
      quick: 2,
      currency: 'STX'
    },
    capabilities: [
      'Multi-bot orchestration (Security + Tokenomics + Sentiment)',
      'VeilPay private payments (ZK-SNARK proofs)',
      'Comprehensive project analysis',
      'Investment recommendation engine',
      'Executive summary generation',
      'Risk assessment'
    ],
    workerBots: [
      { name: 'Security Bot', price: '5 STX', features: 'Smart contract security audit + AI insights' },
      { name: 'Tokenomics Bot', price: '3 STX', features: 'Token metrics + DEX liquidity analysis' },
      { name: 'Sentiment Bot', price: '2 STX', features: 'GitHub + News + AI sentiment analysis' }
    ],
    endpoints: {
      analyze: 'POST /analyze',
      quick: 'POST /analyze/quick'
    },
    estimatedTime: '30-45 seconds',
    paymentMethod: 'VeilPay ZK-SNARK (fully private)',
    privacyGuarantee: 'All worker bot payments are unlinkable via zero-knowledge proofs'
  });
});

/**
 * MAIN ENDPOINT: Full project analysis (x402-protected)
 *
 * Payment: 10 STX via x402
 *
 * Orchestrates: Security Bot (5 STX) + Tokenomics Bot (3 STX) + Sentiment Bot (2 STX)
 * All payments are made privately via VeilPay ZK proofs
 *
 * Request body:
 * {
 *   "projectName": "VeilPay",
 *   "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
 *   "contractName": "veilpay",
 *   "tokenSymbol": "STX",
 *   "githubUrl": "https://github.com/carlos-israelj/VeilPay"  // Optional
 * }
 */
app.post('/analyze', async (req, res) => {
  try {
    const projectData = req.body;

    // Validate required fields
    if (!projectData.projectName || !projectData.contractAddress || !projectData.contractName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['projectName', 'contractAddress', 'contractName'],
        optional: ['tokenSymbol', 'githubUrl'],
        example: {
          projectName: 'VeilPay',
          contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: 'veilpay',
          tokenSymbol: 'STX',
          githubUrl: 'https://github.com/carlos-israelj/VeilPay'
        }
      });
    }

    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`  COORDINATOR BOT: Full Project Analysis`);
    console.log(`  Project: ${projectData.projectName}`);
    console.log(`  Contract: ${projectData.contractAddress}.${projectData.contractName}`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    // Get coordinator private key from env
    const coordinatorKey = process.env.COORDINATOR_PRIVATE_KEY;

    if (!coordinatorKey) {
      return res.status(500).json({
        error: 'Coordinator not configured',
        message: 'COORDINATOR_PRIVATE_KEY environment variable is required'
      });
    }

    // Execute job (hire all 3 bots via VeilPay)
    const jobResult = await jobManager.analyzeProject(projectData, coordinatorKey);

    // Aggregate results
    const aggregatedResult = ResultAggregator.aggregate(
      jobResult.results.security,
      jobResult.results.tokenomics,
      jobResult.results.sentiment,
      projectData
    );

    // Build response
    const response = {
      status: 'success',
      ...aggregatedResult,
      payment: {
        method: 'VeilPay ZK-SNARK',
        totalCost: jobResult.metadata.totalCost,
        breakdown: {
          security: '5 STX',
          tokenomics: '3 STX',
          sentiment: '2 STX'
        },
        privacyGuarantee: jobResult.metadata.privacyGuarantee,
        depositTxid: jobResult.deposit.txid
      },
      metadata: {
        coordinatorVersion: '1.0.0',
        analysisTime: '~35s',
        completedAt: new Date().toISOString()
      }
    };

    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`  ✓ ANALYSIS COMPLETE`);
    console.log(`  Overall Score: ${aggregatedResult.overallScore}/100`);
    console.log(`  Recommendation: ${aggregatedResult.recommendation.action}`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    res.json(response);

  } catch (error) {
    console.error('\n❌ Coordinator error:', error.message);
    console.error(error.stack);

    res.status(500).json({
      error: 'Coordinator analysis failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * QUICK ANALYSIS: Single bot analysis (cheaper - 2-5 STX)
 */
app.post('/analyze/quick', async (req, res) => {
  try {
    const { botType, projectData } = req.body;

    // Validate inputs
    if (!botType || !projectData) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: {
          botType: 'security|tokenomics|sentiment',
          projectData: {
            projectName: 'string',
            contractAddress: 'string (for security/tokenomics)',
            contractName: 'string (for security/tokenomics)',
            tokenSymbol: 'string (optional)',
            githubUrl: 'string (optional for sentiment)'
          }
        }
      });
    }

    if (!['security', 'tokenomics', 'sentiment'].includes(botType)) {
      return res.status(400).json({
        error: 'Invalid botType',
        allowed: ['security', 'tokenomics', 'sentiment']
      });
    }

    console.log(`\n⚡ Quick Analysis: ${botType} bot`);

    const coordinatorKey = process.env.COORDINATOR_PRIVATE_KEY;

    if (!coordinatorKey) {
      return res.status(500).json({
        error: 'Coordinator not configured'
      });
    }

    // Execute single bot job
    const result = await jobManager.quickAnalysis(botType, projectData, coordinatorKey);

    console.log(`\n✓ Quick analysis complete\n`);

    res.json(result);

  } catch (error) {
    console.error('Quick analysis error:', error.message);
    res.status(500).json({
      error: 'Quick analysis failed',
      message: error.message
    });
  }
});

/**
 * Test endpoint (free - for testing integration)
 */
app.post('/test', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Coordinator Bot is operational',
    testProject: {
      projectName: 'VeilPay',
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'veilpay',
      tokenSymbol: 'STX',
      githubUrl: 'https://github.com/carlos-israelj/VeilPay'
    },
    hint: 'Use POST /analyze with real project data (requires 10 STX payment via x402)',
    workerBots: [
      'Security Bot: http://localhost:4001',
      'Tokenomics Bot: http://localhost:4002',
      'Sentiment Bot: http://localhost:4003'
    ]
  });
});

/**
 * Get worker bot status
 */
app.get('/workers', async (req, res) => {
  try {
    const status = await jobManager.checkWorkerBots();
    res.json({
      status: 'success',
      workers: status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check worker bots',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  VeilPay Coordinator Bot                                   ║
║  Multi-Bot Orchestration with Private Payments            ║
╚════════════════════════════════════════════════════════════╝

🤖 Server: http://localhost:${PORT}
💰 Price: ${process.env.COORDINATOR_PRICE_STX || 10} STX (via x402)
🔐 Payment: VeilPay ZK-SNARK (fully private)

Worker Bots:
  🛡️  Security Bot:    ${process.env.SECURITY_BOT_URL || 'http://localhost:4001'}    (5 STX)
  📊 Tokenomics Bot:  ${process.env.TOKENOMICS_BOT_URL || 'http://localhost:4002'}  (3 STX)
  💭 Sentiment Bot:   ${process.env.SENTIMENT_BOT_URL || 'http://localhost:4003'}   (2 STX)

Endpoints:
  GET  /health   - Health check + worker status
  GET  /info     - Bot information
  GET  /workers  - Worker bot status
  POST /analyze  - Full analysis (10 STX, ~35s)
  POST /analyze/quick - Single bot (2-5 STX, ~10s)
  POST /test     - Free test endpoint

Privacy Guarantee:
  ✓ All worker payments via VeilPay ZK-SNARKs
  ✓ Fully unlinkable - cannot correlate payments
  ✓ No transaction graph analysis possible

Ready to coordinate! 🚀
`);
});

export default app;
