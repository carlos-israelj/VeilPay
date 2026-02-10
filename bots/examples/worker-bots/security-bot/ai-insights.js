import OpenAI from 'openai';

/**
 * AI-powered security insights using GPT-3.5-turbo
 * Provides context-aware security recommendations
 */

export class AISecurityAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate AI-powered security insights for a contract
   */
  async generateInsights(sourceCode, staticAnalysis) {
    try {
      const prompt = this.buildSecurityPrompt(sourceCode, staticAnalysis);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a smart contract security expert specializing in Clarity contracts on Stacks blockchain.
Analyze the provided contract and static analysis results. Focus on:
1. Business logic vulnerabilities
2. Economic attack vectors
3. Clarity-specific issues
4. Best practices violations

Provide concise, actionable insights in JSON format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more focused analysis
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);

      return {
        aiAnalysis: response,
        modelUsed: 'gpt-3.5-turbo',
        tokensUsed: completion.usage.total_tokens,
        costEstimate: this.calculateCost(completion.usage.total_tokens),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI analysis error:', error.message);
      // Return fallback response if AI fails
      return {
        aiAnalysis: {
          summary: 'AI analysis unavailable',
          insights: ['Static analysis completed successfully'],
          recommendations: ['Review static analysis findings']
        },
        error: error.message,
        modelUsed: 'gpt-3.5-turbo',
        tokensUsed: 0,
        costEstimate: 0
      };
    }
  }

  /**
   * Build security analysis prompt
   */
  buildSecurityPrompt(sourceCode, staticAnalysis) {
    // Truncate source code if too long (keep first 2000 chars)
    const truncatedSource = sourceCode.length > 2000
      ? sourceCode.substring(0, 2000) + '\n...[truncated]'
      : sourceCode;

    return `Analyze this Clarity smart contract for security vulnerabilities:

CONTRACT SOURCE CODE:
\`\`\`clarity
${truncatedSource}
\`\`\`

STATIC ANALYSIS RESULTS:
- Risk Score: ${staticAnalysis.riskScore}/100
- Risk Level: ${staticAnalysis.riskLevel}
- Findings: ${staticAnalysis.findings.length} issues detected
- Public Functions: ${staticAnalysis.stats.publicFunctions}
- External Calls: ${staticAnalysis.stats.externalCalls}

KEY FINDINGS:
${staticAnalysis.findings.map(f => `- [${f.severity}] ${f.issue}: ${f.description}`).join('\n')}

Please provide:
1. Overall security assessment
2. Business logic vulnerabilities not caught by static analysis
3. Economic attack vectors (e.g., front-running, manipulation)
4. Clarity-specific best practices
5. Top 3 actionable recommendations

Response format (JSON):
{
  "overallAssessment": "Brief summary of security posture",
  "businessLogicIssues": ["Issue 1", "Issue 2", ...],
  "economicRisks": ["Risk 1", "Risk 2", ...],
  "clarityBestPractices": ["Practice 1", "Practice 2", ...],
  "topRecommendations": [
    {"priority": "HIGH|MEDIUM|LOW", "action": "What to do", "rationale": "Why it matters"},
    ...
  ],
  "securityScore": 0-100 (higher is better)
}`;
  }

  /**
   * Calculate cost estimate for OpenAI API usage
   * GPT-3.5-turbo pricing: $0.0015/1K input tokens, $0.002/1K output tokens
   */
  calculateCost(totalTokens) {
    // Approximate: 75% input, 25% output
    const inputTokens = totalTokens * 0.75;
    const outputTokens = totalTokens * 0.25;

    const inputCost = (inputTokens / 1000) * 0.0015;
    const outputCost = (outputTokens / 1000) * 0.002;

    return (inputCost + outputCost).toFixed(6);
  }

  /**
   * Generate executive summary combining static + AI analysis
   */
  generateExecutiveSummary(staticAnalysis, aiInsights) {
    const { riskLevel, riskScore, findings } = staticAnalysis;
    const { aiAnalysis } = aiInsights;

    const criticalIssues = findings.filter(f => f.severity === 'CRITICAL').length;
    const highIssues = findings.filter(f => f.severity === 'HIGH').length;

    let deploymentRecommendation;
    if (riskLevel === 'CRITICAL' || criticalIssues > 0) {
      deploymentRecommendation = 'DO NOT DEPLOY - Critical vulnerabilities must be fixed';
    } else if (riskLevel === 'HIGH' || highIssues > 2) {
      deploymentRecommendation = 'CAUTION - Fix high-severity issues before deployment';
    } else if (riskLevel === 'MEDIUM') {
      deploymentRecommendation = 'REVIEW - Consider fixes before mainnet deployment';
    } else {
      deploymentRecommendation = 'ACCEPTABLE - Professional audit recommended for mainnet';
    }

    return {
      contractSecurity: {
        riskScore: riskScore,
        riskLevel: riskLevel,
        aiSecurityScore: aiAnalysis.securityScore || 'N/A',
        deploymentRecommendation
      },
      keyFindings: {
        critical: criticalIssues,
        high: highIssues,
        medium: findings.filter(f => f.severity === 'MEDIUM').length,
        low: findings.filter(f => f.severity === 'LOW').length
      },
      priorityActions: [
        ...findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')
          .slice(0, 3)
          .map(f => ({
            severity: f.severity,
            issue: f.issue,
            recommendation: f.recommendation
          })),
        ...(aiAnalysis.topRecommendations || []).slice(0, 2)
      ],
      aiInsights: {
        overallAssessment: aiAnalysis.overallAssessment,
        businessLogicIssues: aiAnalysis.businessLogicIssues || [],
        economicRisks: aiAnalysis.economicRisks || []
      }
    };
  }
}
