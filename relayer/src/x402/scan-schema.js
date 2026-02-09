// VeilPay x402scan Compatible Schema
// Generates schema compatible with x402scan registry at scan.stacksx402.com

/**
 * Generate x402scan-compatible schema
 * This follows the exact format required by scan.stacksx402.com
 */
function generateX402ScanSchema() {
  const baseUrl = process.env.X402_BASE_URL || 'https://veilpay-x402-relayer.onrender.com';
  const network = process.env.STACKS_NETWORK || 'testnet';
  const vendorAddress = process.env.VENDOR_ADDRESS || 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1';

  const schema = {
    // x402 version (v1 format for x402scan compatibility)
    x402Version: 1,

    // Service name (required, non-empty)
    name: 'VeilPay x402 Multi-Asset Privacy Payments',

    // Optional: Service image/logo
    image: 'https://veilpay.dev/logo.png',

    // Accepts array (required, non-empty) - defines available endpoints
    accepts: [
      // Endpoint 1: Demo - 1 STX payment
      {
        scheme: 'exact',
        network: 'stacks',
        maxAmountRequired: '1000000', // 1 STX
        resource: `${baseUrl}/x402/demo`,
        description: 'VeilPay x402 Demo - Access private content with STX',
        mimeType: 'application/json',
        payTo: vendorAddress,
        maxTimeoutSeconds: 300,
        asset: 'STX',

        // outputSchema (required for x402scan)
        outputSchema: {
          input: {
            type: 'request',
            method: 'GET',
            headerFields: {
              'x-veilpay-proof': {
                type: 'string',
                required: false,
                description: 'Optional: ZK proof for private payment (base64 encoded)',
              },
              'x-veilpay-nullifier': {
                type: 'string',
                required: false,
                description: 'Optional: Nullifier hash for private payment',
              },
            },
          },
          output: {
            success: { type: 'boolean', description: 'Whether the request was successful' },
            message: { type: 'string', description: 'Success message' },
            content: {
              type: 'object',
              description: 'Demo content data',
              properties: {
                title: { type: 'string' },
                body: { type: 'string' },
                timestamp: { type: 'string' },
              },
            },
            privacy: {
              type: 'object',
              description: 'Privacy payment information (if ZK proof was used)',
              properties: {
                method: { type: 'string', description: 'Payment method: standard or zk-proof' },
                verified: { type: 'boolean', description: 'Whether ZK proof was verified' },
              },
            },
          },
        },
      },

      // Endpoint 2: Premium Content - 5 USDCx payment
      {
        scheme: 'exact',
        network: 'stacks',
        maxAmountRequired: '5000000', // 5 USDCx
        resource: `${baseUrl}/x402/content/{contentId}`,
        description: 'Access premium content with USDCx payment',
        mimeType: 'application/json',
        payTo: vendorAddress,
        maxTimeoutSeconds: 300,
        asset: 'USDCx',

        outputSchema: {
          input: {
            type: 'request',
            method: 'GET',
            pathParams: {
              contentId: {
                type: 'string',
                required: true,
                description: 'ID of the content to access',
              },
            },
            headerFields: {
              'x-veilpay-proof': {
                type: 'string',
                required: false,
                description: 'Optional: ZK proof for private payment',
              },
              'x-veilpay-nullifier': {
                type: 'string',
                required: false,
                description: 'Optional: Nullifier hash for private payment',
              },
            },
          },
          output: {
            success: { type: 'boolean' },
            contentId: { type: 'string', description: 'ID of the accessed content' },
            content: { type: 'string', description: 'The premium content' },
            payment: {
              type: 'object',
              properties: {
                asset: { type: 'string', description: 'Payment asset (USDCx)' },
                amount: { type: 'string', description: 'Payment amount' },
                method: { type: 'string', description: 'Payment method' },
              },
            },
          },
        },
      },

      // Endpoint 3: Paid API Execution - 0.0001 BTC (sBTC) payment
      {
        scheme: 'exact',
        network: 'stacks',
        maxAmountRequired: '10000', // 0.0001 BTC
        resource: `${baseUrl}/x402/api/execute`,
        description: 'Execute paid API operations with sBTC payment',
        mimeType: 'application/json',
        payTo: vendorAddress,
        maxTimeoutSeconds: 300,
        asset: 'sBTC',

        outputSchema: {
          input: {
            type: 'request',
            method: 'POST',
            bodyType: 'json',
            bodyFields: {
              operation: {
                type: 'string',
                required: true,
                description: 'Operation to execute',
                enum: ['compute', 'analyze', 'transform'],
              },
              params: {
                type: 'object',
                required: true,
                description: 'Parameters for the operation',
              },
            },
            headerFields: {
              'x-veilpay-proof': {
                type: 'string',
                required: false,
                description: 'Optional: ZK proof for private payment',
              },
              'x-veilpay-nullifier': {
                type: 'string',
                required: false,
                description: 'Optional: Nullifier hash for private payment',
              },
            },
          },
          output: {
            success: { type: 'boolean' },
            operation: { type: 'string', description: 'Executed operation' },
            result: {
              type: 'object',
              description: 'Operation result',
            },
            payment: {
              type: 'object',
              properties: {
                asset: { type: 'string', description: 'Payment asset (sBTC)' },
                amount: { type: 'string', description: 'Payment amount' },
                method: { type: 'string', description: 'Payment method' },
              },
            },
          },
        },
      },
    ],
  };

  return schema;
}

export {
  generateX402ScanSchema,
};
