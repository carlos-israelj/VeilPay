import OpenAI from 'openai';

/**
 * AI-powered sentiment analysis using GPT-3.5
 * Analyzes news articles, GitHub activity, and on-chain metrics
 */

export class AISentimentAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate comprehensive sentiment analysis
   */
  async analyzeSentiment(githubData, onChainData, newsData, projectName) {
    try {
      const prompt = this.buildSentimentPrompt(
        githubData,
        onChainData,
        newsData,
        projectName
      );

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a crypto project analyst specializing in sentiment analysis.
Analyze the provided data (GitHub activity, on-chain metrics, news sentiment) and provide a comprehensive sentiment assessment.
Focus on: development health, community engagement, market sentiment, and overall project viability.

Provide concise, actionable insights in JSON format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        aiSentiment: response,
        modelUsed: 'gpt-3.5-turbo',
        tokensUsed: completion.usage.total_tokens,
        costEstimate: this.calculateCost(completion.usage.total_tokens),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI sentiment analysis error:', error.message);

      return {
        aiSentiment: {
          overallSentiment: 'neutral',
          confidence: 'low',
          summary: 'AI analysis unavailable',
          insights: ['Analysis based on raw metrics only']
        },
        error: error.message,
        modelUsed: 'gpt-3.5-turbo',
        tokensUsed: 0,
        costEstimate: 0
      };
    }
  }

  /**
   * Build sentiment analysis prompt
   */
  buildSentimentPrompt(githubData, onChainData, newsData, projectName) {
    // Truncate news articles if too many
    const newsArticles = newsData.articles?.slice(0, 5) || [];

    return `Analyze sentiment for: ${projectName}

GITHUB DEVELOPMENT METRICS:
${githubData.status === 'success' ? `
- Development Score: ${githubData.metrics?.developmentScore || 0}/100
- Activity Level: ${githubData.metrics?.activityLevel || 'Unknown'}
- Commits (30d): ${githubData.metrics?.commitsLast30d || 0}
- Contributors: ${githubData.metrics?.contributorCount || 0}
- Stars: ${githubData.repoData?.stars || 0}
- Forks: ${githubData.repoData?.forks || 0}
- Issue Close Rate: ${githubData.metrics?.issueCloseRate || 'N/A'}
- PR Merge Rate: ${githubData.metrics?.prMergeRate || 'N/A'}
- Last Update: ${githubData.repoData?.updatedAt || 'Unknown'}
` : '- GitHub data unavailable'}

ON-CHAIN METRICS:
${onChainData.status === 'success' ? `
- Activity Score: ${onChainData.metrics?.activityScore || 0}/100
- Unique Users: ${onChainData.metrics?.uniqueUsers || 0}
- Transactions (7d): ${onChainData.transactions?.last7d || 0}
- Success Rate: ${onChainData.metrics?.successRate || 'N/A'}
- Trend: ${onChainData.metrics?.trend || 'Unknown'}
- Average Daily Tx: ${onChainData.metrics?.averageDailyTx || 0}
` : '- On-chain data unavailable'}

NEWS & SOCIAL SENTIMENT:
${newsData.status === 'success' ? `
- Sentiment Score: ${newsData.sentimentAnalysis?.score || 50}/100
- Overall Sentiment: ${newsData.sentimentAnalysis?.sentiment || 'neutral'}
- Confidence: ${newsData.sentimentAnalysis?.confidence || 'low'}
- Articles Analyzed: ${newsData.sentimentAnalysis?.articlesAnalyzed || 0}

Recent Headlines:
${newsArticles.map(a => `- [${a.sentiment}] ${a.title} (${a.votes?.total || 0} votes)`).join('\n')}
` : '- News data unavailable'}

Please provide:
1. Overall sentiment assessment (bullish/neutral/bearish)
2. Confidence level (high/medium/low)
3. Key positive signals
4. Key risk factors
5. Development health assessment
6. Community engagement assessment
7. Market sentiment assessment
8. Investment recommendation (strong buy/buy/hold/sell/strong sell)
9. Top 3 actionable insights

Response format (JSON):
{
  "overallSentiment": "bullish|neutral|bearish",
  "confidence": "high|medium|low",
  "sentimentScore": 0-100,
  "positiveSignals": ["Signal 1", "Signal 2", ...],
  "riskFactors": ["Risk 1", "Risk 2", ...],
  "developmentHealth": "excellent|good|fair|poor",
  "communityEngagement": "excellent|good|fair|poor",
  "marketSentiment": "very positive|positive|neutral|negative|very negative",
  "recommendation": {
    "action": "strong buy|buy|hold|sell|strong sell",
    "rationale": "Brief explanation",
    "timeHorizon": "short-term|medium-term|long-term"
  },
  "topInsights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ],
  "summary": "2-3 sentence overall assessment"
}`;
  }

  /**
   * Calculate cost estimate for OpenAI API usage
   */
  calculateCost(totalTokens) {
    const inputTokens = totalTokens * 0.75;
    const outputTokens = totalTokens * 0.25;

    const inputCost = (inputTokens / 1000) * 0.0015;
    const outputCost = (outputTokens / 1000) * 0.002;

    return (inputCost + outputCost).toFixed(6);
  }

  /**
   * Generate executive summary combining all data sources
   */
  generateExecutiveSummary(githubData, onChainData, newsData, aiSentiment) {
    const developmentScore = githubData.metrics?.developmentScore || 0;
    const activityScore = onChainData.metrics?.activityScore || 0;
    const sentimentScore = newsData.sentimentAnalysis?.score || 50;
    const aiScore = aiSentiment.aiSentiment?.sentimentScore || 50;

    // Weighted average: 30% dev, 30% activity, 20% news, 20% AI
    const overallScore = Math.round(
      (developmentScore * 0.3) +
      (activityScore * 0.3) +
      (sentimentScore * 0.2) +
      (aiScore * 0.2)
    );

    // Determine overall health
    let overallHealth;
    if (overallScore >= 80) overallHealth = 'Excellent';
    else if (overallScore >= 65) overallHealth = 'Good';
    else if (overallScore >= 50) overallHealth = 'Fair';
    else if (overallScore >= 35) overallHealth = 'Poor';
    else overallHealth = 'Critical';

    return {
      overallScore,
      overallHealth,
      breakdown: {
        development: {
          score: developmentScore,
          level: githubData.metrics?.activityLevel || 'Unknown',
          status: developmentScore >= 60 ? 'Healthy' : 'Needs Attention'
        },
        onChainActivity: {
          score: activityScore,
          trend: onChainData.metrics?.trend || 'Unknown',
          status: activityScore >= 60 ? 'Active' : 'Low Activity'
        },
        marketSentiment: {
          score: sentimentScore,
          sentiment: newsData.sentimentAnalysis?.sentiment || 'neutral',
          confidence: newsData.sentimentAnalysis?.confidence || 'low'
        },
        aiAssessment: {
          score: aiScore,
          sentiment: aiSentiment.aiSentiment?.overallSentiment || 'neutral',
          recommendation: aiSentiment.aiSentiment?.recommendation?.action || 'hold'
        }
      },
      keyHighlights: [
        ...(aiSentiment.aiSentiment?.positiveSignals || []).slice(0, 2),
        ...(githubData.metrics?.activityLevel === 'Very Active' ? ['Very active development'] : []),
        ...(onChainData.metrics?.trend === 'increasing' ? ['Growing on-chain activity'] : [])
      ].slice(0, 3),
      keyRisks: [
        ...(aiSentiment.aiSentiment?.riskFactors || []).slice(0, 2),
        ...(developmentScore < 40 ? ['Low development activity'] : []),
        ...(activityScore < 40 ? ['Low on-chain activity'] : [])
      ].slice(0, 3)
    };
  }
}
