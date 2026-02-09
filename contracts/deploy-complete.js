// Complete deployment: traits + contracts
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
const senderAddress = 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1'; // Known from previous deploys

console.log('🚀 VeilPay Complete Deployment');
console.log('================================');
console.log(`Deployer: ${senderAddress}\n`);

async function deployContract(contractName, contractPath) {
  console.log(`📝 Deploying ${contractName}...`);

  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const txOptions = {
    contractName: contractName,
    codeBody: codeBody,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
    clarityVersion: 2, // Use Clarity 2 for as-contract support
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if (broadcastResponse.error) {
      console.error(`❌ Error deploying ${contractName}:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return null;
    }

    console.log(`✅ ${contractName} deployed!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Contract: ${senderAddress}.${contractName}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    return null;
  }
}

async function deployAll() {
  const results = {
    sbtcTrait: null,
    veilpaySbtc: null,
  };

  // Step 1: Deploy sbtc-trait (dependency)
  console.log('Step 1: Deploying trait dependency...\n');
  results.sbtcTrait = await deployContract('sbtc-trait', './sbtc-trait.clar');

  if (!results.sbtcTrait) {
    console.error('\n❌ Failed to deploy sbtc-trait. Cannot proceed.\n');
    return;
  }

  // Wait for trait to be confirmed
  console.log('Waiting 10 seconds for trait confirmation...\n');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Step 2: Deploy veilpay-sbtc
  console.log('Step 2: Deploying veilpay-sbtc...\n');
  results.veilpaySbtc = await deployContract('veilpay-sbtc', './veilpay-sbtc.clar');

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Deployment Summary`);
  console.log(`${'='.repeat(60)}`);
  console.log(`sbtc-trait:     ${results.sbtcTrait ? '✅' : '❌'} ${results.sbtcTrait || 'Failed'}`);
  console.log(`veilpay-sbtc:   ${results.veilpaySbtc ? '✅' : '❌'} ${results.veilpaySbtc || 'Failed'}`);
  console.log(`${'='.repeat(60)}\n`);

  if (results.veilpaySbtc) {
    console.log('🔧 Next Step:');
    console.log('Run initialization: node init-final.js\n');
  }
}

deployAll().catch(console.error);
