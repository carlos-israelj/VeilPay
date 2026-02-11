/**
 * x402 Bot Endpoints for VeilPay
 * Exposes bot marketplace endpoints with x402 payment integration
 * Bots run locally within the relayer process (monolith architecture)
 */

import { createVeilPayX402Middleware } from './middleware.js';

// Import bot analysis modules (run locally, not via HTTP)
import { analyzeContract } from '../bots/security/analyzer.js';
import { AISecurityAnalyzer } from '../bots/security/ai-insights.js';
import { TokenMetricsAnalyzer } from '../bots/tokenomics/metrics.js';
import { DEXDataFetcher } from '../bots/tokenomics/dex-data.js';
import { GitHubScraper } from '../bots/sentiment/github-scraper.js';
import { OnChainMetrics } from '../bots/sentiment/onchain-metrics.js';
import { NewsFetcher } from '../bots/sentiment/news-fetcher.js';
import { AISentimentAnalyzer } from '../bots/sentiment/ai-sentiment.js';

/**
 * Bot marketplace endpoints configuration
 */
const BOT_CONFIGS = {
  security: {
    name: 'Security Audit Bot',
    description: 'AI-powered smart contract security analysis',
    price: {
      STX: 5_000_000, // 5 STX in µSTX
      USDCx: 5_000_000, // 5 USDCx (assuming $5)
      sBTC: 50_000 // 0.0005 sBTC (assuming ~$50 BTC)
    },
    endpoint: '/x402/bots/security/audit',
    estimatedTime: '10-15 seconds',
    features: [
      'Static vulnerability scanning',
      'Reentrancy detection',
      'Access control analysis',
      'AI-powered insights (GPT-3.5)',
      'Executive summary'
    ]
  },
  tokenomics: {
    name: 'Tokenomics Analysis Bot',
    description: 'Token metrics and liquidity analysis',
    price: {
      STX: 3_000_000, // 3 STX
      USDCx: 3_000_000, // 3 USDCx
      sBTC: 30_000 // 0.0003 sBTC
    },
    endpoint: '/x402/bots/tokenomics/analyze',
    estimatedTime: '8-12 seconds',
    features: [
      'SIP-010 token analysis',
      'Holder distribution metrics',
      'DEX liquidity analysis',
      'Token health scoring'
    ]
  },
  sentiment: {
    name: 'Sentiment Analysis Bot',
    description: 'Multi-source project sentiment analysis',
    price: {
      STX: 2_000_000, // 2 STX
      USDCx: 2_000_000, // 2 USDCx
      sBTC: 20_000 // 0.0002 sBTC
    },
    endpoint: '/x402/bots/sentiment/analyze',
    estimatedTime: '12-18 seconds',
    features: [
      'GitHub development activity',
      'On-chain metrics',
      'News sentiment (CryptoPanic)',
      'AI sentiment synthesis'
    ]
  },
  coordinator: {
    name: 'Multi-Bot Coordinator',
    description: 'Full project analysis (Security + Tokenomics + Sentiment)',
    price: {
      STX: 10_000_000, // 10 STX
      USDCx: 10_000_000, // 10 USDCx
      sBTC: 100_000 // 0.001 sBTC
    },
    endpoint: '/x402/bots/coordinator/analyze',
    estimatedTime: '30-45 seconds',
    features: [
      'Orchestrates 3 worker bots',
      'Private bot-to-bot payments',
      'Investment recommendation',
      'Comprehensive executive summary'
    ]
  }
};

/**
 * Setup bot x402 endpoints
 */
