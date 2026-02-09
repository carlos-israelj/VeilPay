// Initialize VeilPay x402 contracts with relayer public key
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
// Derived from private key: 866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01
const relayerPublicKeyHex = '02766c878a6820ca322797be7a97c79bdc306c123c73b741b715fb7f8065df75a0';

console.log('\n🚀 VeilPay x402 Contract Initialization');
console.log('========================================');
console.log('Relayer Public Key:', relayerPublicKeyHex);

const contracts = ['veilpay-usdcx', 'veilpay-sbtc'];

async function initializeContract(contractName) {
  console.log(`\n📝 Initializing ${contractName}...`);

  const txOptions = {
    contractAddress: 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1',
    contractName: contractName,
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
      console.error(`❌ Error initializing ${contractName}:`, broadcastResponse.error);
      console.error(`   Reason: ${broadcastResponse.reason}`);
      return null;
    }

    console.log(`✅ ${contractName} initialized!`);
    console.log(`   TX ID: ${broadcastResponse.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    return broadcastResponse.txid;
  } catch (error) {
    console.error(`❌ Failed to initialize ${contractName}:`, error.message);
    return null;
  }
}

async function initializeAll() {
  for (const contractName of contracts) {
    await initializeContract(contractName);
    // Wait 3 seconds between transactions to avoid nonce issues
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n========================================');
  console.log('✅ Initialization complete!');
  console.log('========================================\n');
}

initializeAll().catch(console.error);
