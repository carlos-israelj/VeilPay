export default function Home() {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section - Classified Document Aesthetic */}
      <div className="relative border-l-4 border-[#00ff88] pl-4 sm:pl-6 py-6 bg-[#00ff88]/5 fade-in-up stagger-1 overflow-hidden">
        <div className="absolute top-0 right-0 text-[#00ff88]/30 text-[10px] sm:text-xs font-mono px-2 sm:px-3 py-1 border-l border-b border-[#00ff88]/30">
          CLASSIFIED
        </div>
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>

        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            ZERO-KNOWLEDGE<br className="hidden sm:block"/>
            <span className="sm:hidden"> </span>PRIVACY PROTOCOL
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 max-w-3xl">
            VeilPay implements Groth16 ZK-SNARKs for provably anonymous USDCx transfers on Stacks blockchain.
            Break transaction surveillance. No intermediaries can link deposits to withdrawals.
            Cryptographic privacy guarantees secured by Bitcoin finality.
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 bg-[#00ff88] animate-pulse"></div>
            <span className="text-[#00ff88] text-[10px] sm:text-xs font-bold tracking-widest">
              PRIVACY-FIRST · ZERO-KNOWLEDGE · DECENTRALIZED
            </span>
          </div>
        </div>
      </div>

      {/* Key Features - Terminal Output Style */}
      <div className="fade-in-up stagger-2">
        <div className="text-[#00ff88]/60 text-xs font-mono mb-4 overflow-x-auto">
          $ ./veilpay --list-features
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-[#00ff88]/20 p-4 sm:p-6 bg-black/20 crypto-box-hover group">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-lg sm:text-xl group-hover:bg-[#00ff88]/10 transition-colors flex-shrink-0">
                01
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm sm:text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  COMPLETE ANONYMITY
                </h3>
                <div className="text-[#00ff88]/40 text-[10px] sm:text-xs font-mono mb-2">
                  feature.anonymity.enabled = true
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Break the link between deposits and withdrawals. No observer can trace your transactions —
              not the relayer, not the smart contract, not blockchain analysts.
            </p>
          </div>

          <div className="border border-[#00ff88]/20 p-4 sm:p-6 bg-black/20 crypto-box-hover group">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-lg sm:text-xl group-hover:bg-[#00ff88]/10 transition-colors flex-shrink-0">
                02
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm sm:text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  ZK-SNARK PROOFS
                </h3>
                <div className="text-[#00ff88]/40 text-[10px] sm:text-xs font-mono mb-2">
                  proof_system = groth16
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Powered by Groth16 zero-knowledge proving system. Prove ownership of a deposit without
              revealing which one. All proof generation computed locally in your browser.
            </p>
          </div>

          <div className="border border-[#00ff88]/20 p-4 sm:p-6 bg-black/20 crypto-box-hover group md:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border border-[#00ff88]/30 flex items-center justify-center font-mono text-[#00ff88] text-lg sm:text-xl group-hover:bg-[#00ff88]/10 transition-colors flex-shrink-0">
                03
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm sm:text-base font-bold mb-1 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  WITHDRAW ANYWHERE
                </h3>
                <div className="text-[#00ff88]/40 text-[10px] sm:text-xs font-mono mb-2">
                  destination = any_address
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Send USDCx to any Stacks address. Your withdrawal address is cryptographically
              unlinkable from your deposit. Complete recipient privacy guaranteed.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol Flow - Circuit Diagram Style */}
      <div className="border border-[#00ff88]/20 bg-black/20 p-4 sm:p-6 lg:p-8 fade-in-up stagger-3">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="text-[#00ff88] text-[10px] sm:text-xs font-mono truncate">
            PROTOCOL_EXECUTION_FLOW.md
          </div>
          <div className="flex-1 h-px bg-[#00ff88]/20"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { num: '1', title: 'BRIDGE USDC', code: 'xreserve.bridge(eth → stacks)', desc: 'Transfer USDC from Ethereum to Stacks using Circle\'s xReserve bridge protocol' },
            { num: '2', title: 'DEPOSIT USDCx', code: 'commitment = poseidon(s, a, n)', desc: 'Lock USDCx with cryptographic commitment. Generate secret for later withdrawal' },
            { num: '3', title: 'ANONYMITY SET', code: 'wait(optional)', desc: 'Optional: Let funds mix with other deposits for stronger anonymity guarantees' },
            { num: '✓', title: 'WITHDRAW', code: 'groth16.prove(secret)', desc: 'Generate ZK proof of ownership. Withdraw to any address anonymously' },
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00ff88] text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="h-px flex-1 bg-[#00ff88]/30 hidden sm:block"></div>
                </div>
                <h4 className="text-white font-bold text-xs sm:text-sm tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {step.title}
                </h4>
                <p className="text-gray-500 text-[10px] sm:text-xs font-mono break-all">
                  {step.code}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 fade-in-up stagger-4">
        {[
          { label: 'PROOF_SYSTEM', value: 'GROTH16', desc: 'Zero-knowledge proving system' },
          { label: 'HASH_FUNCTION', value: 'POSEIDON', desc: 'SNARK-friendly hash' },
          { label: 'MERKLE_DEPTH', value: '20 LEVELS', desc: '1,048,576 deposit capacity' },
        ].map((spec, idx) => (
          <div key={idx} className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-4 sm:p-6">
            <div className="text-[#00ff88]/60 text-[10px] sm:text-xs font-mono mb-2">{spec.label}</div>
            <div className="text-white text-xl sm:text-2xl lg:text-3xl font-black mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              {spec.value}
            </div>
            <p className="text-gray-400 text-xs">{spec.desc}</p>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <div className="border-l-4 border-yellow-500 pl-4 sm:pl-6 py-4 sm:py-6 bg-yellow-500/5 fade-in-up stagger-5">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 text-lg sm:text-xl font-bold flex-shrink-0">
            →
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-yellow-400 font-bold text-base sm:text-lg mb-3 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
              QUICK START GUIDE
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-black/40 border border-[#00ff88]/20 p-4 sm:p-5">
                <div className="text-[#00ff88]/60 text-[10px] sm:text-xs font-mono mb-3">STEP_1</div>
                <h4 className="text-white font-bold mb-2 text-xs sm:text-sm">New to VeilPay?</h4>
                <p className="text-gray-400 text-xs mb-3 sm:mb-4 leading-relaxed">
                  Study the protocol architecture and understand the cryptographic privacy guarantees
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
                  <a href="#how-it-works" className="text-[#00ff88] hover:underline font-mono">
                    PROTOCOL_DOCS →
                  </a>
                  <span className="text-gray-700">|</span>
                  <a href="#faq" className="text-[#00ff88] hover:underline font-mono">
                    FAQ →
                  </a>
                </div>
              </div>

              <div className="bg-black/40 border border-[#00ff88]/20 p-4 sm:p-5">
                <div className="text-[#00ff88]/60 text-[10px] sm:text-xs font-mono mb-3">STEP_2</div>
                <h4 className="text-white font-bold mb-2 text-xs sm:text-sm">Ready to Deploy?</h4>
                <p className="text-gray-400 text-xs mb-3 sm:mb-4 leading-relaxed">
                  Acquire testnet USDCx and initialize private transfer operations
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs">
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
      <div className="border-l-4 border-red-500 pl-4 sm:pl-6 py-4 sm:py-6 bg-red-500/5">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-red-400 flex items-center justify-center text-red-400 text-xl sm:text-2xl font-bold flex-shrink-0">
            !
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-red-400 font-bold text-sm sm:text-base mb-2 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
              TESTNET DEPLOYMENT — EDUCATIONAL USE ONLY
            </h4>
            <div className="text-gray-400 text-xs sm:text-sm leading-relaxed space-y-2">
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
      <div className="border border-[#00ff88]/20 bg-black/20 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="text-[#00ff88] text-[10px] sm:text-xs font-mono truncate">
            TECHNOLOGY_STACK.json
          </div>
          <div className="flex-1 h-px bg-[#00ff88]/20"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { abbr: 'ZK', name: 'CIRCOM', type: 'zk_circuits' },
            { abbr: 'G16', name: 'GROTH16', type: 'proof_system' },
            { abbr: 'CL', name: 'CLARITY', type: 'smart_contracts' },
            { abbr: 'XR', name: 'xRESERVE', type: 'bridge_protocol' },
          ].map((tech, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-base sm:text-xl font-bold font-mono">
                {tech.abbr}
              </div>
              <div className="text-white font-bold text-xs sm:text-sm mb-1">{tech.name}</div>
              <div className="text-gray-500 text-[10px] sm:text-xs font-mono">{tech.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source */}
      <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 p-6 sm:p-8 text-center">
        <h3 className="text-[#00ff88] font-bold text-lg sm:text-xl mb-3 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
          OPEN SOURCE & COMMUNITY DRIVEN
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 max-w-2xl mx-auto">
          VeilPay is fully open source. Contribute, audit smart contracts, or fork the repository.
          Transparency is a fundamental security requirement for privacy protocols.
        </p>
        <a
          href="https://github.com/carlos-israelj/VeilPay"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-black border border-[#00ff88]/50 text-[#00ff88] px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-[#00ff88]/10 transition-all font-bold text-xs sm:text-sm tracking-wider"
        >
          <span>VIEW REPOSITORY</span>
          <span>→</span>
        </a>
      </div>

      {/* Developer Contact */}
      <div className="border border-[#00ff88]/20 bg-black/20 p-6 sm:p-8">
        <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4 tracking-wide text-center" style={{ fontFamily: "'Syne', sans-serif" }}>
          DEVELOPER CONTACT
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 text-center max-w-2xl mx-auto">
          Questions about the protocol? Want to collaborate on privacy infrastructure?
          Connect with the developer.
        </p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <a
            href="https://www.linkedin.com/in/carlos-israelj/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0A66C2] px-4 sm:px-5 py-2 sm:py-2.5 hover:bg-[#004182] transition-all text-xs sm:text-sm font-bold tracking-wider"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LINKEDIN
          </a>

          <a
            href="https://x.com/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black border border-white/20 px-4 sm:px-5 py-2 sm:py-2.5 hover:bg-white/10 transition-all text-xs sm:text-sm font-bold tracking-wider"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X / TWITTER
          </a>

          <a
            href="https://t.me/carlos_israelj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0088CC] px-4 sm:px-5 py-2 sm:py-2.5 hover:bg-[#006699] transition-all text-xs sm:text-sm font-bold tracking-wider"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            TELEGRAM
          </a>
        </div>
      </div>
    </div>
  );
}
