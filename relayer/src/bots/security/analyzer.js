import axios from 'axios';

/**
 * Static security analysis for Clarity smart contracts
 * Performs pattern matching for common vulnerabilities
 */

export async function analyzeContract(contractAddress, contractName, stacksApi) {
  try {
    // Fetch contract source code
    const sourceUrl = `${stacksApi}/v2/contracts/source/${contractAddress}/${contractName}`;
    const response = await axios.get(sourceUrl);
    const sourceCode = response.data.source;

    // Perform static analysis
    const findings = [];
    let riskScore = 0;

    // 1. Check for unchecked arithmetic (overflow/underflow)
    if (sourceCode.match(/\([\+\-\*]\s+[^\)]+\)/g)) {
      const arithmeticOps = sourceCode.match(/\([\+\-\*]\s+[^\)]+\)/g).length;
      const hasChecks = sourceCode.includes('asserts!') || sourceCode.includes('try!');

      if (!hasChecks && arithmeticOps > 5) {
        findings.push({
          severity: 'HIGH',
          category: 'Arithmetic',
          issue: 'Unchecked arithmetic operations detected',
          description: `Found ${arithmeticOps} arithmetic operations without explicit overflow checks`,
          recommendation: 'Use asserts! or try! to validate arithmetic results'
        });
        riskScore += 30;
      }
    }

    // 2. Check for reentrancy vulnerabilities (contract-call before state update)
    const contractCallPattern = /\(contract-call\?[\s\S]*?\)/g;
    const contractCalls = sourceCode.match(contractCallPattern) || [];

    if (contractCalls.length > 0) {
      // Simple heuristic: if contract-call appears before map-set/var-set
      const hasReentrancyRisk = contractCalls.some(call => {
        const callIndex = sourceCode.indexOf(call);
        const afterCall = sourceCode.substring(callIndex);
        const nextStateChange = afterCall.search(/\((map-set|var-set)/);
        return nextStateChange > 0; // State change after external call
      });

      if (hasReentrancyRisk) {
        findings.push({
          severity: 'CRITICAL',
          category: 'Reentrancy',
          issue: 'Potential reentrancy vulnerability',
          description: 'External contract calls before state updates detected',
          recommendation: 'Update state BEFORE making external calls (checks-effects-interactions pattern)'
        });
        riskScore += 50;
      }
    }

    // 3. Check for access control issues
    const publicFunctions = sourceCode.match(/\(define-public\s+\(([^\s]+)/g) || [];
    const adminChecks = sourceCode.match(/\(is-eq\s+tx-sender\s+contract-owner\)/g) || [];

    if (publicFunctions.length > 5 && adminChecks.length === 0) {
      findings.push({
        severity: 'MEDIUM',
        category: 'Access Control',
        issue: 'Missing admin/owner checks',
        description: `Contract has ${publicFunctions.length} public functions but no tx-sender validation`,
        recommendation: 'Implement role-based access control for sensitive functions'
      });
      riskScore += 20;
    }

    // 4. Check for unchecked external calls
    const hasErrorHandling = sourceCode.includes('unwrap!') || sourceCode.includes('match');
    if (contractCalls.length > 0 && !hasErrorHandling) {
      findings.push({
        severity: 'HIGH',
        category: 'Error Handling',
        issue: 'External calls without error handling',
        description: 'Contract-call? results should be validated',
        recommendation: 'Use unwrap! or match to handle potential failures'
      });
      riskScore += 25;
    }

    // 5. Check for hardcoded addresses (potential centralization)
    const hardcodedAddresses = sourceCode.match(/ST[A-Z0-9]{38,41}/g) || [];
    if (hardcodedAddresses.length > 2) {
      findings.push({
        severity: 'LOW',
        category: 'Centralization',
        issue: 'Multiple hardcoded addresses detected',
        description: `Found ${hardcodedAddresses.length} hardcoded Stacks addresses`,
        recommendation: 'Consider using configurable parameters instead of hardcoded values'
      });
      riskScore += 10;
    }

    // 6. Check for missing input validation
    const assertCount = (sourceCode.match(/asserts!/g) || []).length;
    const functionCount = publicFunctions.length;

    if (functionCount > 3 && assertCount < functionCount) {
      findings.push({
        severity: 'MEDIUM',
        category: 'Input Validation',
        issue: 'Insufficient input validation',
        description: `Only ${assertCount} assertions for ${functionCount} public functions`,
        recommendation: 'Add asserts! to validate all user inputs'
      });
      riskScore += 15;
    }

    // 7. Check for SIP-010 token transfer issues
    if (sourceCode.includes('ft-transfer?') || sourceCode.includes('contract-call? .')) {
      const hasBalanceChecks = sourceCode.includes('ft-get-balance') || sourceCode.includes('get-balance');
      if (!hasBalanceChecks) {
        findings.push({
          severity: 'MEDIUM',
          category: 'Token Transfer',
          issue: 'Token transfers without balance validation',
          description: 'Transfers should verify sufficient balance before execution',
          recommendation: 'Check token balance before ft-transfer? calls'
        });
        riskScore += 15;
      }
    }

    // Calculate final risk level
    let riskLevel;
    if (riskScore >= 70) riskLevel = 'CRITICAL';
    else if (riskScore >= 40) riskLevel = 'HIGH';
    else if (riskScore >= 20) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    return {
      contractAddress,
      contractName,
      riskScore,
      riskLevel,
      findings,
      stats: {
        linesOfCode: sourceCode.split('\n').length,
        publicFunctions: publicFunctions.length,
        externalCalls: contractCalls.length,
        assertions: assertCount
      },
      analyzedAt: new Date().toISOString()
    };

  } catch (error) {
    throw new Error(`Failed to analyze contract: ${error.message}`);
  }
}

/**
 * Generate security recommendations based on findings
 */
export function generateRecommendations(analysisResult) {
  const { riskLevel, findings } = analysisResult;

  const recommendations = [];

  // Priority recommendations based on severity
  const critical = findings.filter(f => f.severity === 'CRITICAL');
  const high = findings.filter(f => f.severity === 'HIGH');
  const medium = findings.filter(f => f.severity === 'MEDIUM');

  if (critical.length > 0) {
    recommendations.push({
      priority: 'IMMEDIATE',
      action: 'Fix critical vulnerabilities before deployment',
      issues: critical.map(f => f.issue)
    });
  }

  if (high.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Address high-severity issues',
      issues: high.map(f => f.issue)
    });
  }

  if (medium.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Improve security posture',
      issues: medium.map(f => f.issue)
    });
  }

  // General best practices
  if (riskLevel === 'LOW') {
    recommendations.push({
      priority: 'LOW',
      action: 'Consider professional audit before mainnet deployment',
      issues: []
    });
  }

  return recommendations;
}
