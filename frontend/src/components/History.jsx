import { useState, useEffect } from 'react';
import { calculateNullifier } from '../utils/crypto';
import { Cl, fetchCallReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

export default function History() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

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

      return cvToValue(result);
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
        return 'bg-[#EF466F] bg-opacity-10 text-[#EF466F] border-[#EF466F]';
      case 'withdrawn':
        return 'bg-[#45B26A] bg-opacity-10 text-[#45B26A] border-[#45B26A]';
      default:
        return 'bg-[#777E90] bg-opacity-10 text-[#777E90] border-[#777E90]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Available to Withdraw';
      case 'withdrawn':
        return 'Withdrawn';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9656D6] to-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#9656D6] border-opacity-30">
        <h2 className="text-[#22262E] text-2xl font-bold mb-2">Deposit History</h2>
        <p className="text-[#353945] text-sm">
          Track your deposits and their status. Your private keys (secret & nonce) are stored locally in your browser.
        </p>
      </div>

      {/* Loading State */}
      {loading && deposits.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3772FF]"></div>
          <p className="text-[#777E90] text-sm mt-4">Loading deposits...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && deposits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-[#22262E] font-bold text-xl mb-2">No Deposits Yet</h3>
          <p className="text-[#777E90] text-sm">
            Make your first deposit to start using VeilPay's private transfer protocol.
          </p>
        </div>
      )}

      {/* Deposits List */}
      {deposits.length > 0 && (
        <div className="space-y-4">
          {deposits.map((deposit, index) => (
            <div
              key={index}
              className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB] hover:border-[#3772FF] transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Amount and Date */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#22262E] text-2xl font-bold">
                      {formatAmount(deposit.amount)} USDCx
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        deposit.status
                      )}`}
                    >
                      {getStatusText(deposit.status)}
                    </span>
                  </div>
                  <p className="text-[#777E90] text-sm">
                    {formatDate(deposit.timestamp)}
                  </p>
                </div>

                {/* Right: Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#777E90] text-xs font-bold">Commitment:</span>
                    <code className="text-[#353945] text-xs font-mono bg-[#FBFCFC] px-2 py-1 rounded">
                      {truncateHash(deposit.commitment)}
                    </code>
                  </div>
                  {deposit.txId && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#777E90] text-xs font-bold">Transaction:</span>
                      <a
                        href={`${EXPLORER_URL}/${deposit.txId}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3772FF] text-xs font-mono hover:underline flex items-center gap-1"
                      >
                        {truncateHash(deposit.txId)}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Expandable Details (Optional) */}
              {deposit.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-[#E5E8EB]">
                  <p className="text-[#777E90] text-xs mb-2 font-bold">Your Private Keys:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#FBFCFC] p-3 rounded-lg border border-[#E5E8EB]">
                      <span className="text-[#777E90] text-xs font-bold block mb-1">Secret:</span>
                      <code className="text-[#353945] text-xs font-mono break-all">
                        {deposit.secret}
                      </code>
                    </div>
                    <div className="bg-[#FBFCFC] p-3 rounded-lg border border-[#E5E8EB]">
                      <span className="text-[#777E90] text-xs font-bold block mb-1">Nonce:</span>
                      <code className="text-[#353945] text-xs font-mono break-all">
                        {deposit.nonce}
                      </code>
                    </div>
                  </div>
                  <p className="text-[#EF466F] text-xs mt-2">
                    ⚠ Save these values securely. You'll need them to withdraw this deposit.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {deposits.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadDepositsWithStatus}
            disabled={loading}
            className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      )}
    </div>
  );
}
