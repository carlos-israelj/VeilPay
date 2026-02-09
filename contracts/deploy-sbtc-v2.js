// Deploy veilpay-sbtc-v2 with Clarity 2
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const network = STACKS_TESTNET;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const senderAddress = 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1';

console.log('🚀 Deploying veilpay-sbtc-v2 with Clarity 2');
console.log('==========================================');
console.log(`Deployer: ${senderAddress}\n`);

async function deploy() {
  const codeBody = fs.readFileSync('./veilpay-sbtc.clar', 'utf8');

  const txOptions = {
    contractName: 'veilpay-sbtc-v2', // New name to avoid conflict
    codeBody: codeBody,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
    clarityVersion: 2, // CRITICAL: Use Clarity 2 for as-contract support
  };

  console.log('📝 Deploying with Clarity 2...\n');

  try {
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if (broadcastResponse.error) {
      console.error(`❌ Error:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return;
    }

    console.log(`✅ veilpay-sbtc-v2 deployed successfully!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Contract: ${senderAddress}.veilpay-sbtc-v2`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);

    console.log('🔧 Next steps:');
    console.log('1. Wait 15-20 seconds for confirmation');
    console.log('2. Run: node init-sbtc-v2.js\n');
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
  }
}

deploy().catch(console.error);
