import { useState } from 'react';
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
    setBridgeStep('');
    setTxHash('');
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

      // Update progress bar every second
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, totalTime - elapsed);
        setTimeRemaining(remaining);
        setProgress(Math.min(100, (elapsed / totalTime) * 100));

        if (remaining === 0) {
          clearInterval(interval);
          setBridgeStep('completed');
        }
      }, 1000);

      // Update balances
      await updateBalances(ethAddress);
    } catch (error) {
      console.error('Bridge error:', error);
      setBridgeStep('error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#9656D6] bg-opacity-10 p-6 rounded-2xl border border-[#9656D6] border-opacity-30">
        <h3 className="text-[#9656D6] font-bold text-lg mb-2">Bridge USDC from Ethereum</h3>
        <p className="text-[#353945] text-sm">
          Bridge USDC from Ethereum Sepolia to get USDCx on Stacks testnet.
          This uses Circle's xReserve protocol. Bridging takes approximately 18 minutes.
        </p>
      </div>

      {!ethAddress ? (
        <button
          onClick={connectEthWallet}
          className="w-full bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] font-bold py-4 px-6 rounded-full transition"
        >
          Connect Ethereum Wallet
        </button>
      ) : (
        <>
          <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB] space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-[#777E90] text-xs font-bold mb-2">Ethereum Address:</p>
                <p className="text-[#22262E] text-sm font-mono break-all">{ethAddress}</p>
              </div>
              <button
                onClick={disconnectEthWallet}
                className="ml-4 bg-[#FBFCFC] hover:bg-[#E5E8EB] text-[#22262E] px-4 py-2 rounded-full text-xs font-bold transition border border-[#E5E8EB]"
              >
                Disconnect
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-[#FBFCFC] p-4 rounded-xl border border-[#E5E8EB]">
                <p className="text-[#777E90] text-xs font-bold mb-1">ETH Balance</p>
                <p className="text-[#22262E] font-bold text-lg">{parseFloat(ethBalance).toFixed(4)} ETH</p>
              </div>
              <div className="bg-[#FBFCFC] p-4 rounded-xl border border-[#E5E8EB]">
                <p className="text-[#777E90] text-xs font-bold mb-1">USDC Balance</p>
                <p className="text-[#22262E] font-bold text-lg">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
              </div>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-[#22262E] font-bold mb-3">Stacks Recipient Address</label>

            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setUseConnectedWallet(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition border-2 ${
                  useConnectedWallet
                    ? 'bg-[#3772FF] text-[#FBFCFC] border-[#3772FF]'
                    : 'bg-[#FBFCFC] text-[#777E90] border-[#E5E8EB] hover:border-[#3772FF]'
                }`}
              >
                Use Connected Wallet
              </button>
              <button
                onClick={() => setUseConnectedWallet(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition border-2 ${
                  !useConnectedWallet
                    ? 'bg-[#3772FF] text-[#FBFCFC] border-[#3772FF]'
                    : 'bg-[#FBFCFC] text-[#777E90] border-[#E5E8EB] hover:border-[#3772FF]'
                }`}
              >
                Custom Address
              </button>
            </div>

            {useConnectedWallet ? (
              <div className="bg-[#F4F5F6] p-4 rounded-xl border border-[#E5E8EB]">
                <p className="text-[#777E90] text-xs font-bold mb-1">Recipient:</p>
                <p className="text-[#22262E] text-sm font-mono break-all">
                  {stacksAddress || 'Connect Stacks wallet first'}
                </p>
              </div>
            ) : (
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                className="w-full bg-[#FBFCFC] text-[#22262E] px-5 py-4 rounded-xl border-2 border-[#E5E8EB] focus:outline-none focus:border-[#3772FF] transition font-mono text-sm"
              />
            )}
          </div>

          <div>
            <label className="block text-[#22262E] font-bold mb-3">Amount (USDC)</label>
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
              Minimum: 1.00 USDC | Time: ~15 minutes
            </p>
          </div>

          <button
            onClick={handleBridge}
            disabled={loading || !amount || parseFloat(amount) < 1 || bridgeStep === 'waiting'}
            className="w-full bg-[#3772FF] hover:bg-[#2C5CE6] disabled:bg-[#B0B4C3] text-[#FBFCFC] font-bold py-4 px-6 rounded-full transition"
          >
            {loading ? (bridgeStep === 'approving' ? 'Approving USDC...' : 'Depositing to Bridge...') : 'Bridge USDC to Stacks'}
          </button>

          {/* Bridge Status Messages */}
          {bridgeStep === 'approving' && (
            <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin h-5 w-5 border-2 border-[#3772FF] border-t-transparent rounded-full"></div>
                <p className="text-[#3772FF] font-bold">Step 1: Approving USDC</p>
              </div>
              <p className="text-[#353945] text-sm">
                Please confirm the approval transaction in your Ethereum wallet...
              </p>
            </div>
          )}

          {bridgeStep === 'depositing' && (
            <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin h-5 w-5 border-2 border-[#3772FF] border-t-transparent rounded-full"></div>
                <p className="text-[#3772FF] font-bold">Step 2: Depositing to Bridge</p>
              </div>
              <p className="text-[#353945] text-sm">
                Please sign and send the bridge transaction in your Ethereum wallet...
              </p>
            </div>
          )}

          {bridgeStep === 'waiting' && txHash && (
            <div className="bg-[#45B26A] bg-opacity-10 p-6 rounded-2xl border border-[#45B26A] border-opacity-30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-[#45B26A] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-[#45B26A] font-bold">Bridge Transaction Submitted!</p>
              </div>

              <div className="space-y-2">
                <p className="text-[#353945] text-sm font-medium">Transaction Hash:</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3772FF] text-sm font-mono break-all hover:underline block"
                >
                  {txHash}
                </a>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[#353945] text-sm font-bold">Estimated Time Remaining:</p>
                  <p className="text-[#3772FF] font-bold">
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E5E8EB] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#3772FF] to-[#45B26A] h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-[#777E90] text-xs text-center">
                  Your USDCx will arrive on Stacks in approximately {Math.ceil(timeRemaining / 60)} minutes
                </p>
              </div>
            </div>
          )}

          {bridgeStep === 'completed' && txHash && (
            <div className="bg-[#45B26A] bg-opacity-10 p-6 rounded-2xl border border-[#45B26A] border-opacity-30 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-[#45B26A] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <p className="text-[#45B26A] font-bold text-lg">Bridge Complete!</p>
              </div>

              <p className="text-[#353945] text-sm">
                Your USDCx should now be available on Stacks. Check your balance in the Deposit tab.
              </p>

              <div className="space-y-2">
                <p className="text-[#353945] text-sm font-medium">Transaction:</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3772FF] text-sm font-mono break-all hover:underline block"
                >
                  {txHash}
                </a>
              </div>
            </div>
          )}

          {bridgeStep === 'error' && (
            <div className="bg-[#EF466F] bg-opacity-10 p-6 rounded-2xl border border-[#EF466F] border-opacity-30">
              <p className="text-[#EF466F] font-bold mb-2">Bridge Failed</p>
              <p className="text-[#353945] text-sm">
                Please try again or check the console for error details.
              </p>
            </div>
          )}

          {!bridgeStep && (
            <div className="bg-[#EF466F] bg-opacity-10 p-6 rounded-2xl border border-[#EF466F] border-opacity-30">
              <p className="text-[#353945] text-sm">
                <strong className="text-[#EF466F]">Need testnet USDC?</strong>
                <br />
                Get USDC from Circle Faucet: <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3772FF] underline font-medium"
                >
                  faucet.circle.com
                </a>
                <br />
                Get ETH from Sepolia Faucet: <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3772FF] underline font-medium"
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
