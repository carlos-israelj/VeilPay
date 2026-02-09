// Initialize only veilpay-sbtc contract
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  Cl,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import dotenv from 'dotenv';

dotenv.config();

const network = STACKS_TESTNET;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

// Relayer public key
const relayerPublicKeyHex = '02766c878a6820ca322797be7a97c79bdc306c123c73b741b715fb7f8065df75a0';

console.log('🚀 Initializing veilpay-sbtc');
console.log('================================');
console.log('Relayer Public Key:', relayerPublicKeyHex);

async function initialize() {
  const txOptions = {
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    contractName: 'veilpay-sbtc',
    functionName: 'initialize',
    functionArgs: [Cl.buffer(Buffer.from(relayerPublicKeyHex, 'hex'))],
    senderKey: privateKey,
    network: network,
    anchorMode: AnchorMode.Any,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction({ transaction, network });

    if (broadcastResponse.error) {
      console.error(`❌ Error:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return;
    }

    console.log(`✅ veilpay-sbtc initialized!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);
  } catch (error) {
    console.error(`❌ Failed:`, error.message);
  }
}

initialize().catch(console.error);
