import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TokenMetricsAnalyzer } from './metrics.js';
import { DEXDataFetcher } from './dex-data.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize analyzers
const metricsAnalyzer = new TokenMetricsAnalyzer(process.env.STACKS_API);
const dexFetcher = new DEXDataFetcher();

console.log('✓ Tokenomics analyzers initialized');

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'veilpay-tokenomics-bot',
    version: '1.0.0',
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 3,
      currency: 'STX'
    }
  });
});

/**
 * Get bot info (for bot discovery)
 */
app.get('/info', (req, res) => {
  res.json({
    name: process.env.BOT_NAME || 'VeilPay Tokenomics Analyzer',
    description: process.env.BOT_DESCRIPTION || 'Token metrics and liquidity analysis',
    version: '1.0.0',
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 3,
      currency: 'STX'
    },
    capabilities: [
      'SIP-010 token analysis',
      'Holder distribution metrics',
      'Transfer activity tracking',
      'DEX liquidity analysis (DexScreener)',
      'Token health scoring',
      'Liquidity recommendations'
    ],
    endpoints: {
      analyze: 'POST /analyze',
      quick: 'POST /analyze/quick'
    },
    estimatedTime: '8-12 seconds',
    dataSources: ['Stacks API', 'DexScreener', 'Coingecko'],
    paymentMethods: ['x402', 'standard']
  });
});

/**
 * MAIN ENDPOINT: Full tokenomics analysis (x402-protected)
 *
 * Payment: 3 STX via x402 (VeilPay private payment)
 *
 * Request body:
 * {
 *   "tokenContract": "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx",
 *   "tokenSymbol": "STX"  // Optional - for DEX data lookup
 * }
 */
app.post('/analyze', async (req, res) => {
  try {
    const { tokenContract, tokenSymbol } = req.body;

    // Validate inputs
    if (!tokenContract) {
      return res.status(400).json({
        error: 'Missing required field: tokenContract',
        example: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx'
      });
    }

    console.log(`\n📊 Starting tokenomics analysis: ${tokenContract}`);

    // STEP 1: Token metrics analysis
    console.log('  → Analyzing token metrics...');
    const metricsResult = await metricsAnalyzer.analyzeToken(tokenContract);
    console.log(`  ✓ Metrics complete (Health: ${metricsResult.metrics.healthScore}/100)`);

    // STEP 2: DEX liquidity analysis (if symbol provided)
    let liquidityResult = null;
    if (tokenSymbol) {
      try {
        console.log('  → Fetching DEX liquidity data...');
        liquidityResult = await dexFetcher.getLiquidityData(tokenContract, tokenSymbol);
        console.log(`  ✓ Liquidity data fetched (Score: ${liquidityResult.liquidityScore}/100)`);
      } catch (dexError) {
        console.warn('  ⚠ DEX data fetch failed:', dexError.message);
      }
    }

    // STEP 3: Generate recommendations
    const recommendations = generateRecommendations(
      metricsResult,
      liquidityResult
    );

    // STEP 4: Calculate overall score
    const overallScore = calculateOverallScore(
      metricsResult.metrics.healthScore,
      liquidityResult?.liquidityScore || 0
    );

    // Build response
    const analysisReport = {
      status: 'success',
      tokenContract,
      tokenSymbol: tokenSymbol || 'N/A',
      completedAt: new Date().toISOString(),
      overallScore,
      tokenMetrics: metricsResult,
      ...(liquidityResult && { liquidityData: liquidityResult }),
      recommendations,
      metadata: {
        botVersion: '1.0.0',
        paidAmount: process.env.BOT_PRICE_STX || '3 STX',
        analysisTime: '~10s'
      }
    };

    console.log(`✓ Tokenomics analysis complete (Overall: ${overallScore}/100)\n`);

    res.json(analysisReport);

  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({
      error: 'Tokenomics analysis failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * QUICK ANALYSIS: On-chain metrics only (cheaper - 1.5 STX)
 */
app.post('/analyze/quick', async (req, res) => {
  try {
    const { tokenContract } = req.body;

    if (!tokenContract) {
      return res.status(400).json({
        error: 'Missing required field: tokenContract'
      });
    }

    console.log(`⚡ Quick tokenomics: ${tokenContract}`);

    const metricsResult = await metricsAnalyzer.analyzeToken(tokenContract);

    res.json({
      status: 'success',
      tokenContract,
      analysisType: 'quick',
      completedAt: new Date().toISOString(),
      tokenMetrics: metricsResult,
      metadata: {
        botVersion: '1.0.0',
        paidAmount: '1.5 STX',
        analysisTime: '~5s'
      }
    });

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
    message: 'Tokenomics Bot is operational',
    testToken: {
      tokenContract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx',
      tokenSymbol: 'STX'
    },
    hint: 'Use POST /analyze with real token data (requires 3 STX payment via x402)'
  });
});

/**
 * Generate investment recommendations
 */
function generateRecommendations(metricsResult, liquidityResult) {
  const recommendations = [];

  // Health score recommendations
  const healthScore = metricsResult.metrics.healthScore;

  if (healthScore >= 80) {
    recommendations.push({
      category: 'Token Health',
      assessment: 'Excellent',
      description: 'Strong tokenomics fundamentals',
      action: 'Token shows healthy metrics across all dimensions'
    });
  } else if (healthScore >= 60) {
    recommendations.push({
      category: 'Token Health',
      assessment: 'Good',
      description: 'Solid tokenomics with room for improvement',
      action: 'Monitor activity trends and holder distribution'
    });
  } else if (healthScore >= 40) {
    recommendations.push({
      category: 'Token Health',
      assessment: 'Fair',
      description: 'Moderate tokenomics health',
      action: 'Exercise caution - verify project fundamentals'
    });
  } else {
    recommendations.push({
      category: 'Token Health',
      assessment: 'Weak',
      description: 'Low tokenomics score indicates risks',
      action: 'High risk - conduct thorough due diligence'
    });
  }

  // Liquidity recommendations
  if (liquidityResult) {
    const liquidityRecs = dexFetcher.generateLiquidityRecommendations(
      liquidityResult.liquidityScore,
      liquidityResult
    );
    recommendations.push(...liquidityRecs);
  }

  // Activity recommendations
  const activityLevel = metricsResult.metrics.activityLevel;
  if (activityLevel === 'Low') {
    recommendations.push({
      category: 'Activity',
      assessment: 'Low Activity',
      description: 'Limited on-chain activity detected',
      action: 'Verify project is active and not abandoned'
    });
  }

  return recommendations;
}

/**
 * Calculate overall tokenomics score
 */
function calculateOverallScore(healthScore, liquidityScore) {
  // Weighted average: 60% health, 40% liquidity
  const weighted = (healthScore * 0.6) + (liquidityScore * 0.4);
  return Math.round(weighted);
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  VeilPay Tokenomics Bot                                    ║
║  Token Metrics & Liquidity Analyzer                        ║
╚════════════════════════════════════════════════════════════╝

💹 Server: http://localhost:${PORT}
💰 Price: ${process.env.BOT_PRICE_STX || 3} STX (via x402)
📡 Stacks API: ${process.env.STACKS_API || 'https://api.testnet.hiro.so'}
📊 Data Sources: Stacks API, DexScreener, Coingecko

Endpoints:
  GET  /health          - Health check
  GET  /info            - Bot information
  POST /analyze         - Full tokenomics analysis (3 STX)
  POST /analyze/quick   - Quick metrics (1.5 STX)
  POST /test            - Free test endpoint

Ready to analyze tokens! 📈
`);
});

export default app;
