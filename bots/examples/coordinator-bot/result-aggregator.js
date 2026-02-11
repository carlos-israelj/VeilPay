/**
 * Result aggregator for coordinator bot
 * Combines and scores results from Security, Tokenomics, and Sentiment bots
 */

export class ResultAggregator {
  /**
   * Aggregate results from all worker bots
   */
  static aggregate(securityResult, tokenomicsResult, sentimentResult, projectData) {
    // Extract scores from each bot
    const scores = {
      security: this.extractSecurityScore(securityResult),
      tokenomics: this.extractTokenomicsScore(tokenomicsResult),
      sentiment: this.extractSentimentScore(sentimentResult)
    };

    // Calculate weighted overall score
    const overallScore = this.calculateOverallScore(scores);

    // Determine investment recommendation
    const recommendation = this.generateRecommendation(scores, overallScore);

    // Extract key insights
    const keyInsights = this.extractKeyInsights(securityResult, tokenomicsResult, sentimentResult);

    // Extract risks
    const risks = this.extractRisks(securityResult, tokenomicsResult, sentimentResult);

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      projectData,
      scores,
      overallScore,
      recommendation,
      keyInsights,
      risks
    );

    return {
      project: projectData.projectName,
      overallScore,
      scores,
      recommendation,
      keyInsights,
      risks,
      executiveSummary,
      detailedResults: {
        security: securityResult,
        tokenomics: tokenomicsResult,
        sentiment: sentimentResult
      },
      aggregatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract security score (0-100)
   */
  static extractSecurityScore(securityResult) {
    if (securityResult.error) {
      return {
        score: 0,
        level: 'Unknown',
        confidence: 'low',
        error: securityResult.error
      };
    }

    // Security score is inverse of risk score
    const riskScore = securityResult.result?.staticAnalysis?.riskScore || 50;
    const securityScore = 100 - riskScore;

    return {
      score: securityScore,
      level: securityResult.result?.staticAnalysis?.riskLevel || 'Unknown',
      findings: securityResult.result?.staticAnalysis?.findings?.length || 0,
      confidence: securityResult.result?.aiInsights ? 'high' : 'medium'
    };
  }

  /**
   * Extract tokenomics score (0-100)
   */
  static extractTokenomicsScore(tokenomicsResult) {
    if (tokenomicsResult.error) {
      return {
        score: 0,
        health: 'Unknown',
        confidence: 'low',
        error: tokenomicsResult.error
      };
    }

    const overallScore = tokenomicsResult.result?.overallScore || 50;

    return {
      score: overallScore,
      health: tokenomicsResult.result?.tokenMetrics?.metrics?.healthScore || 0,
      liquidity: tokenomicsResult.result?.liquidityData?.liquidityScore || 0,
      confidence: 'medium'
    };
  }

  /**
   * Extract sentiment score (0-100)
   */
  static extractSentimentScore(sentimentResult) {
    if (sentimentResult.error) {
      return {
        score: 50, // Neutral default
        sentiment: 'neutral',
        confidence: 'low',
        error: sentimentResult.error
      };
    }

    const overallScore = sentimentResult.result?.executiveSummary?.overallScore || 50;

    return {
      score: overallScore,
      sentiment: sentimentResult.result?.executiveSummary?.breakdown?.aiAssessment?.sentiment || 'neutral',
      development: sentimentResult.result?.executiveSummary?.breakdown?.development?.score || 0,
      community: sentimentResult.result?.executiveSummary?.breakdown?.marketSentiment?.score || 0,
      confidence: sentimentResult.result?.aiSentiment?.aiSentiment?.confidence || 'medium'
    };
  }

  /**
   * Calculate weighted overall score
   * 40% Security, 30% Tokenomics, 30% Sentiment
   */
  static calculateOverallScore(scores) {
    const weights = {
      security: 0.4,
      tokenomics: 0.3,
      sentiment: 0.3
    };

    const weighted =
      (scores.security.score * weights.security) +
      (scores.tokenomics.score * weights.tokenomics) +
      (scores.sentiment.score * weights.sentiment);

    return Math.round(weighted);
  }

  /**
   * Generate investment recommendation
   */
  static generateRecommendation(scores, overallScore) {
    let action, rationale, timeHorizon;

    // Critical security issues = immediate sell
    if (scores.security.level === 'CRITICAL') {
      action = 'Strong Sell';
      rationale = 'Critical security vulnerabilities detected';
      timeHorizon = 'Immediate';
    }
    // Overall score-based recommendations
    else if (overallScore >= 80) {
      action = 'Strong Buy';
      rationale = 'Excellent fundamentals across security, tokenomics, and sentiment';
      timeHorizon = 'Long-term';
    } else if (overallScore >= 65) {
      action = 'Buy';
      rationale = 'Strong fundamentals with minor concerns';
      timeHorizon = 'Medium-term';
    } else if (overallScore >= 50) {
      action = 'Hold';
      rationale = 'Mixed signals - wait for clearer trend';
      timeHorizon = 'Short-term';
    } else if (overallScore >= 35) {
      action = 'Sell';
      rationale = 'Weak fundamentals - significant risks detected';
      timeHorizon = 'Short-term';
    } else {
      action = 'Strong Sell';
      rationale = 'Poor fundamentals across multiple dimensions';
      timeHorizon = 'Immediate';
    }

    return {
      action,
      rationale,
      timeHorizon,
      confidence: this.calculateConfidence(scores)
    };
  }

  /**
   * Calculate recommendation confidence
   */
  static calculateConfidence(scores) {
    const confidenceLevels = [
      scores.security.confidence,
      scores.tokenomics.confidence,
      scores.sentiment.confidence
    ];

    const highCount = confidenceLevels.filter(c => c === 'high').length;
    const mediumCount = confidenceLevels.filter(c => c === 'medium').length;

    if (highCount >= 2) return 'High';
    if (highCount + mediumCount >= 2) return 'Medium';
    return 'Low';
  }

  /**
   * Extract key insights from all bots
   */
  static extractKeyInsights(securityResult, tokenomicsResult, sentimentResult) {
    const insights = [];

    // Security insights
    if (securityResult.result?.executiveSummary?.priorityActions) {
      const topSecurity = securityResult.result.executiveSummary.priorityActions.slice(0, 2);
      topSecurity.forEach(action => {
        insights.push({
          source: 'Security Bot',
          insight: action.issue || action.action,
          severity: action.severity || action.priority
        });
      });
    }

    // Tokenomics insights
    if (tokenomicsResult.result?.recommendations) {
      const topTokenomics = tokenomicsResult.result.recommendations.slice(0, 1);
      topTokenomics.forEach(rec => {
        insights.push({
          source: 'Tokenomics Bot',
          insight: rec.description || rec.action,
          category: rec.category
        });
      });
    }

    // Sentiment insights
    if (sentimentResult.result?.aiSentiment?.aiSentiment?.topInsights) {
      const topSentiment = sentimentResult.result.aiSentiment.aiSentiment.topInsights.slice(0, 2);
      topSentiment.forEach(insight => {
        insights.push({
          source: 'Sentiment Bot',
          insight,
          type: 'AI Analysis'
        });
      });
    }

    return insights.slice(0, 5); // Top 5 insights
  }

  /**
   * Extract risks from all bots
   */
  static extractRisks(securityResult, tokenomicsResult, sentimentResult) {
    const risks = [];

    // Security risks
    if (securityResult.result?.staticAnalysis?.findings) {
      const criticalFindings = securityResult.result.staticAnalysis.findings
        .filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')
        .slice(0, 2);

      criticalFindings.forEach(finding => {
        risks.push({
          source: 'Security Bot',
          risk: finding.issue,
          severity: finding.severity,
          impact: 'High'
        });
      });
    }

    // Tokenomics risks
    if (tokenomicsResult.result?.tokenMetrics?.metrics?.liquidityAssessment === 'Low') {
      risks.push({
        source: 'Tokenomics Bot',
        risk: 'Low liquidity detected',
        severity: 'MEDIUM',
        impact: 'Medium'
      });
    }

    // Sentiment risks
    if (sentimentResult.result?.executiveSummary?.keyRisks) {
      const topRisks = sentimentResult.result.executiveSummary.keyRisks.slice(0, 2);
      topRisks.forEach(risk => {
        risks.push({
          source: 'Sentiment Bot',
          risk,
          severity: 'MEDIUM',
          impact: 'Medium'
        });
      });
    }

    return risks.slice(0, 5); // Top 5 risks
  }

  /**
   * Generate executive summary
   */
  static generateExecutiveSummary(projectData, scores, overallScore, recommendation, insights, risks) {
    let healthStatus;
    if (overallScore >= 75) healthStatus = 'Excellent';
    else if (overallScore >= 60) healthStatus = 'Good';
    else if (overallScore >= 45) healthStatus = 'Fair';
    else if (overallScore >= 30) healthStatus = 'Poor';
    else healthStatus = 'Critical';

    return {
      project: projectData.projectName,
      overallScore,
      healthStatus,
      recommendation: recommendation.action,
      rationale: recommendation.rationale,
      scoreBreakdown: {
        security: `${scores.security.score}/100 (${scores.security.level})`,
        tokenomics: `${scores.tokenomics.score}/100`,
        sentiment: `${scores.sentiment.score}/100 (${scores.sentiment.sentiment})`
      },
      topInsights: insights.map(i => i.insight).slice(0, 3),
      topRisks: risks.map(r => r.risk).slice(0, 3),
      nextSteps: this.generateNextSteps(recommendation.action, scores),
      analysisConfidence: recommendation.confidence,
      disclaimer: 'This analysis is for informational purposes only. Not financial advice.'
    };
  }

  /**
   * Generate actionable next steps
   */
  static generateNextSteps(action, scores) {
    const steps = [];

    if (action === 'Strong Buy' || action === 'Buy') {
      steps.push('Conduct deeper due diligence on team and roadmap');
      steps.push('Verify smart contract deployment and ownership');
      steps.push('Monitor initial position with small allocation');
    } else if (action === 'Hold') {
      steps.push('Continue monitoring security and development activity');
      steps.push('Wait for clearer market signals');
      steps.push('Re-evaluate in 2-4 weeks');
    } else {
      steps.push('Exit position or avoid investment');
      if (scores.security.level === 'CRITICAL' || scores.security.level === 'HIGH') {
        steps.push('URGENT: Review critical security findings before any action');
      }
      steps.push('Look for alternative opportunities with better fundamentals');
    }

    return steps;
  }
}
