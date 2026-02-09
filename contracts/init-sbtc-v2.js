// Initialize veilpay-sbtc-v2 contract
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

// Relayer public key (33 bytes compressed format)
const relayerPublicKeyHex = '02766c878a6820ca322797be7a97c79bdc306c123c73b741b715fb7f8065df75a0';

console.log('🚀 Initializing veilpay-sbtc-v2');
console.log('================================');
console.log('Relayer Public Key:', relayerPublicKeyHex);

async function initialize() {
  const txOptions = {
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    contractName: 'veilpay-sbtc-v2',
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
      console.error(`\n❌ Error:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return;
    }

    console.log(`\n✅ veilpay-sbtc-v2 initialized successfully!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet\n`);

    console.log('🎉 All contracts deployed and initialized!');
    console.log('==========================================');
    console.log('✅ veilpay-usdcx: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-usdcx');
    console.log('✅ veilpay-sbtc-v2: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.veilpay-sbtc-v2\n');
  } catch (error) {
    console.error(`\n❌ Failed:`, error.message);
  }
}

initialize().catch(console.error);
