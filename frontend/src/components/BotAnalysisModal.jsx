import { useState } from 'react';
import { createStandardX402Client } from '../utils/x402-client';

/**
 * BotAnalysisModal - Modal for bot analysis input and execution
 * Maintains cryptographic noir aesthetic
 */

export default function BotAnalysisModal({ bot, userSession, onClose }) {
  const [formData, setFormData] = useState({
    projectName: '',
    contractAddress: '',
    contractName: '',
    tokenSymbol: '',
    githubUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is signed in
      if (!userSession?.isUserSignedIn()) {
        throw new Error('Please connect your wallet to hire bots');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Build request payload based on bot type
      let payload = {};

      if (bot.id === 'security') {
        if (!formData.contractAddress || !formData.contractName) {
          throw new Error('Contract address and name required for security audit');
        }
        payload = {
          contractAddress: formData.contractAddress,
          contractName: formData.contractName,
          fullAnalysis: true
        };
      } else if (bot.id === 'tokenomics') {
        if (!formData.contractAddress || !formData.contractName) {
          throw new Error('Contract address and name required for tokenomics analysis');
        }
        payload = {
          tokenContract: `${formData.contractAddress}.${formData.contractName}`,
          tokenSymbol: formData.tokenSymbol || undefined
        };
      } else if (bot.id === 'sentiment') {
        if (!formData.projectName) {
          throw new Error('Project name required for sentiment analysis');
        }
        payload = {
          projectName: formData.projectName,
          githubUrl: formData.githubUrl || undefined,
          contractAddress: formData.contractAddress || undefined,
          contractName: formData.contractName || undefined,
          tokenSymbol: formData.tokenSymbol || undefined
        };
      } else if (bot.id === 'coordinator') {
        if (!formData.projectName || !formData.contractAddress || !formData.contractName) {
          throw new Error('Project name, contract address, and contract name required');
        }
        payload = {
          projectName: formData.projectName,
          contractAddress: formData.contractAddress,
          contractName: formData.contractName,
          tokenSymbol: formData.tokenSymbol || undefined,
          githubUrl: formData.githubUrl || undefined
        };
      }

      console.log(`Calling bot endpoint: ${bot.endpoint}`);

      // Create x402 client with automatic payment handling
      const client = createStandardX402Client(userSession);

      const response = await client.post(bot.endpoint, payload, {
        timeout: 120000 // 2 minute timeout for coordinator bot
      });

      setResult(response.data);

    } catch (err) {
      console.error('Bot analysis error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="crypto-box-accent max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center crypto-box border-[#00ff88]/30 hover:border-[#00ff88] hover:bg-[#00ff88]/10 transition-all z-10"
        >
          <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{bot.id === 'security' ? '🛡️' : bot.id === 'tokenomics' ? '📊' : bot.id === 'sentiment' ? '💭' : '🤖'}</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {bot.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[#00ff88] text-sm font-mono">
              <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse"></div>
              {bot.estimatedTime}
            </div>
          </div>

          {!result ? (
            <>
              {/* Input Form */}
              <div className="space-y-4 mb-6">
                {/* Project Name (for sentiment & coordinator) */}
                {(bot.id === 'sentiment' || bot.id === 'coordinator') && (
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                      Project_Name *
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="VeilPay"
                      className="w-full crypto-box bg-black/50 border-[#00ff88]/30 text-white font-mono text-sm px-4 py-3 focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Contract Address */}
                {(bot.id === 'security' || bot.id === 'tokenomics' || bot.id === 'coordinator') && (
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                      Contract_Address *
                    </label>
                    <input
                      type="text"
                      value={formData.contractAddress}
                      onChange={(e) => handleInputChange('contractAddress', e.target.value)}
                      placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                      className="w-full crypto-box bg-black/50 border-[#00ff88]/30 text-white font-mono text-xs px-4 py-3 focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Contract Name */}
                {(bot.id === 'security' || bot.id === 'tokenomics' || bot.id === 'coordinator') && (
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                      Contract_Name *
                    </label>
                    <input
                      type="text"
                      value={formData.contractName}
                      onChange={(e) => handleInputChange('contractName', e.target.value)}
                      placeholder="veilpay"
                      className="w-full crypto-box bg-black/50 border-[#00ff88]/30 text-white font-mono text-sm px-4 py-3 focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Token Symbol (optional) */}
                {(bot.id === 'tokenomics' || bot.id === 'sentiment' || bot.id === 'coordinator') && (
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                      Token_Symbol (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                      placeholder="STX"
                      className="w-full crypto-box bg-black/50 border-[#00ff88]/30 text-white font-mono text-sm px-4 py-3 focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* GitHub URL (optional for sentiment) */}
                {(bot.id === 'sentiment' || bot.id === 'coordinator') && (
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">
                      GitHub_URL (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/carlos-israelj/VeilPay"
                      className="w-full crypto-box bg-black/50 border-[#00ff88]/30 text-white font-mono text-xs px-4 py-3 focus:border-[#00ff88] focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="crypto-box border-red-500/50 bg-red-500/10 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">❌</div>
                    <div>
                      <div className="text-red-500 font-mono text-sm font-bold mb-1">
                        ERROR
                      </div>
                      <div className="text-red-400 text-xs font-mono">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price & Payment Info */}
              <div className="crypto-box p-4 mb-6 border-[#00ff88]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-gray-500 uppercase mb-1">Total_Cost</div>
                    <div className="text-2xl font-black text-[#00ff88]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {bot.pricing.STX}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-gray-500 uppercase mb-1">Payment_Method</div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#00ff88]">
                      <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full"></div>
                      VeilPay_ZK_Proof
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 px-6 crypto-box-accent border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black font-mono text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                    <span>ANALYZING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>START_ANALYSIS</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
            </>
          ) : (
            <BotAnalysisResult result={result} bot={bot} onReset={() => setResult(null)} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * BotAnalysisResult - Displays analysis results
 */
function BotAnalysisResult({ result, bot, onReset }) {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="crypto-box border-[#00ff88] bg-[#00ff88]/5 p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <div className="text-[#00ff88] font-mono text-sm font-bold">
              ANALYSIS_COMPLETE
            </div>
            <div className="text-gray-400 text-xs font-mono mt-1">
              {new Date(result.completedAt || result.audit?.completedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Result Content */}
      <div className="crypto-box p-6 bg-black/30">
        <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full py-3 px-4 crypto-box border-gray-600 text-gray-400 hover:border-[#00ff88] hover:text-[#00ff88] font-mono text-sm transition-all"
      >
        RUN_NEW_ANALYSIS
      </button>
    </div>
  );
}
