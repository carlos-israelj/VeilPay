import { useState, useEffect } from 'react';
import { generateProof } from '../utils/proof';
import axios from 'axios';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001';

export default function Withdraw({ userSession }) {
  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved deposits
    const storedDeposits = JSON.parse(
      localStorage.getItem('veilpay_deposits') || '[]'
    );
    setDeposits(storedDeposits);
  }, []);

  const handleWithdraw = async () => {
    if (!selectedDeposit || !recipient) {
      alert('Please select a deposit and enter recipient address');
      return;
    }

    try {
      setLoading(true);

      // Get merkle proof from relayer
      const proofResponse = await axios.get(
        `${RELAYER_URL}/proof/${selectedDeposit.commitment}`
      );
      const { pathElements, pathIndices } = proofResponse.data.proof;

      // Get current root
      const rootResponse = await axios.get(`${RELAYER_URL}/root`);
      const root = rootResponse.data.root;

      // Generate ZK proof
      console.log('Generating ZK proof...');
      const { proof, publicSignals } = await generateProof({
        secret: selectedDeposit.secret,
        nonce: selectedDeposit.nonce,
        amount: selectedDeposit.amount,
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
        amount: selectedDeposit.amount,
        root,
      });

      console.log('Withdrawal submitted:', withdrawResponse.data.txid);

      // Remove used deposit
      const updatedDeposits = deposits.filter(
        (d) => d.commitment !== selectedDeposit.commitment
      );
      localStorage.setItem('veilpay_deposits', JSON.stringify(updatedDeposits));
      setDeposits(updatedDeposits);
      setSelectedDeposit(null);

      alert('Withdrawal successful! TxID: ' + withdrawResponse.data.txid);
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 mb-2">Select Deposit</label>
        <select
          value={selectedDeposit?.commitment || ''}
          onChange={(e) => {
            const deposit = deposits.find((d) => d.commitment === e.target.value);
            setSelectedDeposit(deposit);
          }}
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Choose a deposit...</option>
          {deposits.map((deposit) => (
            <option key={deposit.commitment} value={deposit.commitment}>
              {deposit.amount} USDCx - {new Date(deposit.timestamp).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {deposits.length === 0 && (
        <p className="text-gray-400 text-sm">
          No deposits found. Make a deposit first.
        </p>
      )}

      <div>
        <label className="block text-gray-300 mb-2">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!selectedDeposit || !recipient || loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
      >
        {loading ? 'Generating Proof...' : 'Withdraw'}
      </button>

      <div className="mt-4 p-4 bg-blue-900 bg-opacity-30 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>Privacy Note:</strong> The withdrawal will go to the
          recipient address without revealing which deposit was used.
        </p>
      </div>
    </div>
  );
}
