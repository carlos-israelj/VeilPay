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

  const connectEthWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet');
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
      alert('Failed to connect wallet: ' + error.message);
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

  const handleBridge = async () => {
    if (!ethAddress) {
      alert('Please connect your Ethereum wallet first');
      return;
    }

    if (!stacksAddress) {
      alert('Please connect your Stacks wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

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
      const remoteRecipient = encodeStacksAddress(stacksAddress);
      const hookData = '0x';

      console.log('Bridging', amount, 'USDC to Stacks address:', stacksAddress);
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
      console.log('Depositing to Stacks...');
      const depositTx = await walletClient.writeContract({
        address: XRESERVE_CONTRACT,
        abi: XRESERVE_ABI,
        functionName: 'depositToRemote',
        args: [value, STACKS_DOMAIN, remoteRecipient, ETH_USDC_CONTRACT, maxFee, hookData],
        account: ethAddress,
      });

      console.log('Deposit tx:', depositTx);
      console.log('Bridge initiated! View on Sepolia Etherscan:',
        `https://sepolia.etherscan.io/tx/${depositTx}`);

      alert(`Bridge successful! Transaction: ${depositTx}\n\nUSDCx will arrive on Stacks in ~15 minutes.`);

      // Update balances
      await updateBalances(ethAddress);
    } catch (error) {
      console.error('Bridge error:', error);
      alert('Bridge failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
        <h3 className="text-blue-400 font-semibold mb-2">Bridge USDC from Ethereum</h3>
        <p className="text-gray-300 text-sm">
          Bridge USDC from Ethereum Sepolia to get USDCx on Stacks testnet.
          This uses Circle's xReserve protocol.
        </p>
      </div>

      {!ethAddress ? (
        <button
          onClick={connectEthWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Connect Ethereum Wallet (MetaMask)
        </button>
      ) : (
        <>
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <p className="text-gray-400 text-sm">Ethereum Address:</p>
            <p className="text-white text-sm font-mono break-all">{ethAddress}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-400 text-xs">ETH Balance</p>
                <p className="text-white font-semibold">{parseFloat(ethBalance).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">USDC Balance</p>
                <p className="text-white font-semibold">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min 1.00)"
              step="0.01"
              min="1.00"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              Minimum: 1.00 USDC | Time: ~15 minutes
            </p>
          </div>

          <button
            onClick={handleBridge}
            disabled={loading || !amount || parseFloat(amount) < 1}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? 'Bridging...' : 'Bridge USDC to Stacks'}
          </button>

          <div className="bg-yellow-900 bg-opacity-30 p-4 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Need testnet USDC?</strong>
              <br />
              Get USDC from Circle Faucet: <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                faucet.circle.com
              </a>
              <br />
              Get ETH from Sepolia Faucet: <a
                href="https://www.alchemy.com/faucets/ethereum-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                alchemy.com/faucets
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
