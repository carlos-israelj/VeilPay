export default function Home() {
  return (
    <div className="space-y-12">
      {/* Welcome Section - Classified Document Aesthetic */}
      <div className="relative border-l-4 border-[#00ff88] pl-6 py-4 bg-[#00ff88]/5 fade-in-up stagger-1">
        <div className="absolute top-0 right-0 text-[#00ff88]/30 text-xs font-mono px-3 py-1 border-l border-b border-[#00ff88]/30">
          CLASSIFIED
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          ZERO-KNOWLEDGE<br/>PRIVACY PROTOCOL
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-3xl">
          VeilPay implements Groth16 ZK-SNARKs for provably anonymous USDCx transfers on Stacks blockchain.
          Break transaction surveillance. No intermediaries can link deposits to withdrawals.
          Cryptographic privacy guarantees secured by Bitcoin finality.
        </p>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ff88] animate-pulse"></div>
          <span className="text-[#00ff88] text-xs font-bold tracking-widest">
            PRIVACY-FIRST · ZERO-KNOWLEDGE · DECENTRALIZED
          </span>
        </div>
      </div>

      {/* Key Features - Terminal Output Style */}
      <div className="fade-in-up stagger-2">
        <div className="text-[#00ff88]/60 text-xs font-mono mb-4">
          $ ./veilpay --list-features
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#00ff88]/20 p-6 bg-black/20 crypto-box-hover">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-xl group-hover:bg-[#00ff88]/10 transition-colors">
                01
              </div>
              <div className="flex-1">
                <h3 className="text-white text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  COMPLETE ANONYMITY
                </h3>
                <div className="text-[#00ff88]/40 text-xs font-mono mb-2">
                  feature.anonymity.enabled = true
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Break the link between deposits and withdrawals. No observer can trace your transactions —
              not the relayer, not the smart contract, not blockchain analysts.
            </p>
          </div>

          <div className="border border-[#00ff88]/20 p-6 bg-black/20 crypto-box-hover">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-xl">
                02
              </div>
              <div className="flex-1">
                <h3 className="text-white text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  ZK-SNARK PROOFS
                </h3>
                <div className="text-[#00ff88]/40 text-xs font-mono mb-2">
                  proof_system = groth16
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Powered by Groth16 zero-knowledge proving system. Prove ownership of a deposit without
              revealing which one. All proof generation computed locally in your browser.
            </p>
          </div>

          <div className="border border-[#00ff88]/20 p-6 bg-black/20 crypto-box-hover">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-xl">
                03
              </div>
              <div className="flex-1">
                <h3 className="text-white text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  WITHDRAW ANYWHERE
                </h3>
                <div className="text-[#00ff88]/40 text-xs font-mono mb-2">
                  destination = any_address
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Send USDCx to any Stacks address. Your withdrawal address is cryptographically
              unlinkable from your deposit. Complete recipient privacy guaranteed.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol Flow - Circuit Diagram Style */}
      <div className="border border-[#00ff88]/20 bg-black/20 p-8 fade-in-up stagger-3">
        <div className="flex items-center gap-3 mb-8">
          <div className="text-[#00ff88] text-xs font-mono">
            PROTOCOL_EXECUTION_FLOW.md
          </div>
          <div className="flex-1 h-px bg-[#00ff88]/20"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00ff88] text-black flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="h-px flex-1 bg-[#00ff88]/30"></div>
              </div>
              <h4 className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                BRIDGE USDC
              </h4>
              <p className="text-gray-500 text-xs font-mono">
                xreserve.bridge(eth → stacks)
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Transfer USDC from Ethereum to Stacks using Circle's xReserve bridge protocol
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00ff88] text-black flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="h-px flex-1 bg-[#00ff88]/30"></div>
              </div>
              <h4 className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                DEPOSIT USDCx
              </h4>
              <p className="text-gray-500 text-xs font-mono">
                commitment = poseidon(s, a, n)
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Lock USDCx with cryptographic commitment. Generate secret for later withdrawal
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00ff88] text-black flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="h-px flex-1 bg-[#00ff88]/30"></div>
              </div>
              <h4 className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                ANONYMITY SET
              </h4>
              <p className="text-gray-500 text-xs font-mono">
                wait(optional)
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Optional: Let funds mix with other deposits for stronger anonymity guarantees
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00ff88] text-black flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div className="h-px flex-1 bg-[#00ff88]/30"></div>
              </div>
              <h4 className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                WITHDRAW
              </h4>
              <p className="text-gray-500 text-xs font-mono">
                groth16.prove(secret)
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Generate ZK proof of ownership. Withdraw to any address anonymously
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-up stagger-4">
        <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-6">
          <div className="text-[#00ff88]/60 text-xs font-mono mb-2">PROOF_SYSTEM</div>
          <div className="text-white text-3xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            GROTH16
          </div>
          <p className="text-gray-400 text-xs">Zero-knowledge proving system</p>
        </div>

        <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-6">
          <div className="text-[#00ff88]/60 text-xs font-mono mb-2">HASH_FUNCTION</div>
          <div className="text-white text-3xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            POSEIDON
          </div>
          <p className="text-gray-400 text-xs">SNARK-friendly hash</p>
        </div>

        <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-6">
          <div className="text-[#00ff88]/60 text-xs font-mono mb-2">MERKLE_DEPTH</div>
          <div className="text-white text-3xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
            20 LEVELS
          </div>
          <p className="text-gray-400 text-xs">1,048,576 deposit capacity</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="border-l-4 border-yellow-500 pl-6 py-4 bg-yellow-500/5 fade-in-up stagger-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-xl font-bold flex-shrink-0">
            →
          </div>
          <div className="flex-1">
            <h3 className="text-yellow-400 font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
              QUICK START GUIDE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-[#00ff88]/20 p-5">
                <div className="text-[#00ff88]/60 text-xs font-mono mb-3">STEP_1</div>
                <h4 className="text-white font-bold mb-2 text-sm">New to VeilPay?</h4>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Study the protocol architecture and understand the cryptographic privacy guarantees
                </p>
                <div className="flex gap-3 text-xs">
                  <a href="#how-it-works" className="text-[#00ff88] hover:underline font-mono">
                    PROTOCOL_DOCS →
                  </a>
                  <span className="text-gray-700">|</span>
                  <a href="#faq" className="text-[#00ff88] hover:underline font-mono">
                    FAQ →
                  </a>
                </div>
              </div>

              <div className="bg-black/40 border border-[#00ff88]/20 p-5">
                <div className="text-[#00ff88]/60 text-xs font-mono mb-3">STEP_2</div>
                <h4 className="text-white font-bold mb-2 text-sm">Ready to Deploy?</h4>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Acquire testnet USDCx and initialize private transfer operations
                </p>
                <div className="flex gap-3 text-xs">
                  <a href="#bridge" className="text-[#00ff88] hover:underline font-mono">
                    BRIDGE →
                  </a>
                  <span className="text-gray-700">|</span>
                  <a href="#deposit" className="text-[#00ff88] hover:underline font-mono">
                    DEPOSIT →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="border-l-4 border-red-500 pl-6 py-4 bg-red-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-red-400 flex items-center justify-center text-red-400 text-2xl font-bold flex-shrink-0">
            !
          </div>
          <div className="flex-1">
            <h4 className="text-red-400 font-bold text-base mb-2 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
              TESTNET DEPLOYMENT — EDUCATIONAL USE ONLY
            </h4>
            <div className="text-gray-400 text-sm leading-relaxed space-y-2">
              <p>
                VeilPay is deployed on <span className="text-red-400 font-bold">Stacks testnet</span> for
                testing and educational purposes. <span className="text-white font-bold">DO NOT USE REAL FUNDS.</span>
              </p>
              <p className="text-xs font-mono text-gray-500">
                • Experimental protocol demonstrating zero-knowledge privacy techniques<br/>
                • Always backup your secret and nonce securely — unrecoverable if lost<br/>
                • No warranty or guarantees provided — use at your own risk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="border border-[#00ff88]/20 bg-black/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-[#00ff88] text-xs font-mono">
            TECHNOLOGY_STACK.json
          </div>
          <div className="flex-1 h-px bg-[#00ff88]/20"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xl font-bold font-mono">
              ZK
            </div>
            <div className="text-white font-bold text-sm mb-1">CIRCOM</div>
            <div className="text-gray-500 text-xs font-mono">zk_circuits</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xl font-bold font-mono">
              G16
            </div>
            <div className="text-white font-bold text-sm mb-1">GROTH16</div>
            <div className="text-gray-500 text-xs font-mono">proof_system</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xl font-bold font-mono">
              CL
            </div>
            <div className="text-white font-bold text-sm mb-1">CLARITY</div>
            <div className="text-gray-500 text-xs font-mono">smart_contracts</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xl font-bold font-mono">
              XR
            </div>
            <div className="text-white font-bold text-sm mb-1">xRESERVE</div>
            <div className="text-gray-500 text-xs font-mono">bridge_protocol</div>
          </div>
        </div>
      </div>

      {/* Open Source */}
      <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-8 text-center">
        <h3 className="text-[#00ff88] font-bold text-xl mb-3 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
          OPEN SOURCE & COMMUNITY DRIVEN
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl mx-auto">
          VeilPay is fully open source. Contribute, audit smart contracts, or fork the repository.
          Transparency is a fundamental security requirement for privacy protocols.
        </p>
        <a
          href="https://github.com/carlos-israelj/VeilPay"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-black border border-[#00ff88]/50 text-[#00ff88] px-8 py-3 hover:bg-[#00ff88]/10 transition-all font-bold text-sm tracking-wider"
        >
          <span>VIEW REPOSITORY</span>
          <span>→</span>
        </a>
      </div>

      {/* Developer Contact */}
      <div className="border border-[#00ff88]/20 bg-black/20 p-8">
        <h3 className="text-white font-bold text-lg mb-4 tracking-wide text-center" style={{ fontFamily: "'Syne', sans-serif" }}>
          DEVELOPER CONTACT
        </h3>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-2xl mx-auto">
          Questions about the protocol? Want to collaborate on privacy infrastructure?
          Connect with the developer.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://www.linkedin.com/in/carlos-israelj/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0A66C2] px-5 py-2.5 hover:bg-[#004182] transition-all text-sm font-bold tracking-wider"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LINKEDIN
          </a>

          <a
            href="https://x.com/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black border border-white/20 px-5 py-2.5 hover:bg-white/10 transition-all text-sm font-bold tracking-wider"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X / TWITTER
          </a>

          <a
            href="https://t.me/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0088CC] px-5 py-2.5 hover:bg-[#006699] transition-all text-sm font-bold tracking-wider"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            TELEGRAM
          </a>
        </div>
      </div>
    </div>
  );
}
