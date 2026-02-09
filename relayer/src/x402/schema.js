// VeilPay x402 Schema Generator
// Generates schema for x402scan registration (https://scan.stacksx402.com)

/**
 * Generate x402scan registration schema
 * This schema advertises VeilPay's x402 endpoints to the ecosystem
 *
 * Schema follows Coinbase x402 V2 specification
 */
function generateX402Schema() {
  const baseUrl = process.env.X402_BASE_URL || 'https://api.veilpay.dev';
  const network = process.env.STACKS_NETWORK || 'testnet';
  const vendorAddress = process.env.VENDOR_ADDRESS;

  // CAIP-2 network identifier
  const networkId = network === 'testnet' ? 'stacks:2147483648' : 'stacks:1';

  const schema = {
    // Service metadata
    service: {
      name: 'VeilPay x402 Multi-Asset',
      version: '1.0.0',
      description: 'Privacy-preserving programmatic payments supporting STX, USDCx, and sBTC',
      provider: 'VeilPay',
      website: 'https://veilpay.dev',
      documentation: 'https://docs.veilpay.dev/x402',
    },

    // x402 specification version
    x402Version: '2.0',

    // Supported network
    network: networkId,

    // Privacy features (VeilPay extension)
    privacy: {
      enabled: true,
      protocol: 'ZK-SNARK',
      algorithm: 'Groth16',
      hashFunction: 'Poseidon',
      anonymitySet: 'All deposits in the pool',
      guarantee: 'Cryptographically unlinkable payments',
    },

    // Supported assets
    assets: [
      {
        symbol: 'STX',
        name: 'Stacks',
        decimals: 6,
        minAmount: '1000000', // 1 STX
        maxAmount: '100000000000', // 100,000 STX
        privacyPool: getContractId('veilpay', network),
      },
      {
        symbol: 'USDCx',
        name: 'USD Coin (xReserve)',
        decimals: 6,
        minAmount: '1000000', // 1 USDCx
        maxAmount: '1000000000000', // 1,000,000 USDCx
        privacyPool: getContractId('veilpay-usdcx', network),
        token: {
          standard: 'SIP-010',
          contract: getTokenContract('USDCx', network),
        },
      },
      {
        symbol: 'sBTC',
        name: 'Stacks Bitcoin',
        decimals: 8,
        minAmount: '10000', // 0.0001 BTC
        maxAmount: '100000000000', // 1,000 BTC
        privacyPool: getContractId('veilpay-sbtc', network),
        token: {
          standard: 'SIP-010',
          contract: getTokenContract('sBTC', network),
        },
      },
    ],

    // Available endpoints
    endpoints: [
      // Demo endpoint - 1 STX payment
      {
        path: '/x402/demo',
        method: 'GET',
        description: 'VeilPay x402 Demo - Access private content',
        payment: {
          required: true,
          asset: 'STX',
          amount: '1000000', // 1 STX
          payTo: vendorAddress,
          description: 'VeilPay x402 Demo (1 STX)',
        },
        privacy: {
          supported: true,
          headers: {
            proof: 'x-veilpay-proof',
            nullifier: 'x-veilpay-nullifier',
          },
        },
        response: {
          contentType: 'application/json',
          schema: {
            success: 'boolean',
            message: 'string',
            content: 'object',
            privacy: 'object',
          },
        },
      },

      // Premium content - 5 USDCx payment
      {
        path: '/x402/content/:contentId',
        method: 'GET',
        description: 'Access premium content with USDCx',
        payment: {
          required: true,
          asset: 'USDCx',
          amount: '5000000', // 5 USDCx
          payTo: vendorAddress,
          description: 'Premium Content (5 USDCx)',
        },
        privacy: {
          supported: true,
          headers: {
            proof: 'x-veilpay-proof',
            nullifier: 'x-veilpay-nullifier',
          },
        },
        response: {
          contentType: 'application/json',
          schema: {
            success: 'boolean',
            contentId: 'string',
            content: 'string',
            payment: 'object',
          },
        },
      },

      // Paid API execution - 0.0001 BTC payment
      {
        path: '/x402/api/execute',
        method: 'POST',
        description: 'Execute paid API operations with sBTC',
        payment: {
          required: true,
          asset: 'sBTC',
          amount: '10000', // 0.0001 BTC
          payTo: vendorAddress,
          description: 'Paid API Execution (0.0001 BTC)',
        },
        privacy: {
          supported: true,
          headers: {
            proof: 'x-veilpay-proof',
            nullifier: 'x-veilpay-nullifier',
          },
        },
        request: {
          contentType: 'application/json',
          schema: {
            operation: 'string',
            params: 'object',
          },
        },
        response: {
          contentType: 'application/json',
          schema: {
            success: 'boolean',
            operation: 'string',
            result: 'object',
            payment: 'object',
          },
        },
      },
    ],

    // Public endpoints (no payment required)
    publicEndpoints: [
      {
        path: '/x402/schema',
        method: 'GET',
        description: 'Get x402 service schema',
      },
      {
        path: '/x402/stats',
        method: 'GET',
        description: 'Get VeilPay x402 statistics',
      },
      {
        path: '/x402/verify-proof',
        method: 'POST',
        description: 'Manually verify a ZK proof',
      },
    ],

    // How to use VeilPay privacy payments
    usage: {
      standard: {
        description: 'Standard x402 payment flow (no privacy)',
        steps: [
          '1. Client receives 402 Payment Required response',
          '2. Client pays via x402-stacks (wrapAxiosWithPayment)',
          '3. Server verifies payment and grants access',
        ],
      },
      private: {
        description: 'VeilPay private payment flow (with ZK proofs)',
        steps: [
          '1. User deposits assets into VeilPay privacy pool',
          '2. User generates ZK proof (proves ownership without revealing identity)',
          '3. Client includes proof in headers: x-veilpay-proof, x-veilpay-nullifier',
          '4. Server verifies ZK proof off-chain',
          '5. Server triggers withdrawal from pool to vendor',
          '6. Server grants access to content',
        ],
      },
    },

    // Integration guide
    integration: {
      clientSide: {
        install: 'npm install x402-stacks',
        example: `
import { wrapAxiosWithPayment } from 'x402-stacks';
import axios from 'axios';

// Standard payment
const client = wrapAxiosWithPayment(axios, {
  facilitatorUrl: 'https://facilitator.veilpay.dev',
  network: 'testnet',
});

// Private payment with VeilPay
const response = await client.get('${baseUrl}/x402/demo', {
  headers: {
    'x-veilpay-proof': base64EncodedProof,
    'x-veilpay-nullifier': nullifierHash,
  }
});
        `.trim(),
      },
      serverSide: {
        install: 'npm install x402-stacks',
        example: `
const { createVeilPayX402Middleware } = require('./x402/middleware');

// Protect endpoint with x402 + privacy
app.get('/x402/demo',
  createVeilPayX402Middleware({
    asset: 'STX',
    amount: '1000000',
    payTo: vendorAddress,
    network: 'testnet',
  }),
  (req, res) => {
    res.json({ success: true, content: 'Private content!' });
  }
);
        `.trim(),
      },
    },

    // Facilitator URL
    facilitator: process.env.X402_FACILITATOR_URL || 'https://facilitator.veilpay.dev',

    // Contact information
    contact: {
      email: 'support@veilpay.dev',
      github: 'https://github.com/carlos-israelj/VeilPay',
      twitter: '@VeilPay',
    },

    // Schema metadata
    schema: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      url: `${baseUrl}/x402/schema`,
    },
  };

  return schema;
}

/**
 * Helper: Get contract identifier
 */
function getContractId(contractName, network) {
  const deployer = process.env.CONTRACT_ADDRESS;
  if (!deployer) {
    // Use example address if not configured
    return network === 'testnet'
      ? `ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.${contractName}`
      : `SP2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.${contractName}`;
  }
  return `${deployer}.${contractName}`;
}

/**
 * Helper: Get token contract address
 */
function getTokenContract(asset, network) {
  // These are placeholder addresses - update with actual deployed contracts
  const tokens = {
    USDCx: {
      testnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
      mainnet: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.usdc-token',
    },
    sBTC: {
      testnet: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc',
      mainnet: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token',
    },
  };

  return tokens[asset]?.[network] || `unknown.${asset.toLowerCase()}`;
}

export {
  generateX402Schema,
};
