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

        const result = await fetchCallReadOnlyFunction({
          contractAddress: import.meta.env.VITE_USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: import.meta.env.VITE_USDCX_NAME || 'usdcx',
          functionName: 'get-balance',
          functionArgs: [Cl.principal(address)],
          network: STACKS_TESTNET,
          senderAddress: address,
        });

        const balance = cvToValue(result);
        const balanceFormatted = (Number(balance.value) / 1000000).toFixed(2);
        setUsdcxBalance(balanceFormatted);
      } catch (error) {
        console.error('Error fetching USDCx balance:', error);
        setUsdcxBalance('0.00');
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [userSession]);

  const handleDeposit = async () => {
    try {
      setLoading(true);

      const amountNum = parseFloat(amount);
      if (amountNum < 1.0) {
        alert('Minimum deposit amount is 1.00 USDCx');
        setLoading(false);
        return;
      }

      const deposit = await generateDeposit(amount);

      const storedDeposits = JSON.parse(
        localStorage.getItem('veilpay_deposits') || '[]'
      );
      storedDeposits.push({
        secret: deposit.secret,
        nonce: deposit.nonce,
        commitment: deposit.commitment,
        amount: deposit.amount,
        amountDisplay: amount,
        timestamp: Date.now(),
      });
      localStorage.setItem('veilpay_deposits', JSON.stringify(storedDeposits));

      const userData = userSession.loadUserData();
      const senderAddress = userData.profile.stxAddress.testnet;

      const usdcxAddress = import.meta.env.VITE_USDCX_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      const usdcxName = import.meta.env.VITE_USDCX_NAME || 'usdcx';

      const postConditions = [
        Pc.principal(senderAddress)
          .willSendEq(deposit.amount)
          .ft(`${usdcxAddress}.${usdcxName}`, 'usdcx-token')
      ];

      const txOptions = {
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
        contractName: import.meta.env.VITE_CONTRACT_NAME || 'veilpay',
        functionName: 'deposit',
        functionArgs: [
          Cl.buffer(Buffer.from(deposit.commitment, 'hex')),
          Cl.uint(deposit.amount),
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
    <div className="space-y-4 sm:space-y-6">
      {/* USDCx Balance Display */}
      <div className="crypto-box p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className="crypto-label mb-1 sm:mb-2">USDCX_BALANCE</div>
              <div className="text-white text-2xl sm:text-3xl lg:text-4xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                {usdcxBalance}
              </div>
            </div>
            <div className="live-indicator"></div>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <div className="crypto-box p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-white font-bold text-base sm:text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              YOUR DEPOSITS
            </h3>
            <div className="crypto-label">{deposits.length} TOTAL</div>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
            {deposits.map((dep, idx) => (
              <div key={idx} className="border border-[#00ff88]/20 bg-black/20 p-3 sm:p-4 hover:border-[#00ff88]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <span className="text-[#00ff88] font-bold font-mono text-sm sm:text-base">
                    {dep.amountDisplay || (dep.amount / 1000000).toFixed(2)} USDCx
                  </span>
                  <span className="text-gray-500 text-xs font-mono">
                    {new Date(dep.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="hash-display text-xs break-all">
                  {dep.commitment.substring(0, 48)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deposit Form */}
      <div>
        <label className="crypto-label block mb-3">DEPOSIT_AMOUNT</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.00"
          step="0.01"
          min="1.00"
          className="crypto-input w-full text-sm sm:text-base"
        />
        <p className="text-gray-500 text-xs mt-2 font-mono">
          available: {usdcxBalance} USDCx | minimum: 1.00 USDCx
        </p>
      </div>

      <button
        onClick={handleDeposit}
        disabled={!amount || loading || parseFloat(amount) < 1}
        className="crypto-button-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <div className="crypto-loader"></div>
            <span className="text-xs sm:text-sm">PROCESSING</span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm">INITIATE DEPOSIT</span>
        )}
      </button>

      {depositData && (
        <div className="status-success p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00ff88] font-bold text-sm sm:text-base">✓</span>
            </div>
            <p className="text-[#00ff88] font-bold text-base sm:text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
              DEPOSIT SUCCESSFUL
            </p>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 font-mono">
            Store these credentials securely. Required for withdrawal.
          </p>

          {/* Secret */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <div className="crypto-label">SECRET_KEY</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(depositData.secret);
                  alert('Secret copied to clipboard!');
                }}
                className="text-[#00ff88] hover:text-white text-xs font-bold font-mono transition self-start sm:self-auto"
              >
                [COPY]
              </button>
            </div>
            <div className="hash-display break-all text-xs sm:text-sm">{depositData.secret}</div>
          </div>

          {/* Nonce */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <div className="crypto-label">NONCE_VALUE</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(depositData.nonce);
                  alert('Nonce copied to clipboard!');
                }}
                className="text-[#00ff88] hover:text-white text-xs font-bold font-mono transition self-start sm:self-auto"
              >
                [COPY]
              </button>
            </div>
            <div className="hash-display break-all text-xs sm:text-sm">{depositData.nonce}</div>
          </div>

          {/* Amount */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <div className="crypto-label">AMOUNT</div>
              <button
                onClick={() => {
                  const displayAmount = (Number(depositData.amount) / 1000000).toFixed(2);
                  navigator.clipboard.writeText(displayAmount);
                  alert('Amount copied to clipboard!');
                }}
                className="text-[#00ff88] hover:text-white text-xs font-bold font-mono transition self-start sm:self-auto"
              >
                [COPY]
              </button>
            </div>
            <div className="text-white font-bold font-mono text-base sm:text-lg">
              {(Number(depositData.amount) / 1000000).toFixed(2)} USDCx
            </div>
          </div>

          {/* Copy All Button */}
          <button
            onClick={() => {
              const displayAmount = (Number(depositData.amount) / 1000000).toFixed(2);
              const allData = `VeilPay Withdrawal Credentials\n\nSecret: ${depositData.secret}\nNonce: ${depositData.nonce}\nAmount: ${displayAmount}\n\nShare these with the person who will withdraw the funds.`;
              navigator.clipboard.writeText(allData);
              alert('All credentials copied to clipboard!');
            }}
            className="crypto-button-secondary w-full mt-4"
          >
            <span className="text-xs sm:text-sm">COPY ALL CREDENTIALS</span>
          </button>

          {/* Transaction Link */}
          {depositData.txId && (
            <div className="mt-4 sm:mt-6 border-t border-[#00ff88]/20 pt-4">
              <div className="crypto-label mb-2">TRANSACTION_ID</div>
              <a
                href={`https://explorer.hiro.so/txid/${depositData.txId}?chain=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ff88] hover:text-white text-xs font-mono break-all flex items-center gap-2 transition"
              >
                <span className="flex-1">{depositData.txId}</span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="status-warning p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <span className="text-xl sm:text-2xl flex-shrink-0">⚠</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-yellow-400 font-bold text-xs sm:text-sm mb-2 font-mono">SECURITY_WARNING</h4>
            <p className="text-gray-400 text-xs font-mono leading-relaxed">
              Credentials are stored locally in browser. Backup before clearing data.
              Loss of credentials = permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
