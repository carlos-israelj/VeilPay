import { useState, useEffect, useRef } from 'react';
import { createWalletClient, createPublicClient, http, parseUnits, custom, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { c32addressDecode } from 'c32check';

// Configuration from documentation
const XRESERVE_CONTRACT = '0x008888878f94C0d87defdf0B07f46B93C1934442';
const ETH_USDC_CONTRACT = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const STACKS_DOMAIN = 10003;
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/h4D8GQtN9R629dlQF5y2Z';

// Contract ABIs
const XRESERVE_ABI = [
  {
    name: 'depositToRemote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'remoteDomain', type: 'uint32' },
      { name: 'remoteRecipient', type: 'bytes32' },
      { name: 'localToken', type: 'address' },
      { name: 'maxFee', type: 'uint256' },
      { name: 'hookData', type: 'bytes' },
    ],
    outputs: [],
  },
];

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
];

// Helper to encode Stacks address to bytes32 for xReserve
function encodeStacksAddress(stacksAddress) {
  const [version, hash160Hex] = c32addressDecode(stacksAddress);
  const hash160Bytes = new Uint8Array(
    hash160Hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
  const bytes = new Uint8Array(32);
  bytes[11] = version;
  bytes.set(hash160Bytes, 12);
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Bridge({ stacksAddress }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [ethAddress, setEthAddress] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [bridgeStep, setBridgeStep] = useState('');
  const [txHash, setTxHash] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [useConnectedWallet, setUseConnectedWallet] = useState(true);
  const intervalRef = useRef(null);

  // Load bridge state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('veilpay_bridge_state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.bridgeStep === 'waiting' || state.bridgeStep === 'completed') {
          setBridgeStep(state.bridgeStep);
          setTxHash(state.txHash);
          setProgress(state.progress || 0);

          if (state.bridgeStep === 'waiting' && state.startTime) {
            const totalTime = 18 * 60;
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const remaining = Math.max(0, totalTime - elapsed);

            setTimeRemaining(remaining);
            setProgress(Math.min(100, (elapsed / totalTime) * 100));

            if (remaining > 0) {
              const interval = setInterval(() => {
                const newElapsed = Math.floor((Date.now() - state.startTime) / 1000);
                const newRemaining = Math.max(0, totalTime - newElapsed);
                setTimeRemaining(newRemaining);
                setProgress(Math.min(100, (newElapsed / totalTime) * 100));

                if (newRemaining === 0) {
                  clearInterval(interval);
                  setBridgeStep('completed');
                }
              }, 1000);

              intervalRef.current = interval;
            } else {
              setBridgeStep('completed');
            }
          }
        }
      } catch (error) {
        console.error('Error loading bridge state:', error);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bridgeStep === 'waiting' || bridgeStep === 'completed') {
      const state = {
        bridgeStep,
        txHash,
        progress,
        startTime: Date.now() - ((18 * 60 - timeRemaining) * 1000),
      };
      localStorage.setItem('veilpay_bridge_state', JSON.stringify(state));
    } else if (!bridgeStep) {
      localStorage.removeItem('veilpay_bridge_state');
    }
  }, [bridgeStep, txHash, progress, timeRemaining]);

  const connectEthWallet = async () => {
    if (!window.ethereum) {
      setBridgeStep('error');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setEthAddress(accounts[0]);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        }
      }

      await updateBalances(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setBridgeStep('error');
    }
  };

  const updateBalances = async (address) => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL),
    });

    const eth = await publicClient.getBalance({ address });
    setEthBalance(formatUnits(eth, 18));

    const usdc = await publicClient.readContract({
      address: ETH_USDC_CONTRACT,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    setUsdcBalance(formatUnits(usdc, 6));
  };

  const disconnectEthWallet = () => {
    setEthAddress('');
    setUsdcBalance('0');
    setEthBalance('0');
    if (bridgeStep !== 'waiting' && bridgeStep !== 'completed') {
      setBridgeStep('');
      setTxHash('');
    }
  };

  const clearBridgeState = () => {
    setBridgeStep('');
    setTxHash('');
    setProgress(0);
    setTimeRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    localStorage.removeItem('veilpay_bridge_state');
  };

  const handleBridge = async () => {
    const targetAddress = useConnectedWallet ? stacksAddress : recipientAddress;

    if (!ethAddress || !targetAddress || !amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      setLoading(true);
      setBridgeStep('approving');
      setTxHash('');
      setProgress(0);

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(SEPOLIA_RPC_URL),
      });

      const value = parseUnits(amount, 6);
      const maxFee = 0n;
      const remoteRecipient = encodeStacksAddress(targetAddress);
      const hookData = '0x';

      console.log('Bridging', amount, 'USDC to Stacks address:', targetAddress);
      console.log('Encoded recipient (bytes32):', remoteRecipient);

      console.log('Approving xReserve...');
      const approveTx = await walletClient.writeContract({
        address: ETH_USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [XRESERVE_CONTRACT, value],
        account: ethAddress,
      });

      console.log('Approval tx:', approveTx);
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      console.log('Approval confirmed');

      setBridgeStep('depositing');
      console.log('Depositing to Stacks...');
      const depositTx = await walletClient.writeContract({
        address: XRESERVE_CONTRACT,
        abi: XRESERVE_ABI,
        functionName: 'depositToRemote',
        args: [value, STACKS_DOMAIN, remoteRecipient, ETH_USDC_CONTRACT, maxFee, hookData],
        account: ethAddress,
      });

      console.log('Deposit tx:', depositTx);
      setTxHash(depositTx);

      setBridgeStep('waiting');
      setLoading(false);
      const totalTime = 18 * 60;
      setTimeRemaining(totalTime);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, totalTime - elapsed);
        setTimeRemaining(remaining);
        setProgress(Math.min(100, (elapsed / totalTime) * 100));

        if (remaining === 0) {
          clearInterval(interval);
          intervalRef.current = null;
          setBridgeStep('completed');
        }
      }, 1000);

      intervalRef.current = interval;
      await updateBalances(ethAddress);
    } catch (error) {
      console.error('Bridge error:', error);
      setBridgeStep('error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="crypto-box-accent p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#00ff88_2px,#00ff88_3px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-white font-black text-xl sm:text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
              BRIDGE_PROTOCOL
            </h3>
            <div className="crypto-label">ETH→STACKS</div>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
            Bridge USDC from Ethereum Sepolia to USDCx on Stacks testnet.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>xReserve protocol | ETA: ~18 minutes
          </p>
        </div>
      </div>

      {/* Bridge Status Messages */}
      {bridgeStep === 'approving' && (
        <div className="crypto-box p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="crypto-loader"></div>
            <p className="text-[#00ff88] font-bold font-mono text-sm sm:text-base">STEP_1: APPROVING_USDC</p>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono">
            Confirm approval transaction in Ethereum wallet...
          </p>
        </div>
      )}

      {bridgeStep === 'depositing' && (
        <div className="crypto-box p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="crypto-loader"></div>
            <p className="text-[#00ff88] font-bold font-mono text-sm sm:text-base">STEP_2: DEPOSITING_TO_BRIDGE</p>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono">
            Sign and send bridge transaction in Ethereum wallet...
          </p>
        </div>
      )}

      {bridgeStep === 'waiting' && txHash && (
        <div className="status-success p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#00ff88] font-bold text-xs">✓</span>
            </div>
            <p className="text-[#00ff88] font-bold font-mono text-sm sm:text-base">BRIDGE_TX_SUBMITTED</p>
          </div>

          <div className="space-y-2">
            <div className="crypto-label">TRANSACTION_HASH</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hash-display block hover:border-[#00ff88] transition cursor-pointer break-all text-xs sm:text-sm"
            >
              {txHash}
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="crypto-label">TIME_REMAINING</div>
              <p className="text-[#00ff88] font-bold font-mono text-base sm:text-lg">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </p>
            </div>

            <div className="w-full bg-black/40 border border-[#00ff88]/20 h-2.5 sm:h-3 overflow-hidden">
              <div
                className="bg-[#00ff88] h-full transition-all duration-1000 ease-linear relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)] animate-pulse"></div>
              </div>
            </div>

            <p className="text-gray-500 text-xs text-center font-mono">
              USDCx arrival ETA: ~{Math.ceil(timeRemaining / 60)} minutes
            </p>
          </div>

          {!ethAddress && (
            <div className="crypto-box p-3 sm:p-4 mt-4">
              <p className="text-gray-400 text-xs sm:text-sm font-mono">
                <span className="text-[#00ff88] font-bold">NOTE:</span> You can safely disconnect Ethereum wallet.
                Transaction will continue processing.
              </p>
            </div>
          )}
        </div>
      )}

      {bridgeStep === 'completed' && txHash && (
        <div className="status-success p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
                <span className="text-[#00ff88] font-bold text-sm sm:text-base">✓</span>
              </div>
              <p className="text-[#00ff88] font-bold text-base sm:text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                BRIDGE_COMPLETE
              </p>
            </div>
            <button
              onClick={clearBridgeState}
              className="text-gray-500 hover:text-white text-xs sm:text-sm font-bold transition font-mono"
              title="Clear bridge status"
            >
              [X]
            </button>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm font-mono">
            USDCx now available on Stacks. Check balance in Deposit tab.
          </p>

          <div className="space-y-2">
            <div className="crypto-label">TRANSACTION</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hash-display block hover:border-[#00ff88] transition cursor-pointer break-all text-xs sm:text-sm"
            >
              {txHash}
            </a>
          </div>

          <button
            onClick={clearBridgeState}
            className="crypto-button-secondary w-full"
          >
            CLEAR STATUS
          </button>
        </div>
      )}

      {bridgeStep === 'error' && (
        <div className="status-error p-4 sm:p-6">
          <p className="text-red-400 font-bold mb-2 font-mono text-sm sm:text-base">BRIDGE_FAILED</p>
          <p className="text-gray-400 text-xs sm:text-sm font-mono">
            Retry operation or check console for error details.
          </p>
        </div>
      )}

      {!ethAddress ? (
        <button
          onClick={connectEthWallet}
          className="crypto-button-primary w-full"
        >
          CONNECT ETHEREUM WALLET
        </button>
      ) : (
        <>
          <div className="crypto-box p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="crypto-label mb-2">ETHEREUM_ADDRESS</div>
                <p className="text-white text-xs sm:text-sm font-mono break-all">{ethAddress}</p>
              </div>
              <button
                onClick={disconnectEthWallet}
                className="bg-black/40 hover:bg-black/60 text-[#00ff88] px-3 sm:px-4 py-2 text-xs font-bold font-mono transition border border-[#00ff88]/20 hover:border-[#00ff88] self-start sm:self-auto"
              >
                [DISCONNECT]
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-4">
              <div className="bg-black/40 p-3 sm:p-4 border border-[#00ff88]/20">
                <div className="crypto-label mb-1">ETH_BALANCE</div>
                <p className="text-white font-bold text-sm sm:text-lg font-mono">{parseFloat(ethBalance).toFixed(4)} ETH</p>
              </div>
              <div className="bg-black/40 p-3 sm:p-4 border border-[#00ff88]/20">
                <div className="crypto-label mb-1">USDC_BALANCE</div>
                <p className="text-white font-bold text-sm sm:text-lg font-mono">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
              </div>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="crypto-label block mb-3">STACKS_RECIPIENT_ADDRESS</label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3">
              <button
                onClick={() => setUseConnectedWallet(true)}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm font-mono transition border ${
                  useConnectedWallet
                    ? 'bg-[#00ff88] text-black border-[#00ff88]'
                    : 'bg-black/40 text-gray-400 border-[#00ff88]/20 hover:border-[#00ff88]'
                }`}
              >
                CONNECTED_WALLET
              </button>
              <button
                onClick={() => setUseConnectedWallet(false)}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm font-mono transition border ${
                  !useConnectedWallet
                    ? 'bg-[#00ff88] text-black border-[#00ff88]'
                    : 'bg-black/40 text-gray-400 border-[#00ff88]/20 hover:border-[#00ff88]'
                }`}
              >
                CUSTOM_ADDRESS
              </button>
            </div>

            {useConnectedWallet ? (
              <div className="crypto-box p-3 sm:p-4">
                <div className="crypto-label mb-1">RECIPIENT</div>
                <p className="text-white text-xs sm:text-sm font-mono break-all">
                  {stacksAddress || 'Connect Stacks wallet first'}
                </p>
              </div>
            ) : (
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                className="crypto-input w-full text-xs sm:text-sm"
              />
            )}
          </div>

          <div>
            <label className="crypto-label block mb-3">AMOUNT_USDC</label>
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
              minimum: 1.00 USDC | time: ~15 minutes
            </p>
          </div>

          <button
            onClick={handleBridge}
            disabled={loading || !amount || parseFloat(amount) < 1 || bridgeStep === 'waiting'}
            className="crypto-button-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="crypto-loader"></div>
                <span className="text-xs sm:text-sm">{bridgeStep === 'approving' ? 'APPROVING USDC' : 'DEPOSITING TO BRIDGE'}</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm">BRIDGE USDC TO STACKS</span>
            )}
          </button>

          {!bridgeStep && (
            <div className="status-warning p-4 sm:p-6">
              <p className="text-gray-400 text-xs sm:text-sm font-mono">
                <strong className="text-yellow-400 font-bold">TESTNET_FAUCETS</strong>
                <br />
                <br />
                USDC: <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:text-white underline transition"
                >
                  faucet.circle.com
                </a>
                <br />
                ETH: <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:text-white underline transition"
                >
                  alchemy.com/faucets
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
