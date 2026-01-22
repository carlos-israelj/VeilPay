import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your private key from the wallet
const PRIVATE_KEY = '866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01';

const network = new StacksTestnet();

async function deployContract(contractName, contractPath) {
  const contractCode = fs.readFileSync(contractPath, 'utf8');

  console.log(`\n📝 Deploying ${contractName}...`);
  console.log(`Contract code length: ${contractCode.length} bytes`);

  const txOptions = {
    contractName,
    codeBody: contractCode,
    senderKey: PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 50000n, // 0.05 STX
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      console.error(`❌ Error deploying ${contractName}:`, broadcastResponse);
      if (broadcastResponse.reason) {
        console.error('Reason:', broadcastResponse.reason);
      }
      if (broadcastResponse.reason_data) {
        console.error('Reason data:', JSON.stringify(broadcastResponse.reason_data, null, 2));
      }
      return null;
    }

    console.log(`✅ ${contractName} deployed!`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`View on explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);

    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Exception deploying ${contractName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 VeilPay Contract Deployment v2');
  console.log('=================================\n');
  console.log('Network: Stacks Testnet');
  console.log('Deployer: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1\n');

  // Deploy main contract with new name (v2)
  const contractPath = path.join(__dirname, 'veilpay.clar');
  const contractTxid = await deployContract('veilpay-v2', contractPath);

  if (!contractTxid) {
    console.error('\n❌ Failed to deploy contract.');
    process.exit(1);
  }

  console.log('\n✅ Contract deployed successfully!');
  console.log('\n📋 Update your .env files with:');
  console.log('CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1');
  console.log('CONTRACT_NAME=veilpay-v2');
  console.log('\nFrontend .env:');
  console.log('VITE_CONTRACT_ADDRESS=ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1');
  console.log('VITE_CONTRACT_NAME=veilpay-v2');
}

main().catch(console.error);
