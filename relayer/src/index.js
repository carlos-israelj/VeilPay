import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyProof } from './verifier.js';
import { MerkleTreeManager } from './merkle.js';
import { RelayerSigner } from './signer.js';
import { StacksClient } from './stacks-client.js';
import { BlockchainIndexer } from './indexer.js';

dotenv.config();

const app = express();

// CORS configuration - allow requests from frontend
const allowedOrigins = [
  'http://localhost:3000',     // Local development
  'http://localhost:3003',     // Alternative local port
  'https://veilpay.lat',       // Production domain
  'http://veilpay.lat',        // Production domain (HTTP)
  'https://veilpay-vercel-git-main-carlos-jimenezs-projects-4cf212e4.vercel.app', // Vercel deployment
  /\.vercel\.app$/             // Any Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or matches regex
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize services
const merkleTree = new MerkleTreeManager();
const signer = new RelayerSigner(process.env.RELAYER_PRIVATE_KEY);
const stacksClient = new StacksClient(process.env.STACKS_NETWORK || 'testnet');
const indexer = new BlockchainIndexer(
  process.env.CONTRACT_ADDRESS,
  process.env.CONTRACT_NAME,
  process.env.STACKS_NETWORK || 'testnet'
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'veilpay-relayer' });
});

// Get current merkle root
app.get('/root', (req, res) => {
  const root = merkleTree.getRoot();
  res.json({ root: root.toString('hex') });
});

// Get merkle proof for a commitment
app.get('/proof/:commitment', (req, res) => {
  let { commitment } = req.params;
  console.log('Proof request for commitment:', commitment);

  // Ensure commitment is 64 characters (pad with zeros if needed)
  commitment = commitment.padStart(64, '0');
  console.log('Padded commitment:', commitment);
  console.log('Available leaves:', merkleTree.leaves);

  try {
    const proof = merkleTree.getProof(commitment);
    res.json({ proof });
  } catch (error) {
    console.error('Error getting proof:', error.message);
    res.status(404).json({ error: 'Commitment not found', leaves: merkleTree.leaves });
  }
});

// Submit a withdrawal request
app.post('/withdraw', async (req, res) => {
  try {
    const {
      proof,
      publicSignals,
      nullifierHash,
      recipient,
      amount,
      root
    } = req.body;

    // 1. Verify the ZK proof
    console.log('Verifying ZK proof...');
    const isValid = await verifyProof(proof, publicSignals);
    console.log('Proof verification result:', isValid);

    if (!isValid) {
      console.log('Proof verification failed!');
      return res.status(400).json({ error: 'Invalid ZK proof' });
    }

    // 2. Verify the root matches our current tree
    const currentRoot = merkleTree.getRoot().toString('hex');
    console.log('Current root:', currentRoot);
    console.log('Provided root:', root);

    if (root !== currentRoot) {
      console.log('Root mismatch!');
      return res.status(400).json({
        error: 'Invalid merkle root',
        currentRoot
      });
    }

    // 3. Sign the withdrawal request
    console.log('Signing withdrawal...');

    // Convert nullifierHash from decimal string to hex if needed
    let nullifierHashHex = nullifierHash;
    if (typeof nullifierHash === 'string' && nullifierHash.length !== 64) {
      nullifierHashHex = BigInt(nullifierHash).toString(16).padStart(64, '0');
      console.log('[INDEX] Converted nullifierHash for signing:', nullifierHashHex);
    }

    const { messageHash, signature } = await signer.signWithdrawal(
      nullifierHashHex,
      recipient,
      amount,
      root
    );
    console.log('Message hash:', messageHash.substring(0, 20) + '...');
    console.log('Signature generated:', signature.substring(0, 20) + '...');

    // 4. Submit transaction to Stacks
    console.log('Submitting transaction to Stacks...');
    const txid = await stacksClient.submitWithdrawal({
      nullifierHash,
      recipient,
      amount,
      root,
      messageHash,
      signature
    });
    console.log('Transaction submitted! TxID:', txid);

    res.json({
      success: true,
      txid,
      message: 'Withdrawal submitted successfully'
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to receive deposit events from Stacks
app.post('/deposit-event', async (req, res) => {
  try {
    const { commitment, amount, commitmentId } = req.body;

    console.log(`New deposit: commitment=${commitment}, amount=${amount}`);

    // Add commitment to merkle tree
    merkleTree.addLeaf(commitment);

    // Update root on-chain
    const newRoot = merkleTree.getRoot().toString('hex');
    await stacksClient.updateRoot(newRoot);

    res.json({ success: true, newRoot });
  } catch (error) {
    console.error('Deposit event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get relayer stats
app.get('/stats', (req, res) => {
  res.json({
    totalDeposits: merkleTree.getLeafCount(),
    currentRoot: merkleTree.getRoot().toString('hex'),
    relayerAddress: signer.getAddress()
  });
});

app.listen(PORT, async () => {
  console.log(`VeilPay Relayer running on port ${PORT}`);
  console.log(`Relayer address: ${signer.getAddress()}`);
  console.log(`Contract: ${process.env.CONTRACT_ADDRESS}.${process.env.CONTRACT_NAME}`);

  // Wait for Poseidon to initialize
  console.log('Initializing Poseidon...');
  await merkleTree.ensureInitialized();

  // Start blockchain indexer
  console.log('Starting blockchain indexer...');
  indexer.startMonitoring(merkleTree, stacksClient, 30000); // Poll every 30 seconds
});
