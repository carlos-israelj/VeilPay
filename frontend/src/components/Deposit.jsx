import { useState, useEffect } from 'react';
import { generateDeposit } from '../utils/crypto';
import {
  Cl,
  fetchCallReadOnlyFunction,
  cvToValue,
  PostConditionMode,
  Pc
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { openContractCall } from '@stacks/connect';

export default function Deposit({ userSession }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState(null);
  const [usdcxBalance, setUsdcxBalance] = useState('0.00');
  const [deposits, setDeposits] = useState([]);

  // Load deposits from localStorage
  useEffect(() => {
    const loadDeposits = () => {
      try {
        const storedDeposits = JSON.parse(
          localStorage.getItem('veilpay_deposits') || '[]'
        );
        setDeposits(storedDeposits);
      } catch (error) {
        console.error('Error loading deposits:', error);
        setDeposits([]);
      }
    };

    loadDeposits();
    // Refresh deposits every 5 seconds (in case user makes deposits in another tab)
    const interval = setInterval(loadDeposits, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch USDCx balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userSession?.isUserSignedIn()) return;

      try {
        const userData = userSession.loadUserData();
        const address = userData.profile.stxAddress.testnet;

        // Call get-balance on USDCx contract
        const result = await fetchCallReadOnlyFunction({
          contractAddress: import.meta.env.VITE_USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: import.meta.env.VITE_USDCX_NAME || 'usdcx',
          functionName: 'get-balance',
          functionArgs: [
            Cl.principal(address)
          ],
          network: STACKS_TESTNET,
          senderAddress: address,
        });

        const balance = cvToValue(result);
        // USDCx has 6 decimals
        const balanceFormatted = (Number(balance.value) / 1000000).toFixed(2);
        setUsdcxBalance(balanceFormatted);
      } catch (error) {
        console.error('Error fetching USDCx balance:', error);
        setUsdcxBalance('0.00');
      }
    };

    fetchBalance();
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [userSession]);

  const handleDeposit = async () => {
    try {
      setLoading(true);

      // Validate minimum amount
      const amountNum = parseFloat(amount);
      if (amountNum < 1.0) {
        alert('Minimum deposit amount is 1.00 USDCx');
        setLoading(false);
        return;
      }

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
        amount: deposit.amount, // Store micro-units
        amountDisplay: amount, // Store original display amount
        timestamp: Date.now(),
      });
      localStorage.setItem('veilpay_deposits', JSON.stringify(storedDeposits));

      // Get user address for post-conditions
      const userData = userSession.loadUserData();
      const senderAddress = userData.profile.stxAddress.testnet;

      // Create post-condition: user transfers exact amount of USDCx
      const usdcxAddress = import.meta.env.VITE_USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      const usdcxName = import.meta.env.VITE_USDCX_NAME || 'usdcx';

      // Using Pc helper for post-conditions (modern syntax)
      const postConditions = [
        Pc.principal(senderAddress)
          .willSendEq(deposit.amount)
          .ft(`${usdcxAddress}.${usdcxName}`, 'usdcx-token')
      ];

      // Call contract deposit function with USDCx token
      const txOptions = {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        contractName: import.meta.env.VITE_CONTRACT_NAME || 'veilpay',
        functionName: 'deposit',
        functionArgs: [
          Cl.buffer(Buffer.from(deposit.commitment, 'hex')),
          Cl.uint(deposit.amount), // Use micro-units
          Cl.contractPrincipal(usdcxAddress, usdcxName)
        ],
        postConditions,
        postConditionMode: PostConditionMode.Deny,
        network: STACKS_TESTNET,
        appDetails: {
          name: 'VeilPay',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Deposit successful:', data.txId);
          setDepositData(deposit);
          setLoading(false);
          // Reload deposits to show the new one
          const storedDeposits = JSON.parse(
            localStorage.getItem('veilpay_deposits') || '[]'
          );
          setDeposits(storedDeposits);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
          setLoading(false);
        },
      };

      await openContractCall(txOptions);
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* USDCx Balance Display */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Your USDCx Balance:</span>
          <span className="text-white font-bold text-lg">{usdcxBalance} USDCx</span>
        </div>
      </div>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Your Deposits ({deposits.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {deposits.map((dep, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-purple-400 font-semibold">
                    {dep.amountDisplay || (dep.amount / 1000000).toFixed(2)} USDCx
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(dep.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-400 text-xs break-all">
                  Commitment: {dep.commitment.substring(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-gray-300 mb-2">Amount (USDCx)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (min 1.00)"
          step="0.01"
          min="1.00"
          className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-gray-400 text-xs mt-1">
          Available: {usdcxBalance} USDCx | Minimum: 1.00 USDCx
        </p>
      </div>

      <button
        onClick={handleDeposit}
        disabled={!amount || loading || parseFloat(amount) < 1}
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
