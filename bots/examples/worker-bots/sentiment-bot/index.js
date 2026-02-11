import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GitHubScraper } from './github-scraper.js';
import { OnChainMetrics } from './onchain-metrics.js';
import { NewsFetcher } from './news-fetcher.js';
import { AISentimentAnalyzer } from './ai-sentiment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize analyzers
const githubScraper = new GitHubScraper(process.env.GITHUB_TOKEN);
const onChainMetrics = new OnChainMetrics(process.env.STACKS_API);
const newsFetcher = new NewsFetcher();

let aiAnalyzer;
try {
  aiAnalyzer = new AISentimentAnalyzer(process.env.OPENAI_API_KEY);
  console.log('✓ AI Sentiment Analyzer initialized');
} catch (error) {
  console.warn('⚠ AI analyzer not available:', error.message);
  console.warn('⚠ Will provide basic sentiment analysis only');
}

console.log('✓ Sentiment analyzers initialized');

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'veilpay-sentiment-bot',
    version: '1.0.0',
    features: {
      githubAnalysis: true,
      onChainMetrics: true,
      newsAggregation: true,
      aiAnalysis: !!aiAnalyzer
    },
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 2,
      currency: 'STX'
    }
  });
});

/**
 * Get bot info (for bot discovery)
 */
app.get('/info', (req, res) => {
  res.json({
    name: process.env.BOT_NAME || 'VeilPay Sentiment Analyzer',
    description: process.env.BOT_DESCRIPTION || 'Project sentiment analysis via GitHub + News + AI',
    version: '1.0.0',
    pricing: {
      stx: parseInt(process.env.BOT_PRICE_STX) || 2,
      currency: 'STX'
    },
    capabilities: [
      'GitHub development activity tracking',
      'On-chain metrics analysis (Stacks)',
      'News sentiment aggregation (CryptoPanic)',
      'AI-powered sentiment synthesis (GPT-3.5)',
      'Multi-source executive summary',
      'Investment recommendation'
    ],
    endpoints: {
      analyze: 'POST /analyze',
      quick: 'POST /analyze/quick'
    },
    estimatedTime: '12-18 seconds',
    dataSources: ['GitHub', 'Stacks API', 'CryptoPanic', 'OpenAI'],
    paymentMethods: ['x402', 'standard']
  });
});

/**
 * MAIN ENDPOINT: Full sentiment analysis (x402-protected)
 *
 * Payment: 2 STX via x402 (VeilPay private payment)
 *
 * Request body:
 * {
 *   "projectName": "VeilPay",
 *   "githubUrl": "https://github.com/carlos-israelj/VeilPay",  // Optional
 *   "contractAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",  // Optional
 *   "contractName": "veilpay",  // Optional
 *   "tokenSymbol": "STX"  // Optional - for news lookup
 * }
 */
