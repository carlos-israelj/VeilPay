// Deploy only veilpay-sbtc contract
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const network = new StacksTestnet();
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
const senderAddress = getAddressFromPrivateKey(
  privateKey,
  TransactionVersion.Testnet
);

console.log(`🚀 Deploying veilpay-sbtc`);
console.log(`Deployer: ${senderAddress}\n`);

async function deploy() {
  const codeBody = fs.readFileSync('./veilpay-sbtc.clar', 'utf8');

  const txOptions = {
    contractName: 'veilpay-sbtc',
    codeBody: codeBody,
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractDeploy(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if (broadcastResponse.error) {
    console.error(`❌ Error:`, broadcastResponse.error);
    console.error(`   Reason: ${broadcastResponse.reason}`);
    return;
  }

  console.log(`✅ veilpay-sbtc deployed!`);
  console.log(`   TX ID: ${broadcastResponse.txid}`);
  console.log(`   Contract: ${senderAddress}.veilpay-sbtc`);
  console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);
}

deploy().catch(console.error);
