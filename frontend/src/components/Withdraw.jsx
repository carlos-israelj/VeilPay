import { useState } from 'react';
import { generateProof } from '../utils/proof';
import { calculateCommitment } from '../utils/crypto';
import axios from 'axios';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001';

export default function Withdraw({ userSession }) {
  const [secret, setSecret] = useState('');
  const [nonce, setNonce] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedCommitment, setCalculatedCommitment] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(null);

  const handleCalculateCommitment = async () => {
    if (!secret || !nonce || !amount) {
      alert('Please enter secret, nonce, and amount');
      return;
    }

    try {
      // Convert amount to micro-units
      const amountMicro = Math.floor(parseFloat(amount) * 1000000);

      // Calculate commitment
      const commitment = await calculateCommitment(secret, amountMicro.toString(), nonce);
      setCalculatedCommitment(commitment);

      console.log('Calculated commitment:', commitment);
    } catch (error) {
      console.error('Error calculating commitment:', error);
      alert('Error calculating commitment: ' + error.message);
    }
  };

  const handleWithdraw = async () => {
    if (!secret || !nonce || !amount || !recipient) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      // Convert amount to micro-units
      const amountMicro = Math.floor(parseFloat(amount) * 1000000);

      // Calculate commitment
      const commitment = await calculateCommitment(secret, amountMicro.toString(), nonce);
      console.log('Using commitment:', commitment);

      // Get merkle proof from relayer
      const proofResponse = await axios.get(
        `${RELAYER_URL}/proof/${commitment}`
      );

      if (!proofResponse.data.proof) {
        throw new Error('Commitment not found in Merkle tree. Make sure the deposit exists and has been indexed by the relayer.');
      }

      const { pathElements, pathIndices } = proofResponse.data.proof;

      // Get current root
      const rootResponse = await axios.get(`${RELAYER_URL}/root`);
      const root = rootResponse.data.root;

      // Generate ZK proof
      console.log('Generating ZK proof...');
      const { proof, publicSignals } = await generateProof({
        secret: secret,
        nonce: nonce,
        amount: amountMicro.toString(),
        recipient: recipient,
        pathElements,
        pathIndices,
        root,
      });

      // Submit to relayer
      console.log('Submitting to relayer...');
      const withdrawResponse = await axios.post(`${RELAYER_URL}/withdraw`, {
        proof,
        publicSignals,
        nullifierHash: publicSignals[1],
        recipient,
        amount: amountMicro,
        root,
      });

      console.log('Withdrawal submitted:', withdrawResponse.data.txid);

      // Set success state with txid
      setWithdrawalSuccess(withdrawResponse.data.txid);

      // Clear form
      setSecret('');
      setNonce('');
      setAmount('');
      setRecipient('');
      setCalculatedCommitment('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('Withdrawal failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="crypto-box-accent p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(-45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
              WITHDRAW_PROTOCOL
            </h2>
            <div className="crypto-label">ZK-PROOF</div>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
            Enter deposit credentials (secret, nonce, amount) to withdraw funds privately to any address.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="crypto-box p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00ff88] font-bold text-xs sm:text-sm">?</span>
            </div>
            <h3 className="text-[#00ff88] font-bold text-sm sm:text-base font-mono">WITHDRAWAL_PROTOCOL</h3>
          </div>
          <ol className="text-gray-400 text-xs sm:text-sm space-y-2 font-mono pl-8 sm:pl-11">
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">1.</span>
              <span className="flex-1 min-w-0">Enter <span className="text-white">secret</span>, <span className="text-white">nonce</span>, and <span className="text-white">amount</span> from original deposit</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">2.</span>
              <span className="flex-1 min-w-0">Enter <span className="text-white">recipient address</span> (can be any Stacks address)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#00ff88] flex-shrink-0">3.</span>
              <span className="flex-1 min-w-0">Execute withdrawal to generate ZK proof and claim funds</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 sm:space-y-5">
        {/* Secret Input */}
        <div>
          <label className="crypto-label block mb-2 sm:mb-3">SECRET_KEY</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your secret (e.g., 123456789...)"
            className="crypto-input w-full text-sm sm:text-base"
          />
        </div>

        {/* Nonce Input */}
        <div>
          <label className="crypto-label block mb-2 sm:mb-3">NONCE_VALUE</label>
          <input
            type="text"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
            placeholder="Enter your nonce (e.g., 987654321...)"
            className="crypto-input w-full text-sm sm:text-base"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="crypto-label block mb-2 sm:mb-3">AMOUNT_USDCX</label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.00"
            className="crypto-input w-full text-sm sm:text-base"
          />
          <p className="text-gray-500 text-xs mt-2 font-mono">
            must match exact deposit amount
          </p>
        </div>

        {/* Calculate Commitment (Optional - for verification) */}
        {secret && nonce && amount && (
          <div className="crypto-box p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#00ff88_2px,#00ff88_3px)]"></div>
            <div className="relative z-10">
              <button
                onClick={handleCalculateCommitment}
                className="text-[#00ff88] text-xs sm:text-sm font-bold hover:text-white font-mono transition mb-3"
              >
                → CALCULATE_COMMITMENT (verify)
              </button>
              {calculatedCommitment && (
                <div className="mt-3 animate-fadeIn">
                  <div className="crypto-label mb-2">COMMITMENT_HASH</div>
                  <div className="hash-display text-xs sm:text-sm break-all">
                    {calculatedCommitment}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipient Address */}
        <div>
          <label className="crypto-label block mb-2 sm:mb-3">RECIPIENT_ADDRESS</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
            className="crypto-input w-full text-sm sm:text-base"
          />
          <p className="text-gray-500 text-xs mt-2 font-mono">
            any stacks address | unlinkable transfer
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="status-error p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_11px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">⚠</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-red-400 font-bold text-xs sm:text-sm mb-2 sm:mb-3 font-mono">SECURITY_CRITICAL</h4>
              <ul className="text-gray-400 text-xs sm:text-sm space-y-1 sm:space-y-1.5 font-mono">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span className="flex-1 min-w-0">Verify secret, nonce, and amount are correct</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span className="flex-1 min-w-0">Each deposit can only be withdrawn once</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span className="flex-1 min-w-0">ZK proof generation: ~10 seconds</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span className="flex-1 min-w-0">Transaction confirmation: ~10 minutes</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span className="flex-1 min-w-0">Irreversible operation: no recovery possible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={loading || !secret || !nonce || !amount || !recipient}
        className="crypto-button-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <div className="crypto-loader"></div>
            <span className="text-xs sm:text-sm">GENERATING ZK PROOF</span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm">EXECUTE WITHDRAWAL</span>
        )}
      </button>

      {/* Success Message */}
      {withdrawalSuccess && (
        <div className="status-success p-4 sm:p-6 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
                <span className="text-[#00ff88] font-bold text-sm sm:text-base">✓</span>
              </div>
              <p className="text-[#00ff88] font-bold text-base sm:text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                WITHDRAWAL SUCCESSFUL
              </p>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 font-mono">
              Submitted to blockchain. Confirmation ETA: ~10 minutes.
            </p>

            {/* Transaction Link */}
            <div className="mt-4 border-t border-[#00ff88]/20 pt-4">
              <div className="crypto-label mb-2">TRANSACTION_ID</div>
              <a
                href={`https://explorer.hiro.so/txid/${withdrawalSuccess}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ff88] hover:text-white text-xs font-mono break-all flex items-center gap-2 transition"
              >
                <span className="flex-1 min-w-0">{withdrawalSuccess}</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="crypto-box-accent p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00ff88] font-bold text-xs sm:text-sm font-mono">#</span>
            </div>
            <h4 className="text-[#00ff88] font-bold text-xs sm:text-sm font-mono">PRIVACY_GUARANTEED</h4>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-mono">
            Zero-Knowledge proofs ensure no one can link this withdrawal to the original deposit.
            The recipient address is completely private and unlinkable from the depositor's address.
          </p>
        </div>
      </div>
    </div>
  );
}
