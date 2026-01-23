import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployContract() {
  console.log('Deploying VeilPay contract to testnet...\n');

  // Read contract source code
  const contractPath = join(__dirname, '..', 'contracts', 'veilpay.clar');
  const codeBody = readFileSync(contractPath, 'utf-8');

  console.log('Contract code loaded from:', contractPath);
  console.log('Contract size:', codeBody.length, 'characters\n');

  // Get private key from environment
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('RELAYER_PRIVATE_KEY not found in .env file');
  }

  console.log('Using private key from .env');
  console.log('Network: testnet\n');

  try {
    // Create contract deploy transaction
    // Using veilpay-v22: Fixed token transfers with as-contract (still supported in Clarity 4)
    const txOptions = {
      contractName: 'veilpay-v22',
      codeBody,
      senderKey: privateKey,
      network: STACKS_TESTNET,
      anchorMode: AnchorMode.Any,
      fee: 200000n, // 0.2 STX fee
    };

    console.log('Creating deployment transaction...');
    const transaction = await makeContractDeploy(txOptions);

    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: STACKS_TESTNET
    });

    if (broadcastResponse.error) {
      console.error('❌ Deployment failed!');
      console.error('Error:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      if (broadcastResponse.reason_data) {
        console.error('Details:', JSON.stringify(broadcastResponse.reason_data, null, 2));
      }
      process.exit(1);
    }

    console.log('\n✅ Contract deployed successfully!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('\n📝 Next steps:');
    console.log('1. Wait for transaction to confirm (check: https://explorer.hiro.so/txid/' + broadcastResponse.txid + '?chain=testnet)');
    console.log('2. Update CONTRACT_NAME in relayer/.env to: veilpay-v22');
    console.log('3. Update VITE_CONTRACT_NAME in frontend/.env to: veilpay-v22');
    console.log('4. Restart the relayer and frontend');
    console.log('\n🔗 Contract will be deployed at: <YOUR_ADDRESS>.veilpay-v19');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

deployContract();
