import axios from 'axios';

/**
 * News and social sentiment fetcher
 * Aggregates news from CryptoPanic and analyzes sentiment
 */

export class NewsFetcher {
  constructor() {
    this.cryptoPanicApi = 'https://cryptopanic.com/api/v1';
  }

  /**
   * Fetch recent news about a project/token
   */
  async fetchNews(projectName, tokenSymbol) {
    try {
      console.log(`  → Fetching news: ${projectName} / ${tokenSymbol}`);

      // Try multiple search strategies
      const newsResults = await Promise.allSettled([
        this.searchCryptoPanic(tokenSymbol),
        this.searchCryptoPanic(projectName),
        this.getStacksNews() // General Stacks ecosystem news
      ]);

      // Combine results
      const allNews = [];
      newsResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.articles) {
          allNews.push(...result.value.articles);
        }
      });

      // Remove duplicates
      const uniqueNews = this.removeDuplicates(allNews);

      // Analyze sentiment
      const sentimentAnalysis = this.analyzeSentiment(uniqueNews);

      return {
        status: 'success',
        projectName,
        tokenSymbol,
        articles: uniqueNews.slice(0, 10), // Top 10 most relevant
        totalArticles: uniqueNews.length,
        sentimentAnalysis,
        sources: ['CryptoPanic', 'Stacks News'],
        fetchedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('News fetch error:', error.message);
      return {
        status: 'partial',
        error: error.message,
        articles: [],
        sentimentAnalysis: {
          score: 50,
          sentiment: 'neutral',
          confidence: 'low'
        }
      };
    }
  }

  /**
   * Search CryptoPanic for news
   * Note: Free tier is limited - may need API key for production
   */
  async searchCryptoPanic(query) {
    try {
      // CryptoPanic free API (limited to public posts)
      const url = `${this.cryptoPanicApi}/posts/?public=true&filter=hot`;

      const response = await axios.get(url, { timeout: 5000 });

      if (!response.data.results) {
        return { articles: [] };
      }

      // Filter results by query
      const filtered = response.data.results.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(query.toLowerCase());
        const currenciesMatch = post.currencies?.some(c =>
          c.code.toLowerCase() === query.toLowerCase() ||
          c.title.toLowerCase().includes(query.toLowerCase())
        );
        return titleMatch || currenciesMatch;
      });

      const articles = filtered.map(post => ({
        title: post.title,
        url: post.url,
        publishedAt: post.published_at,
        source: post.source?.title || 'Unknown',
        votes: {
          positive: post.votes?.positive || 0,
          negative: post.votes?.negative || 0,
          total: (post.votes?.positive || 0) + (post.votes?.negative || 0)
        },
        sentiment: this.calculateArticleSentiment(post.votes)
      }));

      return { articles };

    } catch (error) {
      console.warn('CryptoPanic search error:', error.message);
      return { articles: [] };
    }
  }

  /**
   * Get general Stacks ecosystem news
   */
  async getStacksNews() {
    try {
      // Search for Stacks-related news
      const url = `${this.cryptoPanicApi}/posts/?public=true&currencies=STX&filter=hot`;

      const response = await axios.get(url, { timeout: 5000 });

      if (!response.data.results) {
        return { articles: [] };
      }

      const articles = response.data.results.slice(0, 5).map(post => ({
        title: post.title,
        url: post.url,
        publishedAt: post.published_at,
        source: post.source?.title || 'Unknown',
        votes: {
          positive: post.votes?.positive || 0,
          negative: post.votes?.negative || 0,
          total: (post.votes?.positive || 0) + (post.votes?.negative || 0)
        },
        sentiment: this.calculateArticleSentiment(post.votes),
        tags: ['Stacks', 'Ecosystem']
      }));

      return { articles };

    } catch (error) {
      console.warn('Stacks news error:', error.message);
      return { articles: [] };
    }
  }

  /**
   * Calculate sentiment from article votes
   */
  calculateArticleSentiment(votes) {
    if (!votes || votes.total === 0) {
      return 'neutral';
    }

    const positiveRatio = votes.positive / votes.total;

    if (positiveRatio > 0.7) return 'very positive';
    if (positiveRatio > 0.6) return 'positive';
    if (positiveRatio > 0.4) return 'neutral';
    if (positiveRatio > 0.3) return 'negative';
    return 'very negative';
  }

  /**
   * Analyze overall sentiment from news articles
   */
  analyzeSentiment(articles) {
    if (articles.length === 0) {
      return {
        score: 50,
        sentiment: 'neutral',
        confidence: 'low',
        reason: 'No news articles found'
      };
    }

    // Calculate weighted sentiment score
    let totalScore = 0;
    let totalWeight = 0;

    articles.forEach(article => {
      const weight = Math.max(article.votes?.total || 1, 1);
      let score = 50; // Neutral baseline

      switch (article.sentiment) {
        case 'very positive':
          score = 90;
          break;
        case 'positive':
          score = 70;
          break;
        case 'neutral':
          score = 50;
          break;
        case 'negative':
          score = 30;
          break;
        case 'very negative':
          score = 10;
          break;
      }

      totalScore += score * weight;
      totalWeight += weight;
    });

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 50;

    // Determine sentiment category
    let sentiment;
    if (averageScore > 70) sentiment = 'very positive';
    else if (averageScore > 60) sentiment = 'positive';
    else if (averageScore > 40) sentiment = 'neutral';
    else if (averageScore > 30) sentiment = 'negative';
    else sentiment = 'very negative';

    // Confidence based on article count and vote totals
    let confidence;
    if (articles.length > 10 && totalWeight > 50) confidence = 'high';
    else if (articles.length > 5 && totalWeight > 20) confidence = 'medium';
    else confidence = 'low';

    return {
      score: Math.round(averageScore),
      sentiment,
      confidence,
      articlesAnalyzed: articles.length,
      totalVotes: totalWeight
    };
  }

  /**
   * Remove duplicate articles
   */
  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.url || article.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get trending topics (bonus feature)
   */
  async getTrendingTopics() {
    try {
      const url = `${this.cryptoPanicApi}/posts/?public=true&filter=trending`;
      const response = await axios.get(url, { timeout: 5000 });

      if (!response.data.results) {
        return [];
      }

      return response.data.results.slice(0, 5).map(post => ({
        title: post.title,
        url: post.url,
        votes: post.votes?.total || 0
      }));

    } catch (error) {
      console.warn('Trending topics error:', error.message);
      return [];
    }
  }
}
