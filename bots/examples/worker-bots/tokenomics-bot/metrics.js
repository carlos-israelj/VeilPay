import axios from 'axios';

/**
 * Token metrics analyzer for SIP-010 tokens on Stacks
 * Fetches on-chain data and calculates key metrics
 */

export class TokenMetricsAnalyzer {
  constructor(stacksApi) {
    this.stacksApi = stacksApi || 'https://api.testnet.hiro.so';
  }

  /**
   * Get comprehensive token metrics
   */
  async analyzeToken(tokenContract) {
    try {
      const [onChainData, holderData, transferData] = await Promise.all([
        this.getTokenInfo(tokenContract),
        this.getHolderDistribution(tokenContract),
        this.getTransferActivity(tokenContract)
      ]);

      const metrics = this.calculateMetrics(onChainData, holderData, transferData);

      return {
        status: 'success',
        tokenContract,
        metrics,
        onChainData,
        holderData,
        transferData,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Failed to analyze token: ${error.message}`);
    }
  }

  /**
   * Fetch token contract info
   */
  async getTokenInfo(tokenContract) {
    try {
      const [contractAddress, contractName] = tokenContract.split('.');

      // Get contract interface
      const interfaceUrl = `${this.stacksApi}/v2/contracts/interface/${contractAddress}/${contractName}`;
      const interfaceResponse = await axios.get(interfaceUrl);

      // Check if it's a valid SIP-010 token
      const isSIP010 = this.validateSIP010(interfaceResponse.data);

      // Try to get token metadata (name, symbol, decimals)
      let metadata = {};
      try {
        // Call read-only functions
        const nameResult = await this.callReadOnly(contractAddress, contractName, 'get-name');
        const symbolResult = await this.callReadOnly(contractAddress, contractName, 'get-symbol');
        const decimalsResult = await this.callReadOnly(contractAddress, contractName, 'get-decimals');
        const totalSupplyResult = await this.callReadOnly(contractAddress, contractName, 'get-total-supply');

        metadata = {
          name: nameResult,
          symbol: symbolResult,
          decimals: decimalsResult,
          totalSupply: totalSupplyResult
        };
      } catch (metadataError) {
        console.warn('Could not fetch token metadata:', metadataError.message);
      }

      return {
        contractAddress,
        contractName,
        isSIP010,
        metadata,
        functions: interfaceResponse.data.functions.map(f => f.name)
      };

    } catch (error) {
      console.error('Token info error:', error.message);
      return {
        error: 'Failed to fetch token info',
        details: error.message
      };
    }
  }

  /**
   * Get holder distribution (approximation from recent transfers)
   */
  async getHolderDistribution(tokenContract) {
    try {
      // This is an approximation - real holder count requires indexing all transfers
      // For now, we analyze recent transfer events

      const [contractAddress, contractName] = tokenContract.split('.');
      const eventsUrl = `${this.stacksApi}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=50`;

      const response = await axios.get(eventsUrl);
      const transferEvents = response.data.results.filter(e => e.event_type === 'fungible_token_asset');

      // Extract unique addresses
      const holders = new Set();
      transferEvents.forEach(event => {
        if (event.ft_transfer?.sender) holders.add(event.ft_transfer.sender);
        if (event.ft_transfer?.recipient) holders.add(event.ft_transfer.recipient);
      });

      return {
        approximateHolders: holders.size,
        recentTransfers: transferEvents.length,
        note: 'Holder count is approximate based on recent activity'
      };

    } catch (error) {
      console.error('Holder distribution error:', error.message);
      return {
        approximateHolders: 0,
        error: error.message
      };
    }
  }

  /**
   * Get transfer activity (last 24h, 7d, 30d)
   */
  async getTransferActivity(tokenContract) {
    try {
      const [contractAddress, contractName] = tokenContract.split('.');
      const eventsUrl = `${this.stacksApi}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=100`;

      const response = await axios.get(eventsUrl);
      const transferEvents = response.data.results.filter(e => e.event_type === 'fungible_token_asset');

      const now = Date.now() / 1000; // Unix timestamp
      const day24 = now - (24 * 60 * 60);
      const day7 = now - (7 * 24 * 60 * 60);
      const day30 = now - (30 * 24 * 60 * 60);

      const transfers24h = transferEvents.filter(e => e.block_time >= day24).length;
      const transfers7d = transferEvents.filter(e => e.block_time >= day7).length;
      const transfers30d = transferEvents.filter(e => e.block_time >= day30).length;

      // Calculate average
      const avgDaily = transfers30d / 30;

      return {
        last24h: transfers24h,
        last7d: transfers7d,
        last30d: transfers30d,
        averageDaily: avgDaily.toFixed(2),
        trend: transfers24h > avgDaily ? 'increasing' : 'decreasing'
      };

    } catch (error) {
      console.error('Transfer activity error:', error.message);
      return {
        last24h: 0,
        last7d: 0,
        last30d: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate key tokenomics metrics
   */
  calculateMetrics(onChainData, holderData, transferData) {
    const metrics = {};

    // Token health score (0-100)
    let healthScore = 50; // Base score

    // Holder distribution score
    if (holderData.approximateHolders > 100) healthScore += 15;
    else if (holderData.approximateHolders > 50) healthScore += 10;
    else if (holderData.approximateHolders > 10) healthScore += 5;

    // Transfer activity score
    if (transferData.last24h > 10) healthScore += 15;
    else if (transferData.last24h > 5) healthScore += 10;
    else if (transferData.last24h > 1) healthScore += 5;

    // SIP-010 compliance score
    if (onChainData.isSIP010) healthScore += 20;

    metrics.healthScore = Math.min(healthScore, 100);

    // Liquidity assessment
    if (holderData.approximateHolders > 50 && transferData.last24h > 5) {
      metrics.liquidityAssessment = 'High';
    } else if (holderData.approximateHolders > 10 && transferData.last24h > 1) {
      metrics.liquidityAssessment = 'Medium';
    } else {
      metrics.liquidityAssessment = 'Low';
    }

    // Activity level
    if (transferData.last24h > 20) {
      metrics.activityLevel = 'Very Active';
    } else if (transferData.last24h > 10) {
      metrics.activityLevel = 'Active';
    } else if (transferData.last24h > 1) {
      metrics.activityLevel = 'Moderate';
    } else {
      metrics.activityLevel = 'Low';
    }

    return metrics;
  }

  /**
   * Validate SIP-010 compliance
   */
  validateSIP010(contractInterface) {
    const requiredFunctions = [
      'transfer',
      'get-name',
      'get-symbol',
      'get-decimals',
      'get-balance',
      'get-total-supply'
    ];

    const availableFunctions = contractInterface.functions.map(f => f.name);

    const hasAllRequired = requiredFunctions.every(fn =>
      availableFunctions.includes(fn)
    );

    return hasAllRequired;
  }

  /**
   * Call read-only contract function
   */
  async callReadOnly(contractAddress, contractName, functionName) {
    try {
      const url = `${this.stacksApi}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

      const response = await axios.post(url, {
        sender: contractAddress,
        arguments: []
      });

      return response.data.result || 'N/A';

    } catch (error) {
      return 'N/A';
    }
  }
}
