// Deploy script for VeilPay x402 Multi-Asset contracts
// Deploys: veilpay-usdcx.clar, veilpay-sbtc.clar

import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const NETWORK = process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
const network = NETWORK === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const senderAddress = getAddressFromPrivateKey(
  privateKey,
  NETWORK === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet
);

console.log(`🚀 VeilPay x402 Multi-Asset Deployment`);
console.log(`Network: ${NETWORK}`);
console.log(`Deployer: ${senderAddress}\n`);

// Deploy a single contract
async function deployContract(contractName, contractPath) {
  console.log(`📝 Deploying ${contractName}...`);

  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const txOptions = {
    contractName: contractName,
    codeBody: codeBody,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractDeploy(txOptions);

  try {
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      console.error(`❌ Error deploying ${contractName}:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return null;
    }

    console.log(`✅ ${contractName} deployed!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Contract: ${senderAddress}.${contractName}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK}\n`);

    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    return null;
  }
}

// Main deployment flow
async function deployAll() {
  const results = {
    usdcx: null,
    sbtc: null,
  };

  // Deploy USDCx pool
  results.usdcx = await deployContract(
    'veilpay-usdcx',
    './veilpay-usdcx.clar'
  );

  // Wait a bit between deploys to avoid nonce issues
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Deploy sBTC pool
  results.sbtc = await deployContract(
    'veilpay-sbtc',
    './veilpay-sbtc.clar'
  );

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Deployment Summary`);
  console.log(`${'='.repeat(60)}`);
  console.log(`USDCx Pool: ${results.usdcx ? '✅' : '❌'} ${results.usdcx || 'Failed'}`);
  console.log(`sBTC Pool:  ${results.sbtc ? '✅' : '❌'} ${results.sbtc || 'Failed'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: NETWORK,
    deployer: senderAddress,
    timestamp: new Date().toISOString(),
    contracts: {
      'veilpay-usdcx': {
        address: `${senderAddress}.veilpay-usdcx`,
        txid: results.usdcx,
      },
      'veilpay-sbtc': {
        address: `${senderAddress}.veilpay-sbtc`,
        txid: results.sbtc,
      },
    },
  };

  fs.writeFileSync(
    `./deployments/x402-${NETWORK}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment info saved to ./deployments/\n`);

  // Next steps
  console.log(`🔧 Next Steps:`);
  console.log(`1. Initialize contracts with relayer public key:`);
  console.log(`   (contract-call? .veilpay-usdcx initialize <relayer-pubkey>)`);
  console.log(`   (contract-call? .veilpay-sbtc initialize <relayer-pubkey>)`);
  console.log(`\n2. Update relayer .env with contract addresses`);
  console.log(`\n3. Start relayer to begin indexing deposit events`);
  console.log(`\n4. Register on x402scan: https://scan.stacksx402.com\n`);
}

// Run deployment
deployAll().catch(console.error);
