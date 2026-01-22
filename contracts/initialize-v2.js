import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  bufferCV,
  pubKeyfromPrivKey
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

// Your private key from the wallet
const PRIVATE_KEY = '866b46266fb30bf7a97ed3b2f03774d7d30736ba49d46d7cd1846dfc62cf190f01';
const CONTRACT_ADDRESS = 'ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1';
const CONTRACT_NAME = 'veilpay-v2';

const network = new StacksTestnet();

async function initializeContract() {
  console.log('🔧 Initializing VeilPay v2 Contract');
  console.log('===================================\n');

  // Get public key from private key
  const publicKey = pubKeyfromPrivKey(PRIVATE_KEY);
  console.log('Relayer public key:', publicKey.data.toString('hex'));
  console.log('Public key length:', publicKey.data.length, 'bytes\n');

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'initialize',
    functionArgs: [
      bufferCV(publicKey.data)
    ],
    senderKey: PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000n,
  };

  try {
    console.log('Calling initialize function...');
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    if (broadcastResponse.error) {
      console.error('❌ Error initializing contract:', broadcastResponse);
      if (broadcastResponse.reason) {
        console.error('Reason:', broadcastResponse.reason);
      }
      if (broadcastResponse.reason_data) {
        console.error('Reason data:', JSON.stringify(broadcastResponse.reason_data, null, 2));
      }
      process.exit(1);
    }

    console.log('✅ Contract initialized!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log(`View on explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log('\n⏳ Wait ~30 seconds for transaction to confirm before using the contract.');

  } catch (error) {
    console.error('❌ Exception initializing contract:', error.message);
    process.exit(1);
  }
}

initializeContract().catch(console.error);
