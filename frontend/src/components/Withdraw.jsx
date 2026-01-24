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
    <div className="space-y-8">
      <div>
        <label className="block text-[#22262E] font-bold mb-3">Select Deposit</label>
        <select
          value={selectedDeposit?.commitment || ''}
          onChange={(e) => {
            const deposit = deposits.find((d) => d.commitment === e.target.value);
            setSelectedDeposit(deposit);
          }}
          className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition"
        >
          <option value="">Choose a deposit...</option>
          {deposits.map((deposit) => (
            <option key={deposit.commitment} value={deposit.commitment}>
              {(deposit.amount / 1000000).toFixed(2)} USDCx - {new Date(deposit.timestamp).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {deposits.length === 0 && (
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <p className="text-[#777E90] text-sm text-center font-medium">
            No deposits found. Make a deposit first.
          </p>
        </div>
      )}

      <div>
        <label className="block text-[#22262E] font-bold mb-3">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
          className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition"
        />
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!selectedDeposit || !recipient || loading}
        className="w-full bg-[#3772FF] hover:bg-[#2C5CE6] disabled:bg-[#B0B4C3] text-[#FBFCFC] font-bold py-4 px-6 rounded-full transition"
      >
        {loading ? 'Generating Proof...' : 'Withdraw'}
      </button>

      <div className="mt-4 p-6 bg-[#9656D6] bg-opacity-10 rounded-2xl border border-[#9656D6] border-opacity-30">
        <p className="text-[#353945] text-sm">
          <strong className="text-[#9656D6]">Privacy Note:</strong> The withdrawal will go to the
          recipient address without revealing which deposit was used.
        </p>
      </div>
    </div>
  );
}