export function setupBotEndpoints(app) {
  console.log('\n🤖 Setting up Bot Marketplace x402 endpoints...');

  // Get relayer address from env (vendor address for payments)
  const VENDOR_ADDRESS = process.env.RELAYER_PUBLIC_KEY_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const NETWORK = process.env.STACKS_NETWORK || 'testnet';
  const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || 'https://facilitator.x402.org';

  // SECURITY BOT ENDPOINT
  app.post('/x402/bots/security/audit',
    createVeilPayX402Middleware({
      asset: 'STX',
      amount: BOT_CONFIGS.security.price.STX.toString(),
      payTo: VENDOR_ADDRESS,
      network: NETWORK,
      facilitatorUrl: FACILITATOR_URL,
      description: BOT_CONFIGS.security.description
    }),
    async (req, res) => {
      try {
        const { contractAddress, contractName, fullAnalysis = true } = req.body;

        // Validate inputs
        if (!contractAddress || !contractName) {
          return res.status(400).json({
            error: 'Missing required fields: contractAddress, contractName'
          });
        }

        // Execute Security Bot analysis locally
        const axios = (await import('axios')).default;
        const stacksApi = axios.create({
          baseURL: process.env.STACKS_API || 'https://api.testnet.hiro.so'
        });

        console.log(`🛡️  Security Bot: Auditing ${contractAddress}.${contractName}...`);

        // Static analysis
        const staticAnalysis = await analyzeContract(contractAddress, contractName, stacksApi);

        // AI insights (if OpenAI key is available)
        let aiInsights = null;
        let executiveSummary = null;

        if (process.env.OPENAI_API_KEY && fullAnalysis) {
          try {
            const aiAnalyzer = new AISecurityAnalyzer(process.env.OPENAI_API_KEY);

            // Fetch contract source for AI analysis
            const sourceResponse = await stacksApi.get(`/v2/contracts/source/${contractAddress}/${contractName}`);
            const sourceCode = sourceResponse.data.source;

            aiInsights = await aiAnalyzer.generateInsights(sourceCode, staticAnalysis);
            executiveSummary = aiAnalyzer.generateExecutiveSummary(staticAnalysis, aiInsights);
          } catch (error) {
            console.error('AI analysis failed:', error.message);
          }
        }

        // Build response
        const response = {
          status: 'success',
          audit: {
            contractAddress,
            contractName,
            staticAnalysis,
            aiInsights,
            executiveSummary,
            completedAt: new Date().toISOString()
          },
          payment: req.veilpayPayment || { method: 'x402-standard' }
        };

        res.json(response);

      } catch (error) {
        console.error('Security bot endpoint error:', error.message);
        res.status(500).json({
          error: 'Security bot analysis failed',
          message: error.response?.data?.message || error.message
        });
      }
    }
  );

  // TOKENOMICS BOT ENDPOINT
  app.post('/x402/bots/tokenomics/analyze',
    createVeilPayX402Middleware({
      asset: 'STX',
      amount: BOT_CONFIGS.tokenomics.price.STX.toString(),
      payTo: VENDOR_ADDRESS,
      network: NETWORK,
      facilitatorUrl: FACILITATOR_URL,
      description: BOT_CONFIGS.tokenomics.description
    }),
    async (req, res) => {
      try {
        const { tokenContract, tokenSymbol } = req.body;

        if (!tokenContract) {
          return res.status(400).json({
            error: 'Missing required field: tokenContract'
          });
        }

        // Execute Tokenomics Bot analysis locally
        const axios = (await import('axios')).default;
        const stacksApi = axios.create({
          baseURL: process.env.STACKS_API || 'https://api.testnet.hiro.so'
        });

        console.log(`📊 Tokenomics Bot: Analyzing ${tokenContract}...`);

        // Token metrics analysis
        const metricsAnalyzer = new TokenMetricsAnalyzer(stacksApi);
        const metricsResult = await metricsAnalyzer.analyzeToken(tokenContract);

        // DEX liquidity analysis
        const dexFetcher = new DEXDataFetcher();
        const liquidityResult = await dexFetcher.getLiquidityData(tokenContract, tokenSymbol);

        // Calculate overall score
        const overallScore = Math.round(
          (metricsResult.metrics.healthScore * 0.6) +
          ((liquidityResult?.liquidityScore || 0) * 0.4)
        );

        const response = {
          status: 'success',
          analysis: {
            tokenContract,
            tokenSymbol: tokenSymbol || 'Unknown',
            overallScore,
            tokenMetrics: metricsResult,
            liquidityData: liquidityResult,
            completedAt: new Date().toISOString()
          },
          payment: req.veilpayPayment || { method: 'x402-standard' }
        };

        res.json(response);

      } catch (error) {
        console.error('Tokenomics bot endpoint error:', error.message);
        res.status(500).json({
          error: 'Tokenomics bot analysis failed',
          message: error.response?.data?.message || error.message
        });
      }
    }
  );

  // SENTIMENT BOT ENDPOINT
  app.post('/x402/bots/sentiment/analyze',
    createVeilPayX402Middleware({
      asset: 'STX',
      amount: BOT_CONFIGS.sentiment.price.STX.toString(),
      payTo: VENDOR_ADDRESS,
      network: NETWORK,
      facilitatorUrl: FACILITATOR_URL,
      description: BOT_CONFIGS.sentiment.description
    }),
    async (req, res) => {
      try {
        const { projectName, githubUrl, contractAddress, contractName, tokenSymbol } = req.body;

        if (!projectName) {
          return res.status(400).json({
            error: 'Missing required field: projectName'
          });
        }

        // Execute Sentiment Bot analysis locally
        const axios = (await import('axios')).default;
        const stacksApi = axios.create({
          baseURL: process.env.STACKS_API || 'https://api.testnet.hiro.so'
        });

        console.log(`💭 Sentiment Bot: Analyzing ${projectName}...`);

        // GitHub analysis
        let github = null;
        if (githubUrl) {
          try {
            const githubScraper = new GitHubScraper();
            github = await githubScraper.scrapeRepository(githubUrl);
          } catch (error) {
            console.error('GitHub analysis failed:', error.message);
          }
        }

        // On-chain metrics
        let onChain = null;
        if (contractAddress && contractName) {
          try {
            const onChainAnalyzer = new OnChainMetrics(stacksApi);
            onChain = await onChainAnalyzer.analyzeContract(contractAddress, contractName);
          } catch (error) {
            console.error('On-chain analysis failed:', error.message);
          }
        }

        // News sentiment
        let news = null;
        if (process.env.CRYPTOPANIC_API_KEY) {
          try {
            const newsFetcher = new NewsFetcher(process.env.CRYPTOPANIC_API_KEY);
            news = await newsFetcher.fetchNews(tokenSymbol || projectName);
          } catch (error) {
            console.error('News analysis failed:', error.message);
          }
        }

        // AI sentiment synthesis (if OpenAI key available)
        let aiSentiment = null;
        let executiveSummary = null;
        if (process.env.OPENAI_API_KEY) {
          try {
            const aiAnalyzer = new AISentimentAnalyzer(process.env.OPENAI_API_KEY);
            aiSentiment = await aiAnalyzer.analyzeSentiment(github, onChain, news, projectName);
            executiveSummary = aiAnalyzer.generateExecutiveSummary(github, onChain, news, aiSentiment);
          } catch (error) {
            console.error('AI sentiment failed:', error.message);
          }
        }

        // Calculate overall score
        const scores = [];
        if (github?.healthScore) scores.push(github.healthScore);
        if (onChain?.activityScore) scores.push(onChain.activityScore);
        if (news?.sentimentScore) scores.push(news.sentimentScore);
        const overallScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 50;

        const response = {
          status: 'success',
          sentiment: {
            projectName,
            overallScore,
            github,
            onChain,
            news,
            aiSentiment,
            executiveSummary,
            completedAt: new Date().toISOString()
          },
          payment: req.veilpayPayment || { method: 'x402-standard' }
        };

        res.json(response);

      } catch (error) {
        console.error('Sentiment bot endpoint error:', error.message);
        res.status(500).json({
          error: 'Sentiment bot analysis failed',
          message: error.response?.data?.message || error.message
        });
      }
    }
  );

  // COORDINATOR BOT ENDPOINT
  app.post('/x402/bots/coordinator/analyze',
    createVeilPayX402Middleware({
      asset: 'STX',
      amount: BOT_CONFIGS.coordinator.price.STX.toString(),
      payTo: VENDOR_ADDRESS,
      network: NETWORK,
      facilitatorUrl: FACILITATOR_URL,
      description: BOT_CONFIGS.coordinator.description
    }),
    async (req, res) => {
      try {
        const { projectName, contractAddress, contractName, tokenSymbol, githubUrl } = req.body;

        if (!projectName || !contractAddress || !contractName) {
          return res.status(400).json({
            error: 'Missing required fields: projectName, contractAddress, contractName'
          });
        }

        // Execute Coordinator Bot - runs all 3 worker bots locally
        const axios = (await import('axios')).default;
        const stacksApi = axios.create({
          baseURL: process.env.STACKS_API || 'https://api.testnet.hiro.so'
        });

        console.log(`🤖 Coordinator Bot: Full analysis for ${projectName}...`);

        const results = {
          security: null,
          tokenomics: null,
          sentiment: null
        };

        // Run Security Bot
        try {
          console.log('  🛡️  Running Security Bot...');
          const staticAnalysis = await analyzeContract(contractAddress, contractName, stacksApi);

          let aiInsights = null;
          let executiveSummary = null;
          if (process.env.OPENAI_API_KEY) {
            const aiAnalyzer = new AISecurityAnalyzer(process.env.OPENAI_API_KEY);
            const sourceResponse = await stacksApi.get(`/v2/contracts/source/${contractAddress}/${contractName}`);
            aiInsights = await aiAnalyzer.generateInsights(sourceResponse.data.source, staticAnalysis);
            executiveSummary = aiAnalyzer.generateExecutiveSummary(staticAnalysis, aiInsights);
          }

          results.security = { staticAnalysis, aiInsights, executiveSummary };
        } catch (error) {
          console.error('Security analysis failed:', error.message);
          results.security = { error: error.message };
        }

        // Run Tokenomics Bot
        try {
          console.log('  📊 Running Tokenomics Bot...');
          const tokenContract = `${contractAddress}.${contractName}`;
          const metricsAnalyzer = new TokenMetricsAnalyzer(stacksApi);
          const metricsResult = await metricsAnalyzer.analyzeToken(tokenContract);
          const dexFetcher = new DEXDataFetcher();
          const liquidityResult = await dexFetcher.getLiquidityData(tokenContract, tokenSymbol);
          const overallScore = Math.round((metricsResult.metrics.healthScore * 0.6) + ((liquidityResult?.liquidityScore || 0) * 0.4));

          results.tokenomics = { overallScore, tokenMetrics: metricsResult, liquidityData: liquidityResult };
        } catch (error) {
          console.error('Tokenomics analysis failed:', error.message);
          results.tokenomics = { error: error.message };
        }

        // Run Sentiment Bot
        try {
          console.log('  💭 Running Sentiment Bot...');
          const githubScraper = new GitHubScraper();
          const github = githubUrl ? await githubScraper.scrapeRepository(githubUrl) : null;

          const onChainAnalyzer = new OnChainMetricsAnalyzer(stacksApi);
          const onChain = await onChainAnalyzer.analyzeContract(contractAddress, contractName);

          let news = null;
          if (process.env.CRYPTOPANIC_API_KEY) {
            const newsFetcher = new NewsFetcher(process.env.CRYPTOPANIC_API_KEY);
            news = await newsFetcher.fetchNews(tokenSymbol || projectName);
          }

          let aiSentiment = null;
          let executiveSummary = null;
          if (process.env.OPENAI_API_KEY) {
            const aiAnalyzer = new AISentimentAnalyzer(process.env.OPENAI_API_KEY);
            aiSentiment = await aiAnalyzer.analyzeSentiment(github, onChain, news, projectName);
            executiveSummary = aiAnalyzer.generateExecutiveSummary(github, onChain, news, aiSentiment);
          }

          const scores = [];
          if (github?.healthScore) scores.push(github.healthScore);
          if (onChain?.activityScore) scores.push(onChain.activityScore);
          if (news?.sentimentScore) scores.push(news.sentimentScore);
          const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;

          results.sentiment = { overallScore, github, onChain, news, aiSentiment, executiveSummary };
        } catch (error) {
          console.error('Sentiment analysis failed:', error.message);
          results.sentiment = { error: error.message };
        }

        // Calculate overall score
        const scores = [];
        if (results.security && !results.security.error) {
          scores.push(100 - (results.security.staticAnalysis?.riskScore || 50));
        }
        if (results.tokenomics && !results.tokenomics.error) {
          scores.push(results.tokenomics.overallScore || 50);
        }
        if (results.sentiment && !results.sentiment.error) {
          scores.push(results.sentiment.overallScore || 50);
        }
        const overallScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 50;

        // Generate recommendation
        let recommendation = { action: 'Hold', rationale: 'Incomplete analysis', confidence: 'Low' };
        if (overallScore >= 80) {
          recommendation = { action: 'Strong Buy', rationale: 'Excellent fundamentals across all metrics', confidence: 'High' };
        } else if (overallScore >= 65) {
          recommendation = { action: 'Buy', rationale: 'Good overall fundamentals with minor concerns', confidence: 'Medium' };
        } else if (overallScore >= 50) {
          recommendation = { action: 'Hold', rationale: 'Mixed signals, proceed with caution', confidence: 'Medium' };
        } else {
          recommendation = { action: 'Avoid', rationale: 'Multiple concerns identified', confidence: 'High' };
        }

        const response = {
          status: 'success',
          overallScore,
          recommendation,
          detailedResults: results,
          payment: {
            method: req.veilpayPayment?.method || 'x402-standard',
            totalCost: '10 STX',
            breakdown: {
              securityBot: '5 STX',
              tokenomicsBot: '3 STX',
              sentimentBot: '2 STX'
            }
          },
          completedAt: new Date().toISOString()
        };

        res.json(response);

      } catch (error) {
        console.error('Coordinator bot endpoint error:', error.message);
        res.status(500).json({
          error: 'Coordinator analysis failed',
          message: error.response?.data?.message || error.message
        });
      }
    }
  );

  // BOT MARKETPLACE INFO ENDPOINT (free)
  app.get('/x402/bots', (req, res) => {
    res.json({
      marketplace: 'VeilPay Bot-to-Bot Economy',
      version: '1.0.0',
      bots: Object.entries(BOT_CONFIGS).map(([key, config]) => ({
        id: key,
        name: config.name,
        description: config.description,
        endpoint: config.endpoint,
        pricing: {
          STX: `${config.price.STX / 1_000_000} STX`,
          USDCx: `${config.price.USDCx / 1_000_000} USDCx`,
          sBTC: `${config.price.sBTC / 100_000_000} sBTC`
        },
        estimatedTime: config.estimatedTime,
        features: config.features,
        paymentMethods: ['x402-standard', 'veilpay-zk-snark']
      })),
      features: {
        privatePayments: 'All bots accept VeilPay ZK-SNARK proofs',
        unlinkability: 'Fully unlinkable bot-to-bot payments',
        multiAsset: 'Support for STX, USDCx, sBTC'
      }
    });
  });

  console.log('✓ Bot Marketplace endpoints registered:');
  console.log('  POST /x402/bots/security/audit (5 STX)');
  console.log('  POST /x402/bots/tokenomics/analyze (3 STX)');
  console.log('  POST /x402/bots/sentiment/analyze (2 STX)');
  console.log('  POST /x402/bots/coordinator/analyze (10 STX)');
  console.log('  GET  /x402/bots (marketplace info)');
}

export { BOT_CONFIGS };
