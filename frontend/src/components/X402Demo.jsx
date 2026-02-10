import { useState } from 'react';
import { createStandardX402Client, createPrivateX402Client } from '../utils/x402-client';

/**
 * X402Demo - Demonstrates automated HTTP 402 payments with VeilPay privacy
 * Shows both standard (public) and private (ZK proof) payment modes
 */

const DEMO_ENDPOINTS = [
  {
    id: 'demo',
    name: 'BASIC_CONTENT',
    path: '/x402/demo',
    method: 'GET',
    asset: 'STX',
    amount: '1 STX',
    description: 'Access demo content with STX payment',
    icon: '₿',
    color: '#FF8C00',
  },
  {
    id: 'content',
    name: 'PREMIUM_CONTENT',
    path: '/x402/content/premium-001',
    method: 'GET',
    asset: 'USDCx',
    amount: '5 USDCx',
    description: 'Premium content requiring USDCx',
    icon: '$',
    color: '#2775CA',
  },
  {
    id: 'execute',
    name: 'API_EXECUTION',
    path: '/x402/api/execute',
    method: 'POST',
    asset: 'sBTC',
    amount: '0.0001 BTC',
    description: 'Execute paid API operation with sBTC',
    icon: '฿',
    color: '#F7931A',
    body: {
      operation: 'compute',
      params: { query: 'AI agent automated payment test' },
    },
  },
];

