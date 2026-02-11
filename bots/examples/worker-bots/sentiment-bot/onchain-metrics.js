import axios from 'axios';

/**
 * On-chain metrics analyzer for Stacks projects
 * Tracks contract deployments, transaction volume, and user adoption
 */

export class OnChainMetrics {
  constructor(stacksApi) {
    this.stacksApi = stacksApi || 'https://api.testnet.hiro.so';
  }

  /**
   * Analyze on-chain activity for a project
   */
  async analyzeProject(contractAddress, contractName) {
    try {
      console.log(`  → Analyzing on-chain metrics: ${contractAddress}.${contractName}`);

      const [contractInfo, transactions, events] = await Promise.all([
        this.getContractInfo(contractAddress, contractName),
        this.getTransactionHistory(contractAddress, contractName),
        this.getContractEvents(contractAddress, contractName)
      ]);

      const metrics = this.calculateOnChainMetrics(transactions, events);

      return {
        status: 'success',
        contract: `${contractAddress}.${contractName}`,
        contractInfo,
        transactions: {
          total: transactions.length,
          last24h: transactions.filter(tx => this.isLast24h(tx.burn_block_time)).length,
          last7d: transactions.filter(tx => this.isLast7d(tx.burn_block_time)).length
        },
        events: {
          total: events.length,
          types: this.groupEventsByType(events)
        },
        metrics,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('On-chain analysis error:', error.message);
      return {
        status: 'error',
        error: 'On-chain analysis failed',
        message: error.message
      };
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(contractAddress, contractName) {
    try {
      const url = `${this.stacksApi}/v2/contracts/interface/${contractAddress}/${contractName}`;
      const response = await axios.get(url);

      return {
        functions: response.data.functions.length,
        variables: response.data.variables.length,
        maps: response.data.maps.length,
        fungibleTokens: response.data.fungible_tokens.length,
        nonFungibleTokens: response.data.non_fungible_tokens.length
      };

    } catch (error) {
      console.warn('Contract info error:', error.message);
      return {};
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(contractAddress, contractName) {
    try {
      const url = `${this.stacksApi}/extended/v1/address/${contractAddress}.${contractName}/transactions?limit=50`;
      const response = await axios.get(url);

      return response.data.results || [];

    } catch (error) {
      console.warn('Transaction history error:', error.message);
      return [];
    }
  }

  /**
   * Get contract events
   */
  async getContractEvents(contractAddress, contractName) {
    try {
      const url = `${this.stacksApi}/extended/v1/contract/${contractAddress}.${contractName}/events?limit=100`;
      const response = await axios.get(url);

      return response.data.results || [];

    } catch (error) {
      console.warn('Contract events error:', error.message);
      return [];
    }
  }

  /**
   * Calculate on-chain activity metrics
   */
  calculateOnChainMetrics(transactions, events) {
    let activityScore = 0;

    // Transaction volume score
    const txLast7d = transactions.filter(tx => this.isLast7d(tx.burn_block_time)).length;
    if (txLast7d > 100) activityScore += 30;
    else if (txLast7d > 50) activityScore += 25;
    else if (txLast7d > 20) activityScore += 20;
    else if (txLast7d > 10) activityScore += 15;
    else if (txLast7d > 5) activityScore += 10;

    // Event diversity score
    const eventTypes = this.groupEventsByType(events);
    const uniqueEventTypes = Object.keys(eventTypes).length;

    if (uniqueEventTypes > 5) activityScore += 20;
    else if (uniqueEventTypes > 3) activityScore += 15;
    else if (uniqueEventTypes > 1) activityScore += 10;

    // Unique user score (approximate from transactions)
    const uniqueUsers = new Set();
    transactions.forEach(tx => {
      if (tx.sender_address) uniqueUsers.add(tx.sender_address);
    });

    if (uniqueUsers.size > 50) activityScore += 25;
    else if (uniqueUsers.size > 20) activityScore += 20;
    else if (uniqueUsers.size > 10) activityScore += 15;
    else if (uniqueUsers.size > 5) activityScore += 10;

    // Success rate score
    const successfulTx = transactions.filter(tx => tx.tx_status === 'success').length;
    const successRate = successfulTx / transactions.length || 0;

    if (successRate > 0.9) activityScore += 25;
    else if (successRate > 0.7) activityScore += 15;
    else if (successRate > 0.5) activityScore += 10;

    // Activity trend
    const txLast24h = transactions.filter(tx => this.isLast24h(tx.burn_block_time)).length;
    const avgDaily = txLast7d / 7;
    const trend = txLast24h > avgDaily ? 'increasing' : 'decreasing';

    return {
      activityScore: Math.min(activityScore, 100),
      uniqueUsers: uniqueUsers.size,
      successRate: (successRate * 100).toFixed(1) + '%',
      trend,
      averageDailyTx: avgDaily.toFixed(1)
    };
  }

  /**
   * Group events by type
   */
  groupEventsByType(events) {
    const grouped = {};

    events.forEach(event => {
      const type = event.event_type || 'unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Check if timestamp is within last 24 hours
   */
  isLast24h(timestamp) {
    const now = Date.now() / 1000;
    const day24 = now - (24 * 60 * 60);
    return timestamp >= day24;
  }

  /**
   * Check if timestamp is within last 7 days
   */
  isLast7d(timestamp) {
    const now = Date.now() / 1000;
    const day7 = now - (7 * 24 * 60 * 60);
    return timestamp >= day7;
  }
}
