import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyProof } from './verifier.js';
import { MerkleTreeManager } from './merkle.js';
import { RelayerSigner } from './signer.js';
import { StacksClient } from './stacks-client.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize services
const merkleTree = new MerkleTreeManager();
const signer = new RelayerSigner(process.env.RELAYER_PRIVATE_KEY);
const stacksClient = new StacksClient(process.env.STACKS_NETWORK || 'testnet');

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
  const { commitment } = req.params;
  try {
    const proof = merkleTree.getProof(commitment);
    res.json({ proof });
  } catch (error) {
    res.status(404).json({ error: 'Commitment not found' });
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

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid ZK proof' });
    }

    // 2. Verify the root matches our current tree
    const currentRoot = merkleTree.getRoot().toString('hex');
    if (root !== currentRoot) {
      return res.status(400).json({
        error: 'Invalid merkle root',
        currentRoot
      });
    }

    // 3. Sign the withdrawal request
    const signature = await signer.signWithdrawal(
      nullifierHash,
      recipient,
      amount,
      root
    );

    // 4. Submit transaction to Stacks
    const txid = await stacksClient.submitWithdrawal({
      nullifierHash,
      recipient,
      amount,
      root,
      signature
    });

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

app.listen(PORT, () => {
  console.log(`VeilPay Relayer running on port ${PORT}`);
  console.log(`Relayer address: ${signer.getAddress()}`);
  console.log(`Current merkle root: ${merkleTree.getRoot().toString('hex')}`);
});
