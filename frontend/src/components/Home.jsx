export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#9656D6] to-[#3772FF] bg-opacity-10 p-8 rounded-2xl border border-[#9656D6] border-opacity-30">
        <h2 className="text-[#22262E] text-3xl font-bold mb-3">
          Welcome to VeilPay
        </h2>
        <p className="text-[#353945] text-base leading-relaxed mb-4">
          The first Zero-Knowledge privacy protocol for USDCx transfers on Stacks blockchain.
          Send and receive USDCx with complete anonymity using cutting-edge cryptography.
        </p>
        <div className="flex items-center gap-2 text-[#9656D6]">
          <span className="text-2xl">🔒</span>
          <span className="font-bold text-sm">Privacy-First | Zero-Knowledge | Decentralized</span>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB] hover:border-[#3772FF] transition">
          <div className="w-14 h-14 rounded-full bg-[#3772FF] bg-opacity-10 flex items-center justify-center mb-4">
            <span className="text-3xl">🎭</span>
          </div>
          <h3 className="text-[#22262E] text-lg font-bold mb-2">Complete Anonymity</h3>
          <p className="text-[#777E90] text-sm leading-relaxed">
            Break the link between deposits and withdrawals. No one can trace your transactions,
            not even the relayer or smart contract.
          </p>
        </div>

        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB] hover:border-[#3772FF] transition">
          <div className="w-14 h-14 rounded-full bg-[#9656D6] bg-opacity-10 flex items-center justify-center mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-[#22262E] text-lg font-bold mb-2">ZK-SNARK Proofs</h3>
          <p className="text-[#777E90] text-sm leading-relaxed">
            Powered by Groth16 Zero-Knowledge proofs. Prove you own a deposit without revealing
            which one, all computed in your browser.
          </p>
        </div>

        <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB] hover:border-[#3772FF] transition">
          <div className="w-14 h-14 rounded-full bg-[#45B26A] bg-opacity-10 flex items-center justify-center mb-4">
            <span className="text-3xl">🌐</span>
          </div>
          <h3 className="text-[#22262E] text-lg font-bold mb-2">Withdraw Anywhere</h3>
          <p className="text-[#777E90] text-sm leading-relaxed">
            Send your USDCx to any Stacks address. Your withdrawal address is completely
            unlinkable from your deposit.
          </p>
        </div>
      </div>

      {/* How VeilPay Works - Quick Overview */}
      <div className="bg-[#FBFCFC] border-2 border-[#E5E8EB] rounded-2xl p-8">
        <h3 className="text-[#22262E] text-2xl font-bold mb-6 text-center">
          How VeilPay Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#3772FF] flex items-center justify-center mb-4">
                <span className="text-[#FBFCFC] text-2xl font-bold">1</span>
              </div>
              <h4 className="text-[#22262E] font-bold mb-2">Bridge USDC</h4>
              <p className="text-[#777E90] text-sm">
                Transfer USDC from Ethereum to Stacks using Circle's xReserve
              </p>
            </div>
            <div className="hidden md:block absolute top-8 -right-3 text-[#E5E8EB] text-4xl">
              →
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#3772FF] flex items-center justify-center mb-4">
                <span className="text-[#FBFCFC] text-2xl font-bold">2</span>
              </div>
              <h4 className="text-[#22262E] font-bold mb-2">Deposit USDCx</h4>
              <p className="text-[#777E90] text-sm">
                Lock your USDCx with a cryptographic commitment
              </p>
            </div>
            <div className="hidden md:block absolute top-8 -right-3 text-[#E5E8EB] text-4xl">
              →
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#3772FF] flex items-center justify-center mb-4">
                <span className="text-[#FBFCFC] text-2xl font-bold">3</span>
              </div>
              <h4 className="text-[#22262E] font-bold mb-2">Wait (Optional)</h4>
              <p className="text-[#777E90] text-sm">
                Let your funds mix with others for stronger privacy
              </p>
            </div>
            <div className="hidden md:block absolute top-8 -right-3 text-[#E5E8EB] text-4xl">
              →
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#45B26A] flex items-center justify-center mb-4">
              <span className="text-[#FBFCFC] text-2xl font-bold">✓</span>
            </div>
            <h4 className="text-[#22262E] font-bold mb-2">Withdraw</h4>
            <p className="text-[#777E90] text-sm">
              Prove ownership and withdraw to any address anonymously
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#3772FF] to-[#2C5CE6] p-6 rounded-2xl text-white">
          <div className="text-4xl font-bold mb-2">ZK-SNARKs</div>
          <p className="text-sm opacity-90">Groth16 proving system</p>
        </div>
        <div className="bg-gradient-to-br from-[#9656D6] to-[#7B3FB8] p-6 rounded-2xl text-white">
          <div className="text-4xl font-bold mb-2">Poseidon</div>
          <p className="text-sm opacity-90">SNARK-friendly hash function</p>
        </div>
        <div className="bg-gradient-to-br from-[#45B26A] to-[#38935A] p-6 rounded-2xl text-white">
          <div className="text-4xl font-bold mb-2">20 Levels</div>
          <p className="text-sm opacity-90">Merkle tree depth (1M+ deposits)</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
        <h3 className="text-[#3772FF] font-bold text-xl mb-4">Ready to Get Started?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FBFCFC] p-5 rounded-xl border border-[#E5E8EB]">
            <h4 className="text-[#22262E] font-bold mb-2 flex items-center gap-2">
              <span className="text-[#3772FF]">1.</span> New to VeilPay?
            </h4>
            <p className="text-[#777E90] text-sm mb-3">
              Learn how the protocol works and understand the privacy guarantees.
            </p>
            <div className="flex gap-2">
              <a
                href="#how-it-works"
                className="text-[#3772FF] text-sm font-bold hover:underline"
              >
                How it Works →
              </a>
              <span className="text-[#E5E8EB]">|</span>
              <a
                href="#faq"
                className="text-[#3772FF] text-sm font-bold hover:underline"
              >
                FAQ →
              </a>
            </div>
          </div>

          <div className="bg-[#FBFCFC] p-5 rounded-xl border border-[#E5E8EB]">
            <h4 className="text-[#22262E] font-bold mb-2 flex items-center gap-2">
              <span className="text-[#45B26A]">2.</span> Ready to Use?
            </h4>
            <p className="text-[#777E90] text-sm mb-3">
              Get testnet USDCx and start making private transfers today.
            </p>
            <div className="flex gap-2">
              <a
                href="#bridge"
                className="text-[#3772FF] text-sm font-bold hover:underline"
              >
                Bridge USDC →
              </a>
              <span className="text-[#E5E8EB]">|</span>
              <a
                href="#deposit"
                className="text-[#3772FF] text-sm font-bold hover:underline"
              >
                Make Deposit →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-[#EF466F] bg-opacity-10 p-6 rounded-2xl border border-[#EF466F] border-opacity-30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-[#EF466F] font-bold text-base mb-2">Testnet Only - Educational Purpose</h4>
            <p className="text-[#353945] text-sm leading-relaxed">
              VeilPay is currently deployed on <strong>Stacks testnet</strong> for testing and educational purposes.
              Do NOT use real funds. This is an experimental protocol demonstrating Zero-Knowledge privacy techniques.
              Always backup your secret and nonce securely - they cannot be recovered if lost.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-[#F4F5F6] p-6 rounded-2xl border border-[#E5E8EB]">
        <h3 className="text-[#22262E] text-lg font-bold mb-4">Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-[#22262E] font-bold text-sm">Circom</div>
            <div className="text-[#777E90] text-xs">ZK Circuits</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🔐</div>
            <div className="text-[#22262E] font-bold text-sm">Groth16</div>
            <div className="text-[#777E90] text-xs">Proof System</div>
          </div>
          <div>
            <div className="text-2xl mb-2">📜</div>
            <div className="text-[#22262E] font-bold text-sm">Clarity</div>
            <div className="text-[#777E90] text-xs">Smart Contracts</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🌉</div>
            <div className="text-[#22262E] font-bold text-sm">xReserve</div>
            <div className="text-[#777E90] text-xs">Bridge Protocol</div>
          </div>
        </div>
      </div>

      {/* Open Source */}
      <div className="bg-[#45B26A] bg-opacity-10 p-6 rounded-2xl border border-[#45B26A] border-opacity-30 text-center">
        <h3 className="text-[#45B26A] font-bold text-lg mb-2">Open Source & Community Driven</h3>
        <p className="text-[#353945] text-sm mb-4">
          VeilPay is fully open source. Contribute, audit, or fork on GitHub.
        </p>
        <a
          href="https://github.com/carlos-israelj/VeilPay"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#22262E] text-[#FBFCFC] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#353945] transition"
        >
          <span>View on GitHub</span>
          <span>→</span>
        </a>
      </div>

      {/* Contact Developer */}
      <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
        <h3 className="text-[#3772FF] font-bold text-lg mb-3 text-center">Get in Touch</h3>
        <p className="text-[#353945] text-sm mb-4 text-center">
          Have questions or want to collaborate? Connect with the developer on social media.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://www.linkedin.com/in/carlos-israelj/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0A66C2] text-[#FBFCFC] px-4 py-2 rounded-full font-bold text-sm hover:bg-[#004182] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
          <a
            href="https://x.com/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#000000] text-[#FBFCFC] px-4 py-2 rounded-full font-bold text-sm hover:bg-[#333333] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
          </a>
          <a
            href="https://t.me/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0088CC] text-[#FBFCFC] px-4 py-2 rounded-full font-bold text-sm hover:bg-[#006699] transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
