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
// Based on official Stacks documentation: https://docs.stacks.co/more-guides/bridging-usdcx
function encodeStacksAddress(stacksAddress) {
  // Decode the c32check address to get version and hash160
  // Returns: [version (number), hash160 (hex string)]
  // Example: c32addressDecode('ST2TV...') => [26, 'a46ff88886c2ef9762d970b4d2c63678835bd39d']
  const [version, hash160Hex] = c32addressDecode(stacksAddress);

  // Convert hex string to bytes
  const hash160Bytes = new Uint8Array(
    hash160Hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );

  // Create 32-byte buffer following xReserve format:
  // 11 bytes padding + 1 byte version + 20 bytes hash160
  const bytes = new Uint8Array(32);

  // First 11 bytes are zero (padding)
  // Byte 11: version (22=mainnet p2pkh, 26=testnet p2pkh)
  bytes[11] = version;

  // Bytes 12-31: hash160 (20 bytes)
  bytes.set(hash160Bytes, 12);

  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Bridge({ stacksAddress }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [ethAddress, setEthAddress] = useState('');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [bridgeStep, setBridgeStep] = useState(''); // 'approving', 'depositing', 'waiting', 'completed'
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

        // Only restore if there's an active transaction
        if (state.bridgeStep === 'waiting' || state.bridgeStep === 'completed') {
          setBridgeStep(state.bridgeStep);
          setTxHash(state.txHash);
          setProgress(state.progress || 0);

          // If transaction is still waiting, resume the countdown
          if (state.bridgeStep === 'waiting' && state.startTime) {
            const totalTime = 18 * 60; // 18 minutes in seconds
            const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            const remaining = Math.max(0, totalTime - elapsed);

            setTimeRemaining(remaining);
            setProgress(Math.min(100, (elapsed / totalTime) * 100));

            // Resume the countdown timer if not completed
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
              // Time already elapsed, mark as completed
              setBridgeStep('completed');
            }
          }
        }
      } catch (error) {
        console.error('Error loading bridge state:', error);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save bridge state to localStorage whenever it changes
  useEffect(() => {
    if (bridgeStep === 'waiting' || bridgeStep === 'completed') {
      const state = {
        bridgeStep,
        txHash,
        progress,
        startTime: Date.now() - ((18 * 60 - timeRemaining) * 1000), // Calculate original start time
      };
      localStorage.setItem('veilpay_bridge_state', JSON.stringify(state));
    } else if (!bridgeStep) {
      // Clear saved state if no active transaction
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

      // Switch to Sepolia testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
        });
      } catch (switchError) {
        // Chain not added, try to add it
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

      // Get balances
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

    // Get ETH balance
    const eth = await publicClient.getBalance({ address });
    setEthBalance(formatUnits(eth, 18));

    // Get USDC balance
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
    // Don't clear bridge state if transaction is in progress
    // This allows users to monitor their bridge transaction even after disconnecting
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

      const value = parseUnits(amount, 6); // USDC has 6 decimals
      const maxFee = 0n;
      const remoteRecipient = encodeStacksAddress(targetAddress);
      const hookData = '0x';

      console.log('Bridging', amount, 'USDC to Stacks address:', targetAddress);
      console.log('Encoded recipient (bytes32):', remoteRecipient);

      // Step 1: Approve xReserve to spend USDC
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

      // Step 2: Deposit to Stacks
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

      // Start waiting period (18 minutes = 1080 seconds)
      setBridgeStep('waiting');
      setLoading(false);
      const totalTime = 18 * 60; // 18 minutes in seconds
      setTimeRemaining(totalTime);

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Update progress bar every second
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

      // Store interval reference for cleanup
      intervalRef.current = interval;

      // Update balances
      await updateBalances(ethAddress);
    } catch (error) {
      console.error('Bridge error:', error);
      setBridgeStep('error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="crypto-box-accent p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            BRIDGE_PROTOCOL
          </h3>
          <div className="crypto-label">ETH→STACKS</div>
        </div>
        <p className="text-gray-400 text-sm font-mono">
          Bridge USDC from Ethereum Sepolia to USDCx on Stacks testnet.
          <br />
          xReserve protocol | ETA: ~18 minutes
        </p>
      </div>

      {/* Bridge Status Messages - Always visible if there's an active transaction */}
      {bridgeStep === 'approving' && (
        <div className="crypto-box p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="crypto-loader"></div>
            <p className="text-[#00ff88] font-bold font-mono">STEP_1: APPROVING_USDC</p>
          </div>
          <p className="text-gray-400 text-sm font-mono">
            Confirm approval transaction in Ethereum wallet...
          </p>
        </div>
      )}

      {bridgeStep === 'depositing' && (
        <div className="crypto-box p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="crypto-loader"></div>
            <p className="text-[#00ff88] font-bold font-mono">STEP_2: DEPOSITING_TO_BRIDGE</p>
          </div>
          <p className="text-gray-400 text-sm font-mono">
            Sign and send bridge transaction in Ethereum wallet...
          </p>
        </div>
      )}

      {bridgeStep === 'waiting' && txHash && (
        <div className="status-success p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-[#00ff88] flex items-center justify-center">
              <span className="text-[#00ff88] font-bold text-xs">✓</span>
            </div>
            <p className="text-[#00ff88] font-bold font-mono">BRIDGE_TX_SUBMITTED</p>
          </div>

          <div className="space-y-2">
            <div className="crypto-label">TRANSACTION_HASH</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hash-display block hover:border-[#00ff88] transition cursor-pointer"
            >
              {txHash}
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="crypto-label">TIME_REMAINING</div>
              <p className="text-[#00ff88] font-bold font-mono text-lg">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/40 border border-[#00ff88]/20 h-3 overflow-hidden">
              <div
                className="bg-[#00ff88] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-gray-500 text-xs text-center font-mono">
              USDCx arrival ETA: ~{Math.ceil(timeRemaining / 60)} minutes
            </p>
          </div>

          {!ethAddress && (
            <div className="crypto-box p-4 mt-4">
              <p className="text-gray-400 text-sm font-mono">
                <span className="text-[#00ff88] font-bold">NOTE:</span> You can safely disconnect Ethereum wallet.
                Transaction will continue processing.
              </p>
            </div>
          )}
        </div>
      )}

      {bridgeStep === 'completed' && txHash && (
        <div className="status-success p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-[#00ff88] flex items-center justify-center">
                <span className="text-[#00ff88] font-bold">✓</span>
              </div>
              <p className="text-[#00ff88] font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                BRIDGE_COMPLETE
              </p>
            </div>
            <button
              onClick={clearBridgeState}
              className="text-gray-500 hover:text-white text-sm font-bold transition font-mono"
              title="Clear bridge status"
            >
              [X]
            </button>
          </div>

          <p className="text-gray-400 text-sm font-mono">
            USDCx now available on Stacks. Check balance in Deposit tab.
          </p>

          <div className="space-y-2">
            <div className="crypto-label">TRANSACTION</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hash-display block hover:border-[#00ff88] transition cursor-pointer"
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
        <div className="status-error p-6">
          <p className="text-red-400 font-bold mb-2 font-mono">BRIDGE_FAILED</p>
          <p className="text-gray-400 text-sm font-mono">
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
          <div className="crypto-box p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="crypto-label mb-2">ETHEREUM_ADDRESS</div>
                <p className="text-white text-sm font-mono break-all">{ethAddress}</p>
              </div>
              <button
                onClick={disconnectEthWallet}
                className="ml-4 bg-black/40 hover:bg-black/60 text-[#00ff88] px-4 py-2 text-xs font-bold font-mono transition border border-[#00ff88]/20 hover:border-[#00ff88]"
              >
                [DISCONNECT]
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-black/40 p-4 border border-[#00ff88]/20">
                <div className="crypto-label mb-1">ETH_BALANCE</div>
                <p className="text-white font-bold text-lg font-mono">{parseFloat(ethBalance).toFixed(4)} ETH</p>
              </div>
              <div className="bg-black/40 p-4 border border-[#00ff88]/20">
                <div className="crypto-label mb-1">USDC_BALANCE</div>
                <p className="text-white font-bold text-lg font-mono">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
              </div>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="crypto-label block mb-3">STACKS_RECIPIENT_ADDRESS</label>

            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setUseConnectedWallet(true)}
                className={`flex-1 py-3 px-4 font-bold text-sm font-mono transition border ${
                  useConnectedWallet
                    ? 'bg-[#00ff88] text-black border-[#00ff88]'
                    : 'bg-black/40 text-gray-400 border-[#00ff88]/20 hover:border-[#00ff88]'
                }`}
              >
                CONNECTED_WALLET
              </button>
              <button
                onClick={() => setUseConnectedWallet(false)}
                className={`flex-1 py-3 px-4 font-bold text-sm font-mono transition border ${
                  !useConnectedWallet
                    ? 'bg-[#00ff88] text-black border-[#00ff88]'
                    : 'bg-black/40 text-gray-400 border-[#00ff88]/20 hover:border-[#00ff88]'
                }`}
              >
                CUSTOM_ADDRESS
              </button>
            </div>

            {useConnectedWallet ? (
              <div className="crypto-box p-4">
                <div className="crypto-label mb-1">RECIPIENT</div>
                <p className="text-white text-sm font-mono break-all">
                  {stacksAddress || 'Connect Stacks wallet first'}
                </p>
              </div>
            ) : (
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                className="crypto-input w-full"
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
              className="crypto-input w-full"
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
                {bridgeStep === 'approving' ? 'APPROVING USDC' : 'DEPOSITING TO BRIDGE'}
              </span>
            ) : 'BRIDGE USDC TO STACKS'}
          </button>

          {!bridgeStep && (
            <div className="status-warning p-6">
              <p className="text-gray-400 text-sm font-mono">
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
