import { useState } from 'react';
import { generateDeposit } from '../utils/crypto';
import { makeContractCall, bufferCV, uintCV, contractPrincipalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

export default function Deposit({ userSession }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState(null);

  const handleDeposit = async () => {
    try {
      setLoading(true);

      // Generate deposit commitment
      const deposit = await generateDeposit(amount);

      // Store deposit data securely (in production, encrypt this)
      const storedDeposits = JSON.parse(
        localStorage.getItem('veilpay_deposits') || '[]'
      );
      storedDeposits.push({
        secret: deposit.secret,
        nonce: deposit.nonce,
        commitment: deposit.commitment,
        amount: amount,
        timestamp: Date.now(),
      });
      localStorage.setItem('veilpay_deposits', JSON.stringify(storedDeposits));

      // Call contract deposit function with USDCx token
      const txOptions = {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        contractName: import.meta.env.VITE_CONTRACT_NAME || 'veilpay',
        functionName: 'deposit',
        functionArgs: [
          bufferCV(Buffer.from(deposit.commitment, 'hex')),
          uintCV(amount),
          contractPrincipalCV(
            'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            'usdcx'
          )
        ],
        network: new StacksTestnet(),
        appDetails: {
          name: 'VeilPay',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Deposit successful:', data.txId);
          setDepositData(deposit);
          setLoading(false);
        },
      };

      await makeContractCall(txOptions);
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-gray-300 mb-2">Amount (USDCx)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleDeposit}
        disabled={!amount || loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
      >
        {loading ? 'Processing...' : 'Deposit'}
      </button>

      {depositData && (
        <div className="mt-6 p-4 bg-green-900 bg-opacity-30 rounded-lg">
          <p className="text-green-400 font-semibold mb-2">
            Deposit successful!
          </p>
          <p className="text-gray-300 text-sm">
            Your deposit details have been saved. Keep them safe to withdraw
            later.
          </p>
          <div className="mt-2 p-2 bg-gray-800 rounded text-xs break-all">
            <p className="text-gray-400">Commitment:</p>
            <p className="text-white">{depositData.commitment}</p>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-900 bg-opacity-30 rounded-lg">
        <p className="text-yellow-400 text-sm">
          <strong>Important:</strong> Your deposit credentials are stored
          locally. Make sure to back them up before clearing browser data.
        </p>
      </div>
    </div>
  );
}
