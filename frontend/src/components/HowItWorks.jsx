export default function HowItWorks() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-[#9656D6] bg-opacity-10 p-6 rounded-2xl border border-[#9656D6] border-opacity-30">
        <h3 className="text-[#9656D6] font-bold text-lg mb-2">Zero-Knowledge Privacy Protocol</h3>
        <p className="text-[#353945] text-sm">
          VeilPay uses ZK-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge)
          to enable completely private USDCx transfers on the Stacks blockchain.
        </p>
      </div>

      {/* Main Flow */}
      <div className="grid grid-cols-1 gap-6">
        {/* Step 1: Bridge */}
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3772FF] flex items-center justify-center flex-shrink-0">
              <span className="text-[#FBFCFC] text-lg font-bold">1</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#22262E] text-lg font-bold mb-2">Bridge USDC from Ethereum</h4>
              <p className="text-[#777E90] text-sm mb-3">
                Transfer USDC from Ethereum Sepolia to Stacks testnet using Circle's xReserve protocol.
              </p>
              <ul className="space-y-2 text-[#353945] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Connect your Ethereum wallet (MetaMask, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Approve USDC spending and deposit to bridge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Wait ~18 minutes for USDCx to arrive on Stacks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2: Deposit */}
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3772FF] flex items-center justify-center flex-shrink-0">
              <span className="text-[#FBFCFC] text-lg font-bold">2</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#22262E] text-lg font-bold mb-2">Make a Private Deposit</h4>
              <p className="text-[#777E90] text-sm mb-3">
                Lock your USDCx in the privacy pool with a cryptographic commitment.
              </p>
              <ul className="space-y-2 text-[#353945] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Enter the amount of USDCx to deposit (minimum 1 USDCx)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>A random <strong>secret</strong> and <strong>nonce</strong> are generated in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Your deposit creates a commitment: <code className="bg-[#E5E8EB] px-2 py-1 rounded text-xs font-mono">Poseidon(secret, amount, nonce)</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF466F] font-bold">⚠</span>
                  <span><strong className="text-[#EF466F]">SAVE YOUR SECRET AND NONCE!</strong> You'll need them to withdraw.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3: Wait */}
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3772FF] flex items-center justify-center flex-shrink-0">
              <span className="text-[#FBFCFC] text-lg font-bold">3</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#22262E] text-lg font-bold mb-2">Break the Link (Optional)</h4>
              <p className="text-[#777E90] text-sm mb-3">
                For maximum privacy, wait before withdrawing. The longer you wait, the harder it is to link your deposit to your withdrawal.
              </p>
              <ul className="space-y-2 text-[#353945] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>Your funds are mixed with other deposits in the privacy pool</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>The relayer indexes your commitment into a Merkle tree</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3772FF] font-bold">•</span>
                  <span>More deposits = stronger anonymity set</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 4: Withdraw */}
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#45B26A] flex items-center justify-center flex-shrink-0">
              <span className="text-[#FBFCFC] text-lg font-bold">4</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#22262E] text-lg font-bold mb-2">Withdraw to Any Address</h4>
              <p className="text-[#777E90] text-sm mb-3">
                Prove you own a deposit without revealing which one, and withdraw to any Stacks address.
              </p>
              <ul className="space-y-2 text-[#353945] text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#45B26A] font-bold">•</span>
                  <span>Enter your saved <strong>secret</strong> and <strong>nonce</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#45B26A] font-bold">•</span>
                  <span>Choose any recipient address (can be different from deposit address)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#45B26A] font-bold">•</span>
                  <span>Your browser generates a ZK proof (~10 seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#45B26A] font-bold">•</span>
                  <span>The relayer verifies the proof and submits the transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#45B26A] font-bold">•</span>
                  <span>USDCx is transferred to the recipient with complete privacy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
        <h4 className="text-[#3772FF] font-bold text-base mb-4">Technical Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="text-[#22262E] font-bold mb-2">Cryptography</h5>
            <ul className="space-y-1 text-[#353945]">
              <li>• ZK-SNARK circuit: Groth16</li>
              <li>• Hash function: Poseidon</li>
              <li>• Merkle tree depth: 20 levels (1M+ deposits)</li>
              <li>• Proof generation: Client-side (browser)</li>
            </ul>
          </div>
          <div>
            <h5 className="text-[#22262E] font-bold mb-2">Privacy Guarantees</h5>
            <ul className="space-y-1 text-[#353945]">
              <li>• Commitment hiding (deposit unlinkable)</li>
              <li>• Nullifier uniqueness (no double-spend)</li>
              <li>• Recipient privacy (withdraw to any address)</li>
              <li>• No metadata leakage (all on-chain)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-[#EF466F] bg-opacity-10 p-6 rounded-2xl border border-[#EF466F] border-opacity-30">
        <h4 className="text-[#EF466F] font-bold text-base mb-2">Security Best Practices</h4>
        <ul className="space-y-2 text-[#353945] text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#EF466F] font-bold">⚠</span>
            <span><strong>Never share your secret or nonce</strong> - Anyone with these can withdraw your deposit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#EF466F] font-bold">⚠</span>
            <span><strong>Backup your credentials securely</strong> - Store secret/nonce in a password manager</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#EF466F] font-bold">⚠</span>
            <span><strong>Use Tor/VPN for maximum privacy</strong> - Your IP address may leak to the relayer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#EF466F] font-bold">⚠</span>
            <span><strong>Wait before withdrawing</strong> - Immediate withdrawals reduce anonymity</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
