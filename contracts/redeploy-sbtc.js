// Redeploy veilpay-sbtc with Clarity 2
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

console.log('🚀 Redeploying veilpay-sbtc with Clarity 2');
console.log('==========================================');

async function deploy() {
  const codeBody = fs.readFileSync('./veilpay-sbtc.clar', 'utf8');

  const txOptions = {
    contractName: 'veilpay-sbtc',
    codeBody: codeBody,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
    clarityVersion: 2, // Explicitly use Clarity 2
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if (broadcastResponse.error) {
      console.error(`❌ Error:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return;
    }

    console.log(`✅ veilpay-sbtc deployed!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Contract: ${senderAddress}.veilpay-sbtc`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);

    console.log('🔧 Next step:');
    console.log('Wait 15-20 seconds, then run: node init-sbtc-only.js\n');
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
  }
}

deploy().catch(console.error);
