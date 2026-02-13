import pkg from '@stacks/transactions';
const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = pkg;
import networkPkg from '@stacks/network';
const { STACKS_TESTNET } = networkPkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your private key from the wallet
const PRIVATE_KEY = '866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01';

const network = STACKS_TESTNET;

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
    console.log('Creating transaction...');
    const transaction = await makeContractDeploy(txOptions);
    console.log('Transaction created successfully');
    console.log('Broadcasting to network:', network.client.baseUrl);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

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
  console.log('🚀 VeilPay-STX Contract Deployment');
  console.log('===================================\n');
  console.log('Network: Stacks Testnet');
  console.log('Deployer: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1\n');

  // Deploy veilpay-stx contract (no trait needed, native STX)
  const contractPath = path.join(__dirname, 'veilpay-stx.clar');
  const contractTxid = await deployContract('veilpay-stx', contractPath);

  if (!contractTxid) {
    console.error('\n❌ Failed to deploy veilpay-stx contract.');
    process.exit(1);
  }

  console.log('\n✅ veilpay-stx deployed successfully!');
  console.log('\n📋 Contract deployed at:');
  console.log('ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-stx');
  console.log('\n⚠️  Next steps:');
  console.log('1. Wait ~2 minutes for transaction to confirm');
  console.log('2. Initialize contract with relayer public key');
  console.log('3. Test STX deposits in frontend');
}

main().catch(console.error);
