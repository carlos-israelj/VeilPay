import { VeilPayClient } from './veilpay-client.js';

/**
 * Job manager for coordinating multiple worker bots
 * Orchestrates Security, Tokenomics, and Sentiment bots via VeilPay
 */

export class JobManager {
  constructor(config) {
    this.veilpayClient = new VeilPayClient(config.veilpayUrl, config.network);
    this.workerBots = {
      security: {
        url: config.securityBotUrl,
        price: 5, // 5 STX
        endpoint: '/audit'
      },
      tokenomics: {
        url: config.tokenomicsBotUrl,
        price: 3, // 3 STX
        endpoint: '/analyze'
      },
      sentiment: {
        url: config.sentimentBotUrl,
        price: 2, // 2 STX
        endpoint: '/analyze'
      }
    };
    this.totalCost = 10; // Total: 10 STX for all 3 bots
  }

  /**
   * Execute full project analysis
   * Hires all 3 worker bots privately via VeilPay
   */
  async analyzeProject(projectData, coordinatorKey) {
    try {
      console.log('\n🤖 Starting Coordinator Bot Analysis\n');
      console.log(`Project: ${projectData.projectName}`);
      console.log(`Total Budget: ${this.totalCost} STX\n`);

      // STEP 1: Deposit 10 STX to VeilPay pool
      console.log('STEP 1: Depositing to VeilPay privacy pool');
      const deposit = await this.veilpayClient.deposit(
        this.totalCost * 1000000, // Convert to µSTX
        coordinatorKey,
        process.env.VEILPAY_CONTRACT_ADDRESS,
        process.env.VEILPAY_CONTRACT_NAME
      );

      console.log(`✓ Deposited ${this.totalCost} STX to VeilPay\n`);

      // Save deposit credentials for private payments
      const { secret, nonce } = deposit;

      // STEP 2: Hire worker bots in parallel (all via VeilPay ZK proofs)
      console.log('STEP 2: Hiring worker bots (private payments)\n');

      const jobs = [
        this.hireSecurityBot(projectData, secret, nonce),
        this.hireTokenomicsBot(projectData, secret, nonce),
        this.hireSentimentBot(projectData, secret, nonce)
      ];

      const results = await Promise.allSettled(jobs);

      // Extract results
      const securityResult = results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason.message };
      const tokenomicsResult = results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason.message };
      const sentimentResult = results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason.message };

      console.log('\n✓ All worker bots completed\n');

      return {
        success: true,
        projectData,
        deposit: {
          txid: deposit.txid,
          amount: this.totalCost,
          commitment: deposit.commitment.substring(0, 16) + '...'
        },
        results: {
          security: securityResult,
          tokenomics: tokenomicsResult,
          sentiment: sentimentResult
        },
        metadata: {
          totalCost: this.totalCost,
          paymentMethod: 'VeilPay ZK-SNARK',
          privacyGuarantee: 'Full unlinkability - cannot correlate payments',
          completedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      throw new Error(`Job execution failed: ${error.message}`);
    }
  }

  /**
   * Hire Security Bot (5 STX via VeilPay)
   */
  async hireSecurityBot(projectData, secret, nonce) {
    console.log('→ Hiring Security Bot (5 STX)...');

    const payload = {
      contractAddress: projectData.contractAddress,
      contractName: projectData.contractName,
      fullAnalysis: true
    };

    const result = await this.veilpayClient.callWorkerBot(
      this.workerBots.security.url,
      this.workerBots.security.endpoint,
      payload,
      secret,
      nonce,
      this.workerBots.security.price * 1000000 // Convert to µSTX
    );

    console.log('✓ Security Bot completed\n');

    return {
      bot: 'Security',
      price: this.workerBots.security.price,
      result
    };
  }

  /**
   * Hire Tokenomics Bot (3 STX via VeilPay)
   */
  async hireTokenomicsBot(projectData, secret, nonce) {
    console.log('→ Hiring Tokenomics Bot (3 STX)...');

    const payload = {
      tokenContract: `${projectData.contractAddress}.${projectData.contractName}`,
      tokenSymbol: projectData.tokenSymbol
    };

    const result = await this.veilpayClient.callWorkerBot(
      this.workerBots.tokenomics.url,
      this.workerBots.tokenomics.endpoint,
      payload,
      secret,
      nonce,
      this.workerBots.tokenomics.price * 1000000
    );

    console.log('✓ Tokenomics Bot completed\n');

    return {
      bot: 'Tokenomics',
      price: this.workerBots.tokenomics.price,
      result
    };
  }

  /**
   * Hire Sentiment Bot (2 STX via VeilPay)
   */
  async hireSentimentBot(projectData, secret, nonce) {
    console.log('→ Hiring Sentiment Bot (2 STX)...');

    const payload = {
      projectName: projectData.projectName,
      githubUrl: projectData.githubUrl,
      contractAddress: projectData.contractAddress,
      contractName: projectData.contractName,
      tokenSymbol: projectData.tokenSymbol
    };

    const result = await this.veilpayClient.callWorkerBot(
      this.workerBots.sentiment.url,
      this.workerBots.sentiment.endpoint,
      payload,
      secret,
      nonce,
      this.workerBots.sentiment.price * 1000000
    );

    console.log('✓ Sentiment Bot completed\n');

    return {
      bot: 'Sentiment',
      price: this.workerBots.sentiment.price,
      result
    };
  }

  /**
   * Execute quick analysis (single bot)
   */
  async quickAnalysis(botType, projectData, coordinatorKey) {
    try {
      const bot = this.workerBots[botType];

      if (!bot) {
        throw new Error(`Unknown bot type: ${botType}. Available: security, tokenomics, sentiment`);
      }

      console.log(`\n⚡ Quick Analysis: ${botType} bot (${bot.price} STX)\n`);

      // Deposit to VeilPay
      const deposit = await this.veilpayClient.deposit(
        bot.price * 1000000,
        coordinatorKey,
        process.env.VEILPAY_CONTRACT_ADDRESS,
        process.env.VEILPAY_CONTRACT_NAME
      );

      // Prepare payload based on bot type
      let payload;
      switch (botType) {
        case 'security':
          payload = {
            contractAddress: projectData.contractAddress,
            contractName: projectData.contractName,
            fullAnalysis: false // Quick mode
          };
          break;
        case 'tokenomics':
          payload = {
            tokenContract: `${projectData.contractAddress}.${projectData.contractName}`,
            tokenSymbol: projectData.tokenSymbol
          };
          break;
        case 'sentiment':
          payload = {
            projectName: projectData.projectName,
            tokenSymbol: projectData.tokenSymbol
          };
          break;
      }

      // Call bot
      const result = await this.veilpayClient.callWorkerBot(
        bot.url,
        bot.endpoint,
        payload,
        deposit.secret,
        deposit.nonce,
        bot.price * 1000000
      );

      console.log(`\n✓ ${botType} bot completed\n`);

      return {
        success: true,
        botType,
        result,
        deposit: {
          txid: deposit.txid,
          amount: bot.price
        }
      };

    } catch (error) {
      throw new Error(`Quick analysis failed: ${error.message}`);
    }
  }

  /**
   * Get worker bot status
   */
  async checkWorkerBots() {
    const status = {};

    for (const [botName, bot] of Object.entries(this.workerBots)) {
      try {
        const response = await axios.get(`${bot.url}/health`, { timeout: 5000 });
        status[botName] = {
          url: bot.url,
          status: response.data.status,
          price: bot.price
        };
      } catch (error) {
        status[botName] = {
          url: bot.url,
          status: 'offline',
          error: error.message
        };
      }
    }

    return status;
  }
}

import axios from 'axios';
