// VeilPay Multi-Asset Support
// Manages routing and configuration for STX, USDCx, and sBTC privacy pools

/**
 * Asset configuration map
 * Defines parameters for each supported asset
 */
const ASSET_CONFIG = {
  STX: {
    symbol: 'STX',
    name: 'Stacks',
    decimals: 6,
    minDeposit: 1000000, // 1 STX
    contractName: 'veilpay',
    contractAddress: {
      testnet: process.env.STX_CONTRACT_TESTNET || 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay',
      mainnet: process.env.STX_CONTRACT_MAINNET || 'SP2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay',
    },
    isToken: false, // STX is native asset
    tokenContract: null,
  },

  USDCx: {
    symbol: 'USDCx',
    name: 'USD Coin (xReserve)',
    decimals: 6,
    minDeposit: 1000000, // 1 USDCx
    contractName: 'veilpay-usdcx',
    contractAddress: {
      testnet: process.env.USDCX_CONTRACT_TESTNET || 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx',
      mainnet: process.env.USDCX_CONTRACT_MAINNET || 'SP2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx',
    },
    isToken: true,
    tokenContract: {
      testnet: process.env.USDCX_TOKEN_TESTNET || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
      mainnet: process.env.USDCX_TOKEN_MAINNET || 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.usdc-token',
    },
  },

  sBTC: {
    symbol: 'sBTC',
    name: 'Stacks Bitcoin',
    decimals: 8,
    minDeposit: 10000, // 0.0001 BTC
    contractName: 'veilpay-sbtc',
    contractAddress: {
      testnet: process.env.SBTC_CONTRACT_TESTNET || 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc',
      mainnet: process.env.SBTC_CONTRACT_MAINNET || 'SP2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc',
    },
    isToken: true,
    tokenContract: {
      testnet: process.env.SBTC_TOKEN_TESTNET || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc',
      mainnet: process.env.SBTC_TOKEN_MAINNET || 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token',
    },
  },
};

/**
 * Get configuration for a specific asset
 * @param {string} asset - Asset symbol (STX, USDCx, sBTC)
 * @returns {object} Asset configuration
 */
function getAssetConfig(asset) {
  const config = ASSET_CONFIG[asset];
  if (!config) {
    throw new Error(`Unsupported asset: ${asset}. Supported: ${getSupportedAssets().join(', ')}`);
  }
  return config;
}

/**
 * Get list of supported assets
 * @returns {string[]} Array of asset symbols
 */
function getSupportedAssets() {
  return Object.keys(ASSET_CONFIG);
}

/**
 * Validate asset symbol
 * @param {string} asset - Asset to validate
 * @returns {boolean} True if supported
 */
function isAssetSupported(asset) {
  return getSupportedAssets().includes(asset);
}

/**
 * Get contract address for asset in current network
 * @param {string} asset - Asset symbol
 * @param {string} network - Network (testnet/mainnet)
 * @returns {string} Contract identifier
 */
function getContractAddress(asset, network = 'testnet') {
  const config = getAssetConfig(asset);
  return config.contractAddress[network];
}

/**
 * Get token contract address (for SIP-010 tokens)
 * @param {string} asset - Asset symbol
 * @param {string} network - Network (testnet/mainnet)
 * @returns {string|null} Token contract identifier or null if not a token
 */
function getTokenContract(asset, network = 'testnet') {
  const config = getAssetConfig(asset);
  if (!config.isToken) {
    return null;
  }
  return config.tokenContract[network];
}

/**
 * Validate deposit amount for asset
 * @param {string} asset - Asset symbol
 * @param {number|string} amount - Amount in micro-units
 * @returns {object} Validation result
 */
function validateAmount(asset, amount) {
  const config = getAssetConfig(asset);
  const amountNum = typeof amount === 'string' ? parseInt(amount) : amount;

  if (isNaN(amountNum) || amountNum <= 0) {
    return {
      valid: false,
      error: 'Amount must be a positive number',
    };
  }

  if (amountNum < config.minDeposit) {
    return {
      valid: false,
      error: `Minimum deposit for ${asset} is ${formatAmount(config.minDeposit, config.decimals)} ${asset}`,
      minAmount: config.minDeposit,
    };
  }

  return {
    valid: true,
    amount: amountNum,
  };
}

/**
 * Format amount for display
 * @param {number} microAmount - Amount in micro-units
 * @param {number} decimals - Number of decimals
 * @returns {string} Formatted amount
 */
