import { useState, useEffect } from 'react';
import { calculateNullifier } from '../utils/crypto';
import { Cl, fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

export default function History() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDeposit, setExpandedDeposit] = useState(null);

  // Explorer base URL for testnet
  const EXPLORER_URL = 'https://explorer.hiro.so/txid';

  useEffect(() => {
    loadDepositsWithStatus();
    // Refresh every 30 seconds
    const interval = setInterval(loadDepositsWithStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDepositsWithStatus = async () => {
    try {
      setLoading(true);
      const storedDeposits = JSON.parse(
        localStorage.getItem('veilpay_deposits') || '[]'
      );

      // Check nullifier status for each deposit
      const depositsWithStatus = await Promise.all(
        storedDeposits.map(async (deposit) => {
          try {
            // Calculate nullifier for this deposit
            const nullifier = await calculateNullifier(deposit.secret, deposit.nonce);

            // Check if nullifier has been used (withdrawn)
            const isWithdrawn = await checkNullifierUsed(nullifier);

            return {
              ...deposit,
              nullifier,
              status: isWithdrawn ? 'withdrawn' : 'pending',
            };
          } catch (error) {
            console.error('Error checking deposit status:', error);
            return {
              ...deposit,
              status: 'unknown',
            };
          }
        })
      );

      // Sort by timestamp (most recent first)
      depositsWithStatus.sort((a, b) => b.timestamp - a.timestamp);
      setDeposits(depositsWithStatus);
    } catch (error) {
      console.error('Error loading deposits:', error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const checkNullifierUsed = async (nullifier) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        contractName: import.meta.env.VITE_CONTRACT_NAME || 'veilpay',
        functionName: 'is-nullifier-used',
        functionArgs: [Cl.buffer(Buffer.from(nullifier, 'hex'))],
        network: STACKS_TESTNET,
        senderAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
      });

      const value = cvToValue(result);
      // The contract returns (ok true) or (ok false)
      // cvToValue converts this to { type: 'ok', value: boolean }
      console.log('Nullifier check result:', value);

      // Extract the actual boolean value
      if (value && typeof value === 'object' && 'value' in value) {
        return value.value;
      }

      return value;
    } catch (error) {
      console.error('Error checking nullifier:', error);
      return false;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return (Number(amount) / 1000000).toFixed(2);
  };

  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      case 'withdrawn':
        return 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'AVAILABLE';
      case 'withdrawn':
        return 'WITHDRAWN';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in-up">
      {/* Terminal Header */}
      <div className="crypto-box-accent p-4 sm:p-6 stagger-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[#00ff88] font-bold text-xs sm:text-sm font-mono flex-shrink-0">
              LOG
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
              TRANSACTION_LOG
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-[#00ff88]'}`}></div>
            <span className="text-[10px] sm:text-xs font-mono text-gray-500">
              {deposits.length} {deposits.length === 1 ? 'ENTRY' : 'ENTRIES'}
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
          Chronological record of ZK commitment operations. Credentials stored locally via browser storage.
        </p>
      </div>

      {/* Loading State */}
      {loading && deposits.length === 0 && (
        <div className="crypto-box text-center py-12 sm:py-16">
          <div className="inline-flex items-center gap-3 text-[#00ff88] mb-4">
            <div className="crypto-loader"></div>
            <span className="font-mono text-xs sm:text-sm">SCANNING_BLOCKCHAIN</span>
          </div>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#00ff88]/20"
                style={{
                  animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && deposits.length === 0 && (
        <div className="crypto-box text-center py-12 sm:py-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#00ff88]/30 mx-auto mb-4 sm:mb-6 flex items-center justify-center text-3xl sm:text-4xl text-[#00ff88]/50 font-mono">
              [ ]
            </div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-2 font-mono">NULL_SET</h3>
            <p className="text-gray-400 text-xs sm:text-sm font-mono max-w-md mx-auto leading-relaxed px-4">
              No transaction history detected. Initialize first commitment via DEPOSIT interface.
            </p>
          </div>
        </div>
      )}

      {/* Deposits Terminal Log */}
      {deposits.length > 0 && (
        <div className="space-y-2">
          {deposits.map((deposit, index) => {
            const isExpanded = expandedDeposit === index;
            const isPending = deposit.status === 'pending';

            return (
              <div
                key={index}
                className={`crypto-box relative overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-[#00ff88]' : ''
                }`}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Status indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isPending ? 'bg-yellow-400' : 'bg-[#00ff88]'
                }`}>
                  {isPending && (
                    <div className="absolute inset-0 bg-yellow-400 animate-pulse"></div>
                  )}
                </div>

                {/* Main content */}
                <div
                  className="pl-6 sm:pl-8 pr-4 sm:pr-6 py-4 sm:py-5 cursor-pointer group/item"
                  onClick={() => setExpandedDeposit(isExpanded ? null : index)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    {/* Left: Terminal-style entry */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="text-gray-600 text-[10px] sm:text-xs font-mono break-all">
                          [{new Date(deposit.timestamp).toISOString().substring(0, 19).replace('T', ' ')}]
                        </span>
                        <div className={`px-2 py-0.5 text-[10px] font-bold font-mono border ${getStatusColor(deposit.status)} self-start`}>
                          {getStatusText(deposit.status)}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[#00ff88] text-base sm:text-lg font-bold font-mono">
                            {formatAmount(deposit.amount)}
                          </span>
                          <span className="text-gray-500 text-xs sm:text-sm font-mono">USDCx</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-700 text-xs font-mono hidden sm:inline">→</span>
                          <span className="text-gray-600 text-[10px] sm:text-xs font-mono break-all">
                            commitment: {truncateHash(deposit.commitment)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action indicator */}
                    <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-start">
                      {deposit.txId && (
                        <a
                          href={`${EXPLORER_URL}/${deposit.txId}?chain=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#00ff88]/60 hover:text-[#00ff88] transition-colors"
                          title="View on Explorer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}

                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#00ff88]/20 space-y-3 sm:space-y-4 animate-fadeIn">
                      {/* Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs font-mono">
                        <div className="bg-black/40 border border-[#00ff88]/10 p-3">
                          <div className="text-[#00ff88]/60 mb-1 text-[10px] sm:text-xs">NULLIFIER_HASH</div>
                          <div className="text-gray-400 break-all text-[10px] sm:text-xs">{deposit.nullifier ? truncateHash(deposit.nullifier) : 'Computing...'}</div>
                        </div>

                        <div className="bg-black/40 border border-[#00ff88]/10 p-3">
                          <div className="text-[#00ff88]/60 mb-1 text-[10px] sm:text-xs">TIMESTAMP_UTC</div>
                          <div className="text-gray-400 text-[10px] sm:text-xs break-words">{new Date(deposit.timestamp).toUTCString()}</div>
                        </div>

                        <div className="bg-black/40 border border-[#00ff88]/10 p-3 sm:col-span-2">
                          <div className="text-[#00ff88]/60 mb-1 text-[10px] sm:text-xs">COMMITMENT_FULL</div>
                          <div className="text-gray-400 break-all text-[10px]">{deposit.commitment}</div>
                        </div>

                        {deposit.txId && (
                          <div className="bg-black/40 border border-[#00ff88]/10 p-3 sm:col-span-2">
                            <div className="text-[#00ff88]/60 mb-1 text-[10px] sm:text-xs">TX_HASH</div>
                            <div className="text-gray-400 break-all text-[10px]">{deposit.txId}</div>
                          </div>
                        )}
                      </div>

                      {/* Private Keys Section - Only shown when clicking "VIEW CREDENTIALS" for pending deposits */}
                      {isPending && (
                        <div className="bg-red-400/5 border-l-2 sm:border-l-4 border-red-400 p-3 sm:p-4">
                          <div className="flex items-start gap-2 sm:gap-3 mb-3">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border border-red-400 flex items-center justify-center text-red-400 text-xs font-bold flex-shrink-0">
                              !
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-red-400 font-bold text-[10px] sm:text-xs font-mono mb-1">WITHDRAWAL_CREDENTIALS_REQUIRED</div>
                              <div className="text-gray-400 text-[10px] sm:text-xs font-mono">
                                Credentials stored locally. Export before clearing browser data.
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const el = e.target.closest('.crypto-box').querySelector('.credentials-container');
                              el.classList.toggle('hidden');
                            }}
                            className="crypto-button-secondary text-xs px-4 py-2 w-full"
                          >
                            VIEW_CREDENTIALS
                          </button>

                          <div className="credentials-container hidden mt-3 space-y-2 animate-fadeIn">
                            <div className="bg-black/60 border border-red-400/30 p-3">
                              <div className="text-red-400/80 text-[10px] font-mono mb-1">SECRET</div>
                              <code className="text-white text-[10px] sm:text-xs font-mono break-all select-all">{deposit.secret}</code>
                            </div>
                            <div className="bg-black/60 border border-red-400/30 p-3">
                              <div className="text-red-400/80 text-[10px] font-mono mb-1">NONCE</div>
                              <code className="text-white text-[10px] sm:text-xs font-mono break-all select-all">{deposit.nonce}</code>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Withdrawn Status */}
                      {!isPending && (
                        <div className="bg-[#00ff88]/5 border-l-2 sm:border-l-4 border-[#00ff88] p-3 sm:p-4">
                          <div className="flex items-center gap-2 text-[#00ff88] text-[10px] sm:text-xs font-mono">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border border-[#00ff88] flex items-center justify-center text-[8px] sm:text-[10px] font-bold flex-shrink-0">
                              ✓
                            </div>
                            <span className="break-words">COMMITMENT_NULLIFIED - Withdrawal completed successfully</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Control Bar */}
      {deposits.length > 0 && (
        <div className="crypto-box p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] sm:text-xs font-mono text-gray-500 text-center sm:text-left">
            Showing {deposits.length} transaction{deposits.length !== 1 ? 's' : ''}
          </div>

          <button
            onClick={loadDepositsWithStatus}
            disabled={loading}
            className="crypto-button-secondary px-4 sm:px-6 py-2 text-xs sm:text-sm w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                SYNCING
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                REFRESH
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
