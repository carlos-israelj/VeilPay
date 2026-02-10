import { useState, useEffect } from 'react';
import {
  Cl,
  fetchCallReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

/**
 * AssetSelector - Multi-asset selection component
 * Cryptographic noir aesthetic with terminal-inspired UI
 */

const ASSET_CONFIG = {
  STX: {
    symbol: 'STX',
    name: 'Stacks',
    icon: '₿',
    color: '#FF8C00', // Bitcoin orange for STX
    decimals: 6,
    minAmount: 1.0,
    minAmountMicro: '1000000',
    contractName: 'veilpay',
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    description: 'Native blockchain currency',
    poolInfo: 'Original privacy pool',
    isNative: true,
  },
  USDCx: {
    symbol: 'USDCx',
    name: 'USD Coin (xReserve)',
    icon: '$',
    color: '#2775CA', // USDC blue
    decimals: 6,
    minAmount: 1.0,
    minAmountMicro: '1000000',
    contractName: 'veilpay-usdcx',
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    tokenContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
    description: 'Bridged stablecoin via xReserve',
    poolInfo: 'Stablecoin privacy pool',
    isNative: false,
  },
  sBTC: {
    symbol: 'sBTC',
    name: 'Stacks Bitcoin',
    icon: '฿',
    color: '#F7931A', // Bitcoin orange
    decimals: 8,
    minAmount: 0.0001,
    minAmountMicro: '10000',
    contractName: 'veilpay-sbtc-v2',
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    tokenContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc',
    description: 'Bitcoin on Stacks via sBTC bridge',
    poolInfo: 'First Bitcoin privacy on Stacks!',
    isNative: false,
  },
};

export default function AssetSelector({ selectedAsset, onChange, userAddress }) {
  const [balances, setBalances] = useState({
    STX: '0.00',
    USDCx: '0.00',
    sBTC: '0.00000000',
  });
  const [loading, setLoading] = useState(false);

  // Fetch balances for all assets
  useEffect(() => {
    if (!userAddress) return;

    const fetchBalances = async () => {
      setLoading(true);
      try {
        // Fetch STX balance
        const stxResponse = await fetch(
          `https://api.testnet.hiro.so/extended/v1/address/${userAddress}/balances`
        );
        const stxData = await stxResponse.json();
        const stxBalance = (Number(stxData.stx.balance) / 1000000).toFixed(2);

        // Fetch USDCx balance
        const usdcxResult = await fetchCallReadOnlyFunction({
          contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: 'usdcx',
          functionName: 'get-balance',
          functionArgs: [Cl.principal(userAddress)],
          network: STACKS_TESTNET,
          senderAddress: userAddress,
        });
        const usdcxBalance = (Number(cvToValue(usdcxResult).value) / 1000000).toFixed(2);

        // Fetch sBTC balance
        const sbtcResult = await fetchCallReadOnlyFunction({
          contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: 'sbtc',
          functionName: 'get-balance',
          functionArgs: [Cl.principal(userAddress)],
          network: STACKS_TESTNET,
          senderAddress: userAddress,
        });
        const sbtcBalance = (Number(cvToValue(sbtcResult).value) / 100000000).toFixed(8);

        setBalances({
          STX: stxBalance,
          USDCx: usdcxBalance,
          sBTC: sbtcBalance,
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [userAddress]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="crypto-box-accent p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)]"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="crypto-label mb-1">ASSET_SELECTION</div>
              <p className="text-gray-400 text-xs font-mono">
                Choose privacy pool for multi-asset deposits
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="crypto-loader"></div>
                <span className="text-xs text-gray-500 font-mono">SYNC</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(ASSET_CONFIG).map(([key, asset]) => {
          const isSelected = selectedAsset === key;
          const balance = balances[key];

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative group transition-all ${
                isSelected
                  ? 'crypto-box-accent border-2 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                  : 'crypto-box border hover:border-[#00ff88]/40'
              }`}
            >
              {/* Glitch effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent animate-pulse"></div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-[#00ff88] border-r-transparent">
                  <div className="absolute -top-[20px] -right-[20px] text-black text-[10px] font-bold">✓</div>
                </div>
              )}

              <div className="relative z-10 p-4 sm:p-5">
                {/* Asset Icon & Symbol */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 border-2 flex items-center justify-center text-2xl transition-all group-hover:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                    style={{
                      borderColor: isSelected ? '#00ff88' : asset.color,
                      color: isSelected ? '#00ff88' : asset.color,
                      backgroundColor: `${asset.color}10`
                    }}
                  >
                    {asset.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold text-base sm:text-lg font-mono">
                      {asset.symbol}
                    </div>
                    <div className="text-gray-500 text-[10px] sm:text-xs font-mono">
                      {asset.name}
                    </div>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mb-3 pb-3 border-b border-[#00ff88]/10">
                  <div className="crypto-label mb-1 text-[10px]">BALANCE</div>
                  <div className={`font-mono text-lg sm:text-xl font-bold ${
                    isSelected ? 'text-[#00ff88]' : 'text-white'
                  }`}>
                    {balance}
                  </div>
                </div>

                {/* Asset Info */}
                <div className="space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-[10px] font-mono flex-shrink-0">MIN:</span>
                    <span className="text-gray-400 text-[10px] font-mono">
                      {asset.minAmount} {asset.symbol}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 text-[10px] font-mono flex-shrink-0">POOL:</span>
                    <span className="text-gray-400 text-[10px] font-mono break-all">
                      {asset.contractName}
                    </span>
                  </div>
                  <div className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-[#00ff88]' : 'text-gray-500'
                  }`}>
                    {asset.poolInfo}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3 pt-3 border-t border-[#00ff88]/10">
                  <div className={`inline-flex items-center gap-2 px-2 py-1 border text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                      : 'border-gray-700 bg-gray-900/50 text-gray-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 ${
                      isSelected ? 'bg-[#00ff88] animate-pulse' : 'bg-gray-600'
                    }`}></div>
                    {isSelected ? 'SELECTED' : 'AVAILABLE'}
                  </div>
                </div>
              </div>

              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00ff88_2px,#00ff88_4px)] group-hover:opacity-10 transition-opacity"></div>
            </button>
          );
        })}
      </div>

      {/* Selected Asset Details */}
      {selectedAsset && (
        <div className="crypto-box p-4 sm:p-5 relative overflow-hidden animate-fadeIn">
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#00ff88_2px,#00ff88_3px)]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
                <span className="text-[#00ff88] font-bold text-sm">→</span>
              </div>
              <h3 className="text-[#00ff88] font-bold text-sm sm:text-base font-mono">
                SELECTED_ASSET_CONFIG
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="crypto-label mb-1 text-[10px]">CONTRACT_ADDRESS</div>
                <div className="hash-display text-xs break-all">
                  {ASSET_CONFIG[selectedAsset].contractAddress}
                </div>
              </div>
              <div>
                <div className="crypto-label mb-1 text-[10px]">PRIVACY_POOL</div>
                <div className="text-white text-xs font-mono">
                  {ASSET_CONFIG[selectedAsset].contractAddress}.{ASSET_CONFIG[selectedAsset].contractName}
                </div>
              </div>
              {!ASSET_CONFIG[selectedAsset].isNative && (
                <div className="sm:col-span-2">
                  <div className="crypto-label mb-1 text-[10px]">TOKEN_CONTRACT</div>
                  <div className="hash-display text-xs break-all">
                    {ASSET_CONFIG[selectedAsset].tokenContract}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ASSET_CONFIG };
