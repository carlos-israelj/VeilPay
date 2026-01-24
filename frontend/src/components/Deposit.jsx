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
      // For USDCx token transfers, we specify the exact token name from the contract
      // Token name is 'usdcx-token' as defined in the USDCx contract
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
        postConditionMode: PostConditionMode.Deny, // Re-enabled for security
        network: STACKS_TESTNET,
        appDetails: {
          name: 'VeilPay',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Deposit successful:', data.txId);

          // Update the deposit with txId
          const storedDeposits = JSON.parse(
            localStorage.getItem('veilpay_deposits') || '[]'
          );
          const lastDepositIndex = storedDeposits.length - 1;
          if (lastDepositIndex >= 0) {
            storedDeposits[lastDepositIndex].txId = data.txId;
            localStorage.setItem('veilpay_deposits', JSON.stringify(storedDeposits));
          }

          setDepositData({ ...deposit, txId: data.txId });
          setLoading(false);
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
    <div className="space-y-8">
      {/* USDCx Balance Display */}
      <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
        <div className="flex justify-between items-center">
          <span className="text-[#777E90] text-sm font-bold">Your USDCx Balance:</span>
          <span className="text-[#22262E] font-bold text-2xl">{usdcxBalance} USDCx</span>
        </div>
      </div>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <h3 className="text-[#22262E] font-bold text-lg mb-4">Your Deposits ({deposits.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {deposits.map((dep, idx) => (
              <div key={idx} className="bg-[#FBFCFC] p-4 rounded-xl border border-[#E5E8EB]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#3772FF] font-bold text-base">
                    {dep.amountDisplay || (dep.amount / 1000000).toFixed(2)} USDCx
                  </span>
                  <span className="text-[#777E90] text-xs font-medium">
                    {new Date(dep.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[#777E90] text-xs break-all">
                  Commitment: {dep.commitment.substring(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-[#22262E] font-bold mb-3">Amount (USDCx)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (min 1.00)"
          step="0.01"
          min="1.00"
          className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition"
        />
        <p className="text-[#777E90] text-xs mt-2 font-medium">
          Available: {usdcxBalance} USDCx | Minimum: 1.00 USDCx
        </p>
      </div>

      <button
        onClick={handleDeposit}
        disabled={!amount || loading || parseFloat(amount) < 1}
        className="w-full bg-[#3772FF] hover:bg-[#2C5CE6] disabled:bg-[#B0B4C3] text-[#FBFCFC] font-bold py-4 px-6 rounded-full transition"
      >
        {loading ? 'Processing...' : 'Deposit'}
      </button>

      {depositData && (
        <div className="mt-6 p-6 bg-[#45B26A] bg-opacity-10 rounded-2xl border border-[#45B26A] border-opacity-30">
          <p className="text-[#45B26A] font-bold text-base mb-2">
            Deposit successful!
          </p>
          <p className="text-[#353945] text-sm mb-3">
            Your deposit details have been saved. Keep them safe to withdraw
            later.
          </p>
          <div className="mt-3 p-3 bg-[#FBFCFC] rounded-xl border border-[#E5E8EB] text-xs break-all">
            <p className="text-[#777E90] font-bold mb-1">Commitment:</p>
            <p className="text-[#22262E]">{depositData.commitment}</p>
          </div>
        </div>
      )}

      <div className="mt-4 p-6 bg-[#EF466F] bg-opacity-10 rounded-2xl border border-[#EF466F] border-opacity-30">
        <p className="text-[#353945] text-sm">
          <strong className="text-[#EF466F]">Important:</strong> Your deposit credentials are stored
          locally. Make sure to back them up before clearing browser data.
        </p>
      </div>
    </div>
  );
}