function formatAmount(microAmount, decimals) {
  return (microAmount / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Parse amount from user input
 * @param {string} inputAmount - User input (e.g., "1.5")
 * @param {number} decimals - Number of decimals
 * @returns {number} Amount in micro-units
 */
function parseAmount(inputAmount, decimals) {
  const amount = parseFloat(inputAmount);
  if (isNaN(amount)) {
    throw new Error('Invalid amount');
  }
  return Math.floor(amount * Math.pow(10, decimals));
}

/**
 * Get human-readable asset name
 * @param {string} asset - Asset symbol
 * @returns {string} Asset name
 */
function getAssetName(asset) {
  const config = getAssetConfig(asset);
  return config.name;
}

/**
 * Get asset decimals
 * @param {string} asset - Asset symbol
 * @returns {number} Number of decimals
 */
function getAssetDecimals(asset) {
  const config = getAssetConfig(asset);
  return config.decimals;
}

/**
 * Route nullifier to correct asset pool
 * Since nullifiers are unique per deposit, we need to track which asset each nullifier belongs to
 * This is stored in memory (in production, use Redis/database)
 */
class NullifierRouter {
  constructor() {
    // Map: nullifierHash -> asset
    this.nullifierToAsset = new Map();
  }

  /**
   * Register nullifier for an asset
   * Called when processing a deposit
   */
  registerNullifier(nullifierHash, asset) {
    if (!isAssetSupported(asset)) {
      throw new Error(`Unsupported asset: ${asset}`);
    }
    this.nullifierToAsset.set(nullifierHash, asset);
  }

  /**
   * Get asset for a nullifier
   * Called when processing a withdrawal
   */
  getAssetForNullifier(nullifierHash) {
    return this.nullifierToAsset.get(nullifierHash) || null;
  }

  /**
   * Check if nullifier is registered
   */
  hasNullifier(nullifierHash) {
    return this.nullifierToAsset.has(nullifierHash);
  }
}

// Global nullifier router instance
const nullifierRouter = new NullifierRouter();

/**
 * Get merkle tree manager for asset
 * Each asset has its own Merkle tree
 */
function getMerkleTreeForAsset(asset, merkleManagers) {
  if (!isAssetSupported(asset)) {
    throw new Error(`Unsupported asset: ${asset}`);
  }

  const manager = merkleManagers[asset];
  if (!manager) {
    throw new Error(`Merkle tree not initialized for asset: ${asset}`);
  }

  return manager;
}

/**
 * Initialize multi-asset support
 * Called during relayer startup
 */
async function initializeMultiAsset() {
  const network = process.env.STACKS_NETWORK || 'testnet';

  console.log('[Multi-Asset] Initializing...');
  console.log(`[Multi-Asset] Network: ${network}`);

  for (const asset of getSupportedAssets()) {
    const config = getAssetConfig(asset);
    console.log(`[Multi-Asset] ${asset}:`);
    console.log(`  Contract: ${config.contractAddress[network]}`);
    console.log(`  Min deposit: ${formatAmount(config.minDeposit, config.decimals)} ${asset}`);
    if (config.isToken) {
      console.log(`  Token: ${config.tokenContract[network]}`);
    }
  }

  console.log('[Multi-Asset] Initialized ✅');
}

/**
 * Get multi-asset statistics
 */
function getMultiAssetStats(merkleManagers) {
  const stats = {};

  for (const asset of getSupportedAssets()) {
    const manager = merkleManagers[asset];
    if (manager) {
      stats[asset] = {
        totalDeposits: manager.leaves.length,
        currentRoot: manager.getRoot().toString('hex'),
        minDeposit: formatAmount(getAssetConfig(asset).minDeposit, getAssetDecimals(asset)),
      };
    } else {
      stats[asset] = {
        totalDeposits: 0,
        currentRoot: null,
        minDeposit: formatAmount(getAssetConfig(asset).minDeposit, getAssetDecimals(asset)),
      };
    }
  }

  return stats;
}

export {
  // Configuration
  ASSET_CONFIG,
  getAssetConfig,
  getSupportedAssets,
  isAssetSupported,
  getContractAddress,
  getTokenContract,

  // Amount utilities
  validateAmount,
  formatAmount,
  parseAmount,
  getAssetName,
  getAssetDecimals,

  // Nullifier routing
  NullifierRouter,
  nullifierRouter,

  // Merkle tree routing
  getMerkleTreeForAsset,

  // Initialization
  initializeMultiAsset,
  getMultiAssetStats,
};