export default function X402Demo({ userSession }) {
  const [activeMode, setActiveMode] = useState('private'); // 'private' or 'standard'
  const [activeEndpoint, setActiveEndpoint] = useState('demo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Private payment credentials
  const [secret, setSecret] = useState('');
  const [nonce, setNonce] = useState('');

  const handleTestEndpoint = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`[X402Demo] Testing ${endpoint.name} in ${activeMode} mode...`);

      let client;

      if (activeMode === 'private') {
        // Private payment with ZK proofs
        if (!secret || !nonce) {
          throw new Error('Please enter secret and nonce for private payments');
        }

        client = createPrivateX402Client(secret, nonce, endpoint.asset);
      } else {
        // Standard x402 payment
        client = createStandardX402Client();
      }

      // Make request (will automatically handle 402)
      let response;
      if (endpoint.method === 'POST') {
        response = await client.post(endpoint.path, endpoint.body || {});
      } else {
        response = await client.get(endpoint.path);
      }

      console.log('[X402Demo] Success:', response.data);

      setResult({
        success: true,
        endpoint: endpoint.name,
        mode: activeMode,
        data: response.data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[X402Demo] Error:', err);

      setError({
        message: err.response?.data?.error || err.message,
        details: err.response?.data?.details || 'Payment or proof generation failed',
        endpoint: endpoint.name,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentEndpoint = DEMO_ENDPOINTS.find((e) => e.id === activeEndpoint);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Header */}
      <div className="crypto-box-accent p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              X402_PROTOCOL_DEMO
            </h1>
            <div className="flex items-center gap-2 text-[#00ff88] text-[10px] sm:text-xs font-mono">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              AI_AGENT_PAYMENTS
            </div>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-4 font-mono leading-relaxed">
            Demonstrates automated HTTP 402 "Payment Required" handling with VeilPay privacy.
            AI agents can make anonymous payments without revealing transaction graphs.
          </p>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Private Mode */}
            <button
              onClick={() => setActiveMode('private')}
              className={`relative p-4 sm:p-5 transition-all group/card ${
                activeMode === 'private'
                  ? 'crypto-box-accent border-2 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                  : 'crypto-box border hover:border-[#00ff88]/40'
              }`}
            >
              <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)] group-hover/card:opacity-10 transition-opacity"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 border-2 flex items-center justify-center text-xl ${
                    activeMode === 'private' ? 'border-[#00ff88] text-[#00ff88]' : 'border-gray-600 text-gray-600'
                  }`}>
                    🔐
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold text-sm sm:text-base font-mono ${
                      activeMode === 'private' ? 'text-[#00ff88]' : 'text-white'
                    }`}>
                      PRIVATE_MODE
                    </div>
                    <div className="text-gray-500 text-[10px] font-mono">ZK-PROOF PAYMENT</div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">
                  Fully anonymous payments using zero-knowledge proofs. Vendor cannot see payer identity.
                </p>
              </div>
            </button>

            {/* Standard Mode */}
            <button
              onClick={() => setActiveMode('standard')}
              className={`relative p-4 sm:p-5 transition-all group/card ${
                activeMode === 'standard'
                  ? 'crypto-box-accent border-2 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                  : 'crypto-box border hover:border-[#00ff88]/40'
              }`}
            >
              <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)] group-hover/card:opacity-10 transition-opacity"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 border-2 flex items-center justify-center text-xl ${
                    activeMode === 'standard' ? 'border-[#00ff88] text-[#00ff88]' : 'border-gray-600 text-gray-600'
                  }`}>
                    💳
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold text-sm sm:text-base font-mono ${
                      activeMode === 'standard' ? 'text-[#00ff88]' : 'text-white'
                    }`}>
                      STANDARD_MODE
                    </div>
                    <div className="text-gray-500 text-[10px] font-mono">DIRECT PAYMENT</div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">
                  Standard x402 payment flow. Fast and simple, but public on-chain.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Private Mode Credentials */}
      {activeMode === 'private' && (
        <div className="crypto-box p-4 sm:p-5 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#00ff88_2px,#00ff88_3px)]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
                <span className="text-[#00ff88] font-bold text-sm">🔑</span>
              </div>
              <h3 className="text-[#00ff88] font-bold text-sm sm:text-base font-mono">
                PRIVATE_PAYMENT_CREDENTIALS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="crypto-label block mb-2 text-[10px]">SECRET_KEY</label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret from deposit..."
                  className="crypto-input w-full text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="crypto-label block mb-2 text-[10px]">NONCE_VALUE</label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="Enter nonce from deposit..."
                  className="crypto-input w-full text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#00ff88]/10">
              <p className="text-gray-500 text-[10px] font-mono">
                ⚠ Use credentials from an existing deposit in the privacy pool. The system will automatically generate ZK proofs for each payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Endpoint Selector */}
      <div className="crypto-box p-4 sm:p-5">
        <div className="crypto-label mb-3">AVAILABLE_ENDPOINTS</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_ENDPOINTS.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => setActiveEndpoint(endpoint.id)}
              className={`relative p-4 text-left transition-all group/ep ${
                activeEndpoint === endpoint.id
                  ? 'border-2 border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                  : 'border border-[#00ff88]/20 hover:border-[#00ff88]/40'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className="w-8 h-8 border flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    borderColor: activeEndpoint === endpoint.id ? '#00ff88' : endpoint.color,
                    color: activeEndpoint === endpoint.id ? '#00ff88' : endpoint.color,
                  }}
                >
                  {endpoint.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs font-mono mb-1 ${
                    activeEndpoint === endpoint.id ? 'text-[#00ff88]' : 'text-white'
                  }`}>
                    {endpoint.name}
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono">{endpoint.amount}</div>
                </div>
              </div>

              <div className="text-gray-400 text-[10px] font-mono leading-relaxed break-words">
                {endpoint.description}
              </div>

              <div className="mt-2 pt-2 border-t border-[#00ff88]/10">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-600">{endpoint.method}</span>
                  <span className="text-gray-600">{endpoint.path}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Test Button */}
      <button
        onClick={() => handleTestEndpoint(currentEndpoint)}
        disabled={loading || (activeMode === 'private' && (!secret || !nonce))}
        className="crypto-button-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <div className="crypto-loader"></div>
            <span className="text-xs sm:text-sm">
              {activeMode === 'private' ? 'GENERATING_ZK_PROOF' : 'PROCESSING_PAYMENT'}
            </span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm">
            TEST_{currentEndpoint.name} ({activeMode.toUpperCase()})
          </span>
        )}
      </button>

      {/* Result Display */}
      {result && (
        <div className="status-success p-4 sm:p-6 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
                <span className="text-[#00ff88] font-bold text-sm">✓</span>
              </div>
              <p className="text-[#00ff88] font-bold text-base sm:text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                PAYMENT_SUCCESSFUL
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="crypto-label mb-1 text-[10px]">ENDPOINT</div>
                <div className="text-white font-mono text-sm">{result.endpoint}</div>
              </div>

              <div>
                <div className="crypto-label mb-1 text-[10px]">MODE</div>
                <div className="text-white font-mono text-sm uppercase">{result.mode}</div>
              </div>

              <div>
                <div className="crypto-label mb-1 text-[10px]">RESPONSE_DATA</div>
                <pre className="bg-black/40 border border-[#00ff88]/20 p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>

              <div>
                <div className="crypto-label mb-1 text-[10px]">TIMESTAMP</div>
                <div className="hash-display text-xs">{result.timestamp}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="status-error p-4 sm:p-5 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_11px)]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚠</span>
              <h4 className="text-red-400 font-bold text-sm font-mono">PAYMENT_FAILED</h4>
            </div>

            <div className="space-y-2">
              <div>
                <div className="crypto-label mb-1 text-[10px]">ERROR</div>
                <div className="text-gray-300 text-xs font-mono">{error.message}</div>
              </div>

              <div>
                <div className="crypto-label mb-1 text-[10px]">DETAILS</div>
                <div className="text-gray-400 text-xs font-mono">{error.details}</div>
              </div>

              <div>
                <div className="crypto-label mb-1 text-[10px]">ENDPOINT</div>
                <div className="text-gray-400 text-xs font-mono">{error.endpoint}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="crypto-box p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00ff88] font-bold text-xs font-mono">i</span>
            </div>
            <h4 className="text-[#00ff88] font-bold text-xs sm:text-sm font-mono">HOW_IT_WORKS</h4>
          </div>

          <ol className="text-gray-400 text-xs space-y-2 font-mono pl-8 sm:pl-11">
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">1.</span>
              <span className="flex-1">Client makes request to protected endpoint</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">2.</span>
              <span className="flex-1">Server responds with 402 Payment Required</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">3.</span>
              <span className="flex-1">
                {activeMode === 'private'
                  ? 'Client generates ZK proof from deposit credentials'
                  : 'Client initiates standard x402 payment flow'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">4.</span>
              <span className="flex-1">
                {activeMode === 'private'
                  ? 'Client retries request with x-veilpay-proof header'
                  : 'Client retries request with payment proof'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">5.</span>
              <span className="flex-1">Server verifies payment and grants access</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
