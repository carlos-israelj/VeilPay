import axios from 'axios';

export class BlockchainIndexer {
  constructor(contractAddress, contractName, network = 'testnet') {
    this.contractAddress = contractAddress;
    this.contractName = contractName;
    this.network = network;

    // Stacks API endpoints
    this.apiUrl = network === 'mainnet'
      ? 'https://api.mainnet.hiro.so'
      : 'https://api.testnet.hiro.so';

    this.lastProcessedBlock = 0;
    this.pollingInterval = null;
  }

  /**
   * Get all deposit events from the contract
   */
  async getDepositEvents() {
    try {
      const url = `${this.apiUrl}/extended/v1/contract/${this.contractAddress}.${this.contractName}/events`;

      console.log(`Fetching events from: ${url}`);

      const response = await axios.get(url, {
        params: {
          limit: 50,
          offset: 0
        }
      });

      const deposits = [];

      if (response.data && response.data.results) {
        for (const event of response.data.results) {
          // Look for print events with deposit data
          if (event.event_type === 'smart_contract_log') {
            try {
              const eventData = event.contract_log.value.repr;

              // Parse the event data (Clarity tuple format)
              // Example: (tuple (event "deposit") (commitment 0x...) (amount u1000000))
              if (eventData.includes('event "deposit"') || eventData.includes("event 'deposit'")) {
                // Extract commitment
                const commitmentMatch = eventData.match(/commitment\s+0x([a-fA-F0-9]+)/);
                const amountMatch = eventData.match(/amount\s+u(\d+)/);
                const commitmentIdMatch = eventData.match(/commitment-id\s+u(\d+)/);

                if (commitmentMatch && amountMatch) {
                  deposits.push({
                    commitment: commitmentMatch[1],
                    amount: parseInt(amountMatch[1]),
                    commitmentId: commitmentIdMatch ? parseInt(commitmentIdMatch[1]) : null,
                    txId: event.tx_id,
                    blockHeight: event.block_height
                  });
                }
              }
            } catch (err) {
              console.error('Error parsing event:', err);
            }
          }
        }
      }

      console.log(`Found ${deposits.length} deposit events`);
      return deposits;

    } catch (error) {
      console.error('Error fetching deposit events:', error.message);
      return [];
    }
  }

  /**
   * Start monitoring for new deposits
   */
  startMonitoring(merkleTree, stacksClient, intervalMs = 30000) {
    console.log(`Starting blockchain monitoring (every ${intervalMs / 1000}s)...`);

    // Initial sync
    this.syncDeposits(merkleTree, stacksClient);

    // Poll for new deposits
    this.pollingInterval = setInterval(async () => {
      await this.syncDeposits(merkleTree, stacksClient);
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped blockchain monitoring');
    }
  }

  /**
   * Sync all deposits to merkle tree
   */
  async syncDeposits(merkleTree, stacksClient) {
    try {
      // Ensure Poseidon is initialized
      await merkleTree.ensureInitialized();

      const deposits = await this.getDepositEvents();

      if (deposits.length === 0) {
        console.log('No deposits found yet');
        return;
      }

      // Sort by commitment ID (or block height)
      deposits.sort((a, b) => {
        if (a.commitmentId !== null && b.commitmentId !== null) {
          return a.commitmentId - b.commitmentId;
        }
        return a.blockHeight - b.blockHeight;
      });

      let needsUpdate = false;

      // Add new commitments to tree
      for (const deposit of deposits) {
        // Check if already in tree
        const currentLeaves = merkleTree.leaves;
        if (!currentLeaves.includes(deposit.commitment)) {
          console.log(`Adding commitment: ${deposit.commitment.substring(0, 16)}... (${deposit.amount / 1000000} USDCx)`);
          merkleTree.addLeaf(deposit.commitment);
          needsUpdate = true;
        }
      }

      // Update contract root if tree changed
      if (needsUpdate) {
        const newRoot = merkleTree.getRoot().toString('hex');
        console.log(`New merkle root: ${newRoot.substring(0, 16)}...`);
        console.log(`Total commitments in tree: ${merkleTree.getLeafCount()}`);

        // Update root on contract
        try {
          console.log('Updating root on contract...');
          const txId = await stacksClient.updateRoot(newRoot);
          console.log(`Root update transaction: ${txId}`);
        } catch (err) {
          console.error('Error updating root on contract:', err.message);
        }
      } else {
        console.log(`Merkle tree up to date (${merkleTree.getLeafCount()} commitments)`);
      }

    } catch (error) {
      console.error('Error syncing deposits:', error.message);
      console.error('Full error:', error);
      console.error('Stack trace:', error.stack);
    }
  }
}