app.post('/analyze', async (req, res) => {
  try {
    const {
      projectName,
      githubUrl,
      contractAddress,
      contractName,
      tokenSymbol
    } = req.body;

    // Validate inputs
    if (!projectName) {
      return res.status(400).json({
        error: 'Missing required field: projectName',
        example: {
          projectName: 'VeilPay',
          githubUrl: 'https://github.com/carlos-israelj/VeilPay',
          contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: 'veilpay',
          tokenSymbol: 'STX'
        }
      });
    }

    console.log(`\n💭 Starting sentiment analysis: ${projectName}`);

    // STEP 1: Gather data from all sources (parallel)
    const [githubData, onChainData, newsData] = await Promise.allSettled([
      githubUrl ? githubScraper.analyzeRepository(githubUrl) : Promise.resolve({ status: 'skipped' }),
      (contractAddress && contractName) ? onChainMetrics.analyzeProject(contractAddress, contractName) : Promise.resolve({ status: 'skipped' }),
      newsFetcher.fetchNews(projectName, tokenSymbol || projectName)
    ]);

    // Extract results
    const github = githubData.status === 'fulfilled' ? githubData.value : { status: 'error', error: githubData.reason };
    const onChain = onChainData.status === 'fulfilled' ? onChainData.value : { status: 'error', error: onChainData.reason };
    const news = newsData.status === 'fulfilled' ? newsData.value : { status: 'error', error: newsData.reason };

    console.log(`  ✓ Data collected - GitHub: ${github.status}, OnChain: ${onChain.status}, News: ${news.status}`);

    // STEP 2: AI-powered sentiment synthesis (if enabled)
    let aiSentiment = null;
    let executiveSummary = null;

    if (aiAnalyzer) {
      try {
        console.log('  → Running AI sentiment analysis...');
        aiSentiment = await aiAnalyzer.analyzeSentiment(github, onChain, news, projectName);
        console.log(`  ✓ AI analysis complete (${aiSentiment.tokensUsed} tokens, $${aiSentiment.costEstimate})`);

        // Generate executive summary
        executiveSummary = aiAnalyzer.generateExecutiveSummary(github, onChain, news, aiSentiment);
        console.log(`  ✓ Executive summary generated (Overall: ${executiveSummary.overallScore}/100)`);

      } catch (aiError) {
        console.warn('  ⚠ AI sentiment analysis failed:', aiError.message);
      }
    }

    // STEP 3: Build response
    const sentimentReport = {
      status: 'success',
      project: {
        name: projectName,
        githubUrl: githubUrl || 'N/A',
        contract: contractAddress && contractName ? `${contractAddress}.${contractName}` : 'N/A',
        tokenSymbol: tokenSymbol || 'N/A'
      },
      completedAt: new Date().toISOString(),
      dataSources: {
        github,
        onChain,
        news
      },
      ...(executiveSummary && { executiveSummary }),
      ...(aiSentiment && { aiSentiment }),
      metadata: {
        botVersion: '1.0.0',
        paidAmount: process.env.BOT_PRICE_STX || '2 STX',
        analysisTime: '~15s',
        dataSources: [
          github.status === 'success' ? 'GitHub' : null,
          onChain.status === 'success' ? 'Stacks API' : null,
          news.status === 'success' ? 'CryptoPanic' : null,
          aiSentiment ? 'OpenAI' : null
        ].filter(Boolean)
      }
    };

    console.log(`✓ Sentiment analysis complete\n`);

    res.json(sentimentReport);

  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    res.status(500).json({
      error: 'Sentiment analysis failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * QUICK ANALYSIS: Basic metrics only (cheaper - 1 STX)
 */
app.post('/analyze/quick', async (req, res) => {
  try {
    const { projectName, githubUrl, tokenSymbol } = req.body;

    if (!projectName) {
      return res.status(400).json({
        error: 'Missing required field: projectName'
      });
    }

    console.log(`⚡ Quick sentiment: ${projectName}`);

    // Fetch only news data (fastest)
    const newsData = await newsFetcher.fetchNews(projectName, tokenSymbol || projectName);

    res.json({
      status: 'success',
      project: {
        name: projectName,
        tokenSymbol: tokenSymbol || 'N/A'
      },
      analysisType: 'quick',
      completedAt: new Date().toISOString(),
      newsData,
      metadata: {
        botVersion: '1.0.0',
        paidAmount: '1 STX',
        analysisTime: '~5s'
      }
    });

  } catch (error) {
    console.error('Quick sentiment error:', error.message);
    res.status(500).json({
      error: 'Quick sentiment failed',
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
    message: 'Sentiment Bot is operational',
    testProject: {
      projectName: 'VeilPay',
      githubUrl: 'https://github.com/carlos-israelj/VeilPay',
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'veilpay',
      tokenSymbol: 'STX'
    },
    hint: 'Use POST /analyze with real project data (requires 2 STX payment via x402)'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  VeilPay Sentiment Bot                                     ║
║  Multi-Source Project Sentiment Analyzer                   ║
╚════════════════════════════════════════════════════════════╝

💭 Server: http://localhost:${PORT}
💰 Price: ${process.env.BOT_PRICE_STX || 2} STX (via x402)
🤖 AI: ${aiAnalyzer ? 'Enabled (GPT-3.5)' : 'Disabled'}
📡 Data: GitHub, Stacks API, CryptoPanic

Endpoints:
  GET  /health          - Health check
  GET  /info            - Bot information
  POST /analyze         - Full sentiment analysis (2 STX)
  POST /analyze/quick   - Quick sentiment (1 STX)
  POST /test            - Free test endpoint

Ready to analyze sentiment! 📊
`);
});

export default app;
