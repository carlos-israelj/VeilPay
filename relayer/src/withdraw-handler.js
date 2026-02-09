// VeilPay Multi-Asset Withdrawal Handler
// Processes withdrawals from STX, USDCx, and sBTC privacy pools

import { verifyProof } from './verifier.js';
import { getMerkleTreeForAsset, getAssetConfig, getContractAddress, getTokenContract } from './multi-asset.js';
import { RelayerSigner } from './signer.js';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Cl,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

/**
 * Process a withdrawal request
 * Verifies ZK proof, constructs withdrawal transaction, and broadcasts to Stacks
 *
 * @param {object} params - Withdrawal parameters
 * @param {string} params.nullifierHash - Nullifier hash (prevents double-spend)
 * @param {string} params.recipient - Recipient Stacks address
 * @param {number|string} params.amount - Amount in micro-units
 * @param {string} params.asset - Asset type (STX, USDCx, sBTC)
 * @param {string} params.root - Merkle root
 * @param {object} params.proof - ZK proof (optional, if not verified yet)
 * @param {array} params.publicSignals - Public signals (optional)
 * @returns {object} Result with success status and txid
 */
async function processWithdrawal(params) {
  const {
    nullifierHash,
    recipient,
    amount,
    asset,
    root,
    proof,
    publicSignals,
  } = params;

  console.log(`[Withdraw] Processing ${asset} withdrawal...`);
  console.log(`[Withdraw] Recipient: ${recipient}`);
  console.log(`[Withdraw] Amount: ${amount}`);
  console.log(`[Withdraw] Nullifier: ${nullifierHash.substring(0, 16)}...`);

  try {
    // 1. Verify ZK proof (if provided)
    if (proof && publicSignals) {
      console.log('[Withdraw] Verifying ZK proof...');
      const isValid = await verifyProof(proof, publicSignals);

      if (!isValid) {
        return {
          success: false,
          error: 'ZK proof verification failed',
          details: 'Proof is invalid',
        };
      }
      console.log('[Withdraw] ZK proof valid ✅');
    }

    // 2. Verify nullifier hasn't been used
    const nullifierUsed = await checkNullifierUsed(nullifierHash, asset);
    if (nullifierUsed) {
      return {
        success: false,
        error: 'Nullifier already used',
        details: 'This withdrawal has already been processed',
      };
    }

    // 3. Verify root is valid
    const rootValid = await verifyRoot(root, asset);
    if (!rootValid) {
      return {
        success: false,
        error: 'Invalid Merkle root',
        details: 'Root does not match current state',
      };
    }

    // 4. Create relayer signature
    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    const signer = new RelayerSigner(privateKey);

    const { messageHash, signature } = await signer.signWithdrawal(
      nullifierHash.startsWith('0x') ? nullifierHash.slice(2) : nullifierHash,
      recipient,
      amount,
      root.startsWith('0x') ? root.slice(2) : root
    );

    console.log('[Withdraw] Relayer signature created ✅');

    // 5. Construct and broadcast withdrawal transaction
    const txid = await broadcastWithdrawal({
      nullifierHash,
      recipient,
      amount,
      asset,
      root,
      messageHash,
      signature,
    });

    console.log(`[Withdraw] Transaction broadcast: ${txid} ✅`);

    return {
      success: true,
      txid,
      message: 'Withdrawal processed successfully',
    };

  } catch (error) {
    console.error('[Withdraw] Error:', error);
    return {
      success: false,
      error: 'Withdrawal processing failed',
      details: error.message,
    };
  }
}

/**
 * Check if nullifier has been used
 */
async function checkNullifierUsed(nullifierHash, asset) {
  // In-memory check (in production, also check on-chain)
  if (!global.usedNullifiers) {
    global.usedNullifiers = {};
  }
  if (!global.usedNullifiers[asset]) {
    global.usedNullifiers[asset] = [];
  }

  const isUsed = global.usedNullifiers[asset].includes(nullifierHash);

  // TODO: Also check on-chain via read-only function call
  // const contract = getContractAddress(asset, network);
  // const result = await callReadOnly('is-nullifier-used', [bufferCV(nullifierHash)]);

  return isUsed;
}

