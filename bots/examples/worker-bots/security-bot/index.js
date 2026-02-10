import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeContract, generateRecommendations } from './analyzer.js';
import { AISecurityAnalyzer } from './ai-insights.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI analyzer
let aiAnalyzer;
try {
  aiAnalyzer = new AISecurityAnalyzer(process.env.OPENAI_API_KEY);
  console.log('✓ AI Security Analyzer initialized');
} catch (error) {
  console.warn('⚠ AI analyzer not available:', error.message);
  console.warn('⚠ Will provide static analysis only');
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'veilpay-security-bot',
    version: '1.0.0',
    features: {
      staticAnalysis: true,
      aiAnalysis: !!aiAnalyzer
    },
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 5,
      currency: 'STX'
    }
  });
});

/**
 * Get bot info (for bot discovery)
 */
app.get('/info', (req, res) => {
  res.json({
    name: process.env.BOT_NAME || 'VeilPay Security Auditor',
    description: process.env.BOT_DESCRIPTION || 'AI-powered smart contract security analysis',
    version: '1.0.0',
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 5,
      currency: 'STX'
    },
    capabilities: [
      'Static vulnerability scanning',
      'Reentrancy detection',
      'Access control analysis',
      'Arithmetic overflow checks',
      'AI-powered insights (GPT-3.5)',
      'Executive summary report'
    ],
    endpoints: {
      audit: 'POST /audit',
      quick: 'POST /audit/quick'
    },
    estimatedTime: '10-15 seconds',
    paymentMethods: ['x402', 'standard']
  });
});

/**
 * MAIN ENDPOINT: Security audit (x402-protected)
 *
 * Payment: 5 STX via x402 (VeilPay private payment)
 *
 * Request body:
 * {
 *   "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
 *   "contractName": "my-contract",
 *   "fullAnalysis": true  // Include AI insights
 * }
 */
app.post('/audit', async (req, res) => {
  try {
    const { contractAddress, contractName, fullAnalysis = true } = req.body;

    // Validate inputs
    if (!contractAddress || !contractName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['contractAddress', 'contractName']
      });
    }

    console.log(`\n🔍 Starting security audit: ${contractAddress}.${contractName}`);

    const stacksApi = process.env.STACKS_API || 'https://api.testnet.hiro.so';

    // STEP 1: Static analysis
    console.log('  → Running static analysis...');
    const staticAnalysis = await analyzeContract(contractAddress, contractName, stacksApi);
    console.log(`  ✓ Static analysis complete: ${staticAnalysis.findings.length} findings (Risk: ${staticAnalysis.riskLevel})`);

    // STEP 2: Generate recommendations
    const recommendations = generateRecommendations(staticAnalysis);

    // STEP 3: AI analysis (if enabled and requested)
    let aiInsights = null;
    let executiveSummary = null;

    if (fullAnalysis && aiAnalyzer) {
      try {
        console.log('  → Running AI analysis...');

        // Fetch source code again for AI
        const axios = (await import('axios')).default;
        const sourceUrl = `${stacksApi}/v2/contracts/source/${contractAddress}/${contractName}`;
        const response = await axios.get(sourceUrl);
        const sourceCode = response.data.source;

        aiInsights = await aiAnalyzer.generateInsights(sourceCode, staticAnalysis);
        console.log(`  ✓ AI analysis complete (${aiInsights.tokensUsed} tokens, $${aiInsights.costEstimate})`);

        // Generate executive summary
        executiveSummary = aiAnalyzer.generateExecutiveSummary(staticAnalysis, aiInsights);
        console.log(`  ✓ Executive summary generated`);

      } catch (aiError) {
        console.warn('  ⚠ AI analysis failed:', aiError.message);
        // Continue without AI insights
      }
    }

    // STEP 4: Build response
    const auditReport = {
      status: 'success',
      audit: {
        contractAddress,
        contractName,
        analysisType: fullAnalysis && aiInsights ? 'full' : 'static',
        completedAt: new Date().toISOString()
      },
      staticAnalysis,
      recommendations,
      ...(executiveSummary && { executiveSummary }),
      ...(aiInsights && { aiInsights }),
      metadata: {
        botVersion: '1.0.0',
        paidAmount: process.env.BOT_PRICE_STX || '5 STX',
        analysisTime: '~12s'
      }
    };

    console.log(`✓ Audit complete\n`);

    res.json(auditReport);

  } catch (error) {
    console.error('Audit error:', error.message);
    res.status(500).json({
      error: 'Audit failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * QUICK AUDIT: Static analysis only (cheaper - 2 STX)
 */
app.post('/audit/quick', async (req, res) => {
  try {
    const { contractAddress, contractName } = req.body;

    if (!contractAddress || !contractName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['contractAddress', 'contractName']
      });
    }

    console.log(`⚡ Quick audit: ${contractAddress}.${contractName}`);

    const stacksApi = process.env.STACKS_API || 'https://api.testnet.hiro.so';
    const staticAnalysis = await analyzeContract(contractAddress, contractName, stacksApi);
    const recommendations = generateRecommendations(staticAnalysis);

    res.json({
      status: 'success',
      audit: {
        contractAddress,
        contractName,
        analysisType: 'quick',
        completedAt: new Date().toISOString()
      },
      staticAnalysis,
      recommendations,
      metadata: {
        botVersion: '1.0.0',
        paidAmount: '2 STX',
        analysisTime: '~5s'
      }
    });

  } catch (error) {
    console.error('Quick audit error:', error.message);
    res.status(500).json({
      error: 'Quick audit failed',
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
    message: 'Security Bot is operational',
    testContract: {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'example-contract'
    },
    hint: 'Use POST /audit with real contract data (requires 5 STX payment via x402)'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  VeilPay Security Bot                                      ║
║  AI-Powered Smart Contract Auditor                         ║
╚════════════════════════════════════════════════════════════╝

🔒 Server: http://localhost:${PORT}
💰 Price: ${process.env.BOT_PRICE_STX || 5} STX (via x402)
🤖 AI: ${aiAnalyzer ? 'Enabled (GPT-3.5)' : 'Disabled'}
📡 Stacks API: ${process.env.STACKS_API || 'https://api.testnet.hiro.so'}

Endpoints:
  GET  /health       - Health check
  GET  /info         - Bot information
  POST /audit        - Full security audit (5 STX)
  POST /audit/quick  - Quick scan (2 STX)
  POST /test         - Free test endpoint

Ready to audit contracts! 🛡️
`);
});

export default app;
