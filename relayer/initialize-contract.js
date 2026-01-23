import { makeContractCall, broadcastTransaction, AnchorMode, bufferCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { privateKeyToPublic } from '@stacks/transactions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeContract() {
  console.log('Initializing VeilPay contract...\n');

  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('RELAYER_PRIVATE_KEY not found in .env file');
  }

  // Get public key from private key
  const publicKey = privateKeyToPublic(privateKey);
  console.log('Relayer public key:', publicKey);
  console.log('Public key length:', publicKey.length, 'bytes\n');

  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contractName = process.env.CONTRACT_NAME;

  console.log('Contract:', `${contractAddress}.${contractName}\n`);

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'initialize',
      functionArgs: [
        bufferCV(Buffer.from(publicKey, 'hex'))
      ],
      senderKey: privateKey,
      network: STACKS_TESTNET,
      anchorMode: AnchorMode.Any,
      fee: 100000n, // 0.1 STX fee
    };

    console.log('Creating initialization transaction...');
    const transaction = await makeContractCall(txOptions);

    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: STACKS_TESTNET
    });

    if (broadcastResponse.error) {
      console.error('❌ Initialization failed!');
      console.error('Error:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      if (broadcastResponse.reason_data) {
        console.error('Details:', JSON.stringify(broadcastResponse.reason_data, null, 2));
      }
      process.exit(1);
    }

    console.log('\n✅ Contract initialized successfully!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('\n📝 Next step:');
    console.log('Wait for transaction to confirm (check: https://explorer.hiro.so/txid/' + broadcastResponse.txid + '?chain=testnet)');
    console.log('\nAfter confirmation, the relayer will be able to sign withdrawals.');

  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    process.exit(1);
  }
}

initializeContract();
