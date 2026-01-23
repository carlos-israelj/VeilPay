import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployTrait() {
  console.log('Deploying USDCx trait to testnet...\n');

  const contractPath = join(__dirname, '..', 'contracts', 'usdcx-trait.clar');
  const codeBody = readFileSync(contractPath, 'utf-8');

  console.log('Trait code loaded from:', contractPath);
  console.log('Trait size:', codeBody.length, 'characters\n');

  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('RELAYER_PRIVATE_KEY not found in .env file');
  }

  try {
    const txOptions = {
      contractName: 'usdcx-trait-v4',
      codeBody,
      senderKey: privateKey,
      network: STACKS_TESTNET,
      anchorMode: AnchorMode.Any,
      fee: 100000n,
    };

    console.log('Creating deployment transaction...');
    const transaction = await makeContractDeploy(txOptions);

    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction({
      transaction,
      network: STACKS_TESTNET
    });

    if (broadcastResponse.error) {
      console.error('❌ Deployment failed!');
      console.error('Error:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      process.exit(1);
    }

    console.log('\n✅ Trait deployed successfully!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('\n🔗 Trait contract: ST2TVNVEDWFBX25NRW8GP6D3WHAXEXGH7T3MBT1T1.usdcx-trait-v4');
    console.log('Explorer: https://explorer.hiro.so/txid/' + broadcastResponse.txid + '?chain=testnet');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

deployTrait();
