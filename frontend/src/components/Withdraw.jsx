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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#45B26A] to-[#38935A] bg-opacity-10 p-6 rounded-2xl border border-[#45B26A] border-opacity-30">
        <h2 className="text-[#22262E] text-2xl font-bold mb-2">Withdraw USDCx</h2>
        <p className="text-[#353945] text-sm">
          Enter the deposit credentials (secret, nonce, amount) to withdraw funds privately to any address.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-[#3772FF] bg-opacity-10 p-5 rounded-xl border border-[#3772FF] border-opacity-30">
        <h3 className="text-[#3772FF] font-bold text-sm mb-2">How to Withdraw</h3>
        <ol className="text-[#353945] text-sm space-y-1 list-decimal list-inside">
          <li>Enter the <strong>secret</strong>, <strong>nonce</strong>, and <strong>amount</strong> from the original deposit</li>
          <li>Enter the <strong>recipient address</strong> (can be any Stacks address)</li>
          <li>Click "Withdraw" to generate the ZK proof and claim your funds</li>
        </ol>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Secret Input */}
        <div>
          <label className="block text-[#777E90] text-sm font-bold mb-2">
            Secret
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your secret (e.g., 123456789...)"
            className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition font-mono text-sm"
          />
        </div>

        {/* Nonce Input */}
        <div>
          <label className="block text-[#777E90] text-sm font-bold mb-2">
            Nonce
          </label>
          <input
            type="text"
            value={nonce}
            onChange={(e) => setNonce(e.target.value)}
            placeholder="Enter your nonce (e.g., 987654321...)"
            className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition font-mono text-sm"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-[#777E90] text-sm font-bold mb-2">
            Amount (USDCx)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter deposit amount (e.g., 1.00)"
            className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition"
          />
          <p className="text-[#777E90] text-xs mt-2">
            This must match the exact amount that was deposited.
          </p>
        </div>

        {/* Calculate Commitment (Optional - for verification) */}
        {secret && nonce && amount && (
          <div className="bg-[#F4F5F6] p-4 rounded-xl">
            <button
              onClick={handleCalculateCommitment}
              className="text-[#3772FF] text-sm font-bold hover:underline mb-2"
            >
              → Calculate Commitment (for verification)
            </button>
            {calculatedCommitment && (
              <div className="mt-2">
                <p className="text-[#777E90] text-xs font-bold mb-1">Commitment:</p>
                <code className="text-[#353945] text-xs font-mono break-all bg-[#FBFCFC] p-2 rounded block">
                  {calculatedCommitment}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Recipient Address */}
        <div>
          <label className="block text-[#777E90] text-sm font-bold mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Stacks address (e.g., ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)"
            className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition font-mono text-sm"
          />
          <p className="text-[#777E90] text-xs mt-2">
            Can be any Stacks address - this is what makes the transfer private!
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-[#EF466F] bg-opacity-10 p-5 rounded-xl border border-[#EF466F] border-opacity-30">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-[#EF466F] font-bold text-sm mb-1">Important Security Notes</h4>
            <ul className="text-[#353945] text-xs space-y-1">
              <li>• Make sure the secret, nonce, and amount are correct</li>
              <li>• Each deposit can only be withdrawn once</li>
              <li>• ZK proof generation takes ~10 seconds</li>
              <li>• Transaction confirmation takes ~10 minutes on Stacks</li>
              <li>• Once withdrawn, the deposit cannot be recovered</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={loading || !secret || !nonce || !amount || !recipient}
        className="w-full bg-[#45B26A] hover:bg-[#38935A] text-[#FBFCFC] py-4 px-6 rounded-xl font-bold text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generating ZK Proof...
          </span>
        ) : (
          'Withdraw Funds'
        )}
      </button>

      {/* Success Message */}
      {withdrawalSuccess && (
        <div className="mt-6 p-6 bg-[#45B26A] bg-opacity-10 rounded-2xl border border-[#45B26A] border-opacity-30">
          <p className="text-[#45B26A] font-bold text-base mb-2">
            Withdrawal successful!
          </p>
          <p className="text-[#353945] text-sm mb-4">
            Your withdrawal has been submitted to the blockchain. The transaction will be confirmed in approximately 10 minutes.
          </p>

          {/* Transaction Link */}
          <div className="mt-4 p-3 bg-[#FBFCFC] rounded-xl border border-[#E5E8EB]">
            <p className="text-[#777E90] font-bold text-xs mb-2">Transaction:</p>
            <a
              href={`https://explorer.hiro.so/txid/${withdrawalSuccess}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3772FF] hover:text-[#2C5CE6] text-xs font-mono break-all flex items-center gap-2"
            >
              {withdrawalSuccess}
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-[#9656D6] bg-opacity-10 p-5 rounded-xl border border-[#9656D6] border-opacity-30">
        <h4 className="text-[#9656D6] font-bold text-sm mb-2">Privacy Guaranteed</h4>
        <p className="text-[#353945] text-xs leading-relaxed">
          Zero-Knowledge proofs ensure that no one can link this withdrawal to the original deposit.
          The recipient address is completely private and unlinkable from the depositor's address.
        </p>
      </div>
    </div>
  );
}