/**
 * Verify Merkle root is valid
 */
async function verifyRoot(root, asset) {
  // Check if root matches current Merkle tree root
  // (In production, also verify root exists in valid-roots map on-chain)

  const merkleManagers = global.merkleManagers;
  if (!merkleManagers || !merkleManagers[asset]) {
    console.error(`[Withdraw] Merkle tree not initialized for ${asset}`);
    return false;
  }

  const currentRoot = merkleManagers[asset].root().toString('hex');
  const cleanRoot = root.startsWith('0x') ? root.slice(2) : root;

  return currentRoot === cleanRoot;
}

/**
 * Broadcast withdrawal transaction to Stacks
 */
async function broadcastWithdrawal(params) {
  const {
    nullifierHash,
    recipient,
    amount,
    asset,
    root,
    messageHash,
    signature,
  } = params;

  const network = process.env.STACKS_NETWORK === 'mainnet'
    ? STACKS_MAINNET
    : STACKS_TESTNET;

  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  const config = getAssetConfig(asset);

  // Parse contract address
  const contractAddress = getContractAddress(asset, process.env.STACKS_NETWORK || 'testnet');
  const [contractAddr, contractName] = contractAddress.split('.');

  // Convert nullifier to buffer (remove 0x prefix if present)
  const nullifierBuffer = Buffer.from(
    nullifierHash.startsWith('0x') ? nullifierHash.slice(2) : nullifierHash,
    'hex'
  );

  // Convert root to buffer
  const rootBuffer = Buffer.from(
    root.startsWith('0x') ? root.slice(2) : root,
    'hex'
  );

  // Convert message hash to buffer
  const messageHashBuffer = Buffer.from(messageHash);

  // Function arguments
  const functionArgs = [
    Cl.buffer(nullifierBuffer),           // nullifier-hash
    Cl.principal(recipient),              // recipient
    Cl.uint(amount),                      // amount
    Cl.buffer(rootBuffer),                // root
    Cl.buffer(messageHashBuffer),         // message-hash
    Cl.buffer(signature),                 // relayer-signature
  ];

  // Add token contract argument if this is a token withdrawal
  if (config.isToken) {
    const tokenContract = getTokenContract(asset, process.env.STACKS_NETWORK || 'testnet');
    const [tokenAddr, tokenName] = tokenContract.split('.');
    functionArgs.push(Cl.contractPrincipal(tokenAddr, tokenName));
  }

  const txOptions = {
    contractAddress: contractAddr,
    contractName: contractName,
    functionName: 'withdraw',
    functionArgs: functionArgs,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow, // Allow token transfers
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if (broadcastResponse.error) {
    throw new Error(`Transaction broadcast failed: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
  }

  // Mark nullifier as used in memory
  if (!global.usedNullifiers[asset]) {
    global.usedNullifiers[asset] = [];
  }
  global.usedNullifiers[asset].push(nullifierHash);

  return broadcastResponse.txid;
}

/**
 * Get withdrawal history for an asset
 * (In production, query from database)
 */
function getWithdrawalHistory(asset, limit = 10) {
  if (!global.withdrawalHistory) {
    global.withdrawalHistory = {};
  }
  if (!global.withdrawalHistory[asset]) {
    global.withdrawalHistory[asset] = [];
  }

  return global.withdrawalHistory[asset].slice(-limit);
}

/**
 * Record withdrawal in history
 */
function recordWithdrawal(asset, withdrawal) {
  if (!global.withdrawalHistory) {
    global.withdrawalHistory = {};
  }
  if (!global.withdrawalHistory[asset]) {
    global.withdrawalHistory[asset] = [];
  }

  global.withdrawalHistory[asset].push({
    ...withdrawal,
    timestamp: new Date().toISOString(),
  });
}

export {
  processWithdrawal,
  checkNullifierUsed,
  verifyRoot,
  broadcastWithdrawal,
  getWithdrawalHistory,
  recordWithdrawal,
};
