/**
 * x402 Bot Endpoints for VeilPay
 * Exposes bot marketplace endpoints with x402 payment integration
 */

import { createVeilPayX402Middleware } from './middleware.js';

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

        // Forward request to Security Bot
        const axios = (await import('axios')).default;
        const botUrl = process.env.SECURITY_BOT_URL || 'http://localhost:4001';

        const botResponse = await axios.post(`${botUrl}/audit`, {
          contractAddress,
          contractName,
          fullAnalysis
        }, { timeout: 30000 });

        // Add payment metadata
        const response = {
          ...botResponse.data,
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

        const axios = (await import('axios')).default;
        const botUrl = process.env.TOKENOMICS_BOT_URL || 'http://localhost:4002';

        const botResponse = await axios.post(`${botUrl}/analyze`, {
          tokenContract,
          tokenSymbol
        }, { timeout: 30000 });

        const response = {
          ...botResponse.data,
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

        const axios = (await import('axios')).default;
        const botUrl = process.env.SENTIMENT_BOT_URL || 'http://localhost:4003';

        const botResponse = await axios.post(`${botUrl}/analyze`, {
          projectName,
          githubUrl,
          contractAddress,
          contractName,
          tokenSymbol
        }, { timeout: 45000 });

        const response = {
          ...botResponse.data,
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

        const axios = (await import('axios')).default;
        const botUrl = process.env.COORDINATOR_BOT_URL || 'http://localhost:4000';

        const botResponse = await axios.post(`${botUrl}/analyze`, {
          projectName,
          contractAddress,
          contractName,
          tokenSymbol,
          githubUrl
        }, { timeout: 60000 });

        const response = {
          ...botResponse.data,
          payment: req.veilpayPayment || { method: 'x402-standard' }
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
