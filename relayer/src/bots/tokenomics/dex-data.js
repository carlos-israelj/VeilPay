import axios from 'axios';

/**
 * DEX liquidity and price data fetcher
 * Integrates with DexScreener, Coingecko, and Stacks DEXs
 */

export class DEXDataFetcher {
  constructor() {
    this.dexScreenerApi = 'https://api.dexscreener.com/latest';
    this.coingeckoApi = 'https://api.coingecko.com/api/v3';
  }

  /**
   * Get comprehensive DEX liquidity data
   */
  async getLiquidityData(tokenContract, tokenSymbol) {
    try {
      const [dexScreenerData, stacksDexData] = await Promise.all([
        this.getDexScreenerData(tokenSymbol),
        this.getStacksDexData(tokenContract)
      ]);

      const liquidityScore = this.calculateLiquidityScore(dexScreenerData, stacksDexData);

      return {
        status: 'success',
        tokenContract,
        tokenSymbol,
        dexScreenerData,
        stacksDexData,
        liquidityScore,
        fetchedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Liquidity data error:', error.message);
      return {
        status: 'partial',
        error: error.message,
        tokenContract,
        liquidityScore: 0
      };
    }
  }

  /**
   * Fetch data from DexScreener (cross-chain DEX aggregator)
   */
  async getDexScreenerData(tokenSymbol) {
    try {
      // Search for token by symbol
      const searchUrl = `${this.dexScreenerApi}/dex/search?q=${tokenSymbol}`;
      const response = await axios.get(searchUrl, { timeout: 5000 });

      if (!response.data.pairs || response.data.pairs.length === 0) {
        return {
          found: false,
          message: 'Token not found on DexScreener'
        };
      }

      // Get first matching pair (or filter by chain if needed)
      const pair = response.data.pairs[0];

      return {
        found: true,
        pair: {
          dex: pair.dexId,
          pairAddress: pair.pairAddress,
          baseToken: pair.baseToken.symbol,
          quoteToken: pair.quoteToken.symbol,
          priceUsd: pair.priceUsd,
          liquidity: {
            usd: pair.liquidity?.usd || 0,
            base: pair.liquidity?.base || 0,
            quote: pair.liquidity?.quote || 0
          },
          volume24h: pair.volume?.h24 || 0,
          priceChange24h: pair.priceChange?.h24 || 0,
          txns24h: pair.txns?.h24?.buys + pair.txns?.h24?.sells || 0
        }
      };

    } catch (error) {
      console.warn('DexScreener fetch failed:', error.message);
      return {
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch data from Stacks DEXs (ALEX, Velar, etc.)
   */
  async getStacksDexData(tokenContract) {
    try {
      // For now, this is a placeholder
      // In production, you would integrate with:
      // - ALEX API: https://api.alexlab.co
      // - Velar API: https://api.velar.co
      // - Arkadiko API: https://api.arkadiko.finance

      // Example: Check if token has liquidity pools
      const pools = await this.checkLiquidityPools(tokenContract);

      return {
        found: pools.length > 0,
        pools: pools.length,
        totalLiquidityUSD: pools.reduce((sum, p) => sum + (p.liquidityUSD || 0), 0),
        dexes: pools.map(p => p.dex)
      };

    } catch (error) {
      console.warn('Stacks DEX fetch failed:', error.message);
      return {
        found: false,
        pools: 0,
        error: error.message
      };
    }
  }

  /**
   * Check liquidity pools for token (placeholder)
   */
  async checkLiquidityPools(tokenContract) {
    // This is a placeholder - in production, query actual DEX contracts
    // For now, return empty array
    return [];
  }

  /**
   * Calculate liquidity score (0-100)
   */
  calculateLiquidityScore(dexScreenerData, stacksDexData) {
    let score = 0;

    // DexScreener liquidity score
    if (dexScreenerData.found) {
      const liquidityUSD = dexScreenerData.pair?.liquidity?.usd || 0;

      if (liquidityUSD > 1000000) score += 50; // > $1M
      else if (liquidityUSD > 500000) score += 40; // > $500K
      else if (liquidityUSD > 100000) score += 30; // > $100K
      else if (liquidityUSD > 50000) score += 20; // > $50K
      else if (liquidityUSD > 10000) score += 10; // > $10K

      // Volume score
      const volume24h = dexScreenerData.pair?.volume24h || 0;
      if (volume24h > 100000) score += 30; // > $100K daily volume
      else if (volume24h > 50000) score += 20;
      else if (volume24h > 10000) score += 10;

      // Transaction count score
      const txns24h = dexScreenerData.pair?.txns24h || 0;
      if (txns24h > 1000) score += 20;
      else if (txns24h > 100) score += 10;
      else if (txns24h > 10) score += 5;
    }

    // Stacks DEX score
    if (stacksDexData.found) {
      score += 10; // Bonus for Stacks native liquidity
      if (stacksDexData.pools > 2) score += 10; // Multiple pools = better liquidity
    }

    return Math.min(score, 100);
  }

  /**
   * Get price from Coingecko (fallback)
   */
  async getCoingeckoPrice(tokenId) {
    try {
      const url = `${this.coingeckoApi}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`;
      const response = await axios.get(url, { timeout: 5000 });

      if (!response.data[tokenId]) {
        return { found: false };
      }

      return {
        found: true,
        priceUsd: response.data[tokenId].usd,
        priceChange24h: response.data[tokenId].usd_24h_change
      };

    } catch (error) {
      console.warn('Coingecko fetch failed:', error.message);
      return { found: false, error: error.message };
    }
  }

  /**
   * Generate liquidity recommendations
   */
  generateLiquidityRecommendations(liquidityScore, dexData) {
    const recommendations = [];

    if (liquidityScore < 20) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Very low liquidity',
        recommendation: 'Token has minimal liquidity. High price impact and slippage risk.',
        action: 'Add liquidity to DEXs or wait for more market depth'
      });
    } else if (liquidityScore < 50) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Low liquidity',
        recommendation: 'Limited liquidity may cause significant slippage on larger trades',
        action: 'Trade with caution, use limit orders'
      });
    } else if (liquidityScore < 70) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Moderate liquidity',
        recommendation: 'Reasonable liquidity for small to medium trades',
        action: 'Monitor price impact before large transactions'
      });
    } else {
      recommendations.push({
        priority: 'LOW',
        issue: 'Good liquidity',
        recommendation: 'Sufficient liquidity for most trading activities',
        action: 'Normal trading precautions apply'
      });
    }

    // Cross-DEX recommendations
    if (dexData.dexScreenerData?.found && dexData.stacksDexData?.found) {
      recommendations.push({
        priority: 'INFO',
        issue: 'Multi-chain liquidity',
        recommendation: 'Token has liquidity on multiple chains/DEXs',
        action: 'Compare prices across DEXs for best execution'
      });
    }

    return recommendations;
  }
}
