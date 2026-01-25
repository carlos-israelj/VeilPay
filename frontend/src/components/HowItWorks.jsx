export default function HowItWorks() {
  return (
    <div className="space-y-6 sm:space-y-8 fade-in-up">
      {/* Introduction */}
      <div className="crypto-box-accent p-4 sm:p-6 stagger-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h3 className="text-white font-black text-xl sm:text-2xl lg:text-3xl" style={{ fontFamily: "'Syne', sans-serif" }}>
              ZERO-KNOWLEDGE_PROTOCOL
            </h3>
            <div className="flex items-center gap-2 text-[#00ff88] text-xs font-mono">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              ACTIVE
            </div>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
            VeilPay uses ZK-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge)
            to enable completely private USDCx transfers on the Stacks blockchain.
          </p>
        </div>
      </div>

      {/* Circuit Flow Diagram */}
      <div className="relative stagger-2">
        <div className="absolute left-[22px] sm:left-[26px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00ff88]/50 via-[#00ff88]/20 to-transparent hidden sm:block"></div>

        <div className="space-y-4 sm:space-y-6">
          {/* Step 1: Bridge */}
          <div className="relative crypto-box p-4 sm:p-6 crypto-box-hover group">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00ff88] flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all">
                  <span className="text-black text-lg sm:text-xl font-black font-mono relative z-10">1</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00ff88] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h4 className="text-white text-base sm:text-lg font-bold font-mono">BRIDGE_USDC_FROM_ETHEREUM</h4>
                  <div className="text-[#00ff88]/60 text-xs font-mono border border-[#00ff88]/30 px-2 py-1 self-start">
                    ~18 MIN
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">
                  Transfer USDC from Ethereum Sepolia to Stacks testnet using Circle's xReserve protocol.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 text-xs font-mono">
                  <div className="bg-black/40 border border-[#00ff88]/10 p-3 hover:border-[#00ff88]/30 transition-colors">
                    <div className="text-[#00ff88] mb-1">→ CONNECT</div>
                    <div className="text-gray-500">Ethereum wallet (MetaMask)</div>
                  </div>
                  <div className="bg-black/40 border border-[#00ff88]/10 p-3 hover:border-[#00ff88]/30 transition-colors">
                    <div className="text-[#00ff88] mb-1">→ APPROVE</div>
                    <div className="text-gray-500">USDC spending + deposit</div>
                  </div>
                  <div className="bg-black/40 border border-[#00ff88]/10 p-3 hover:border-[#00ff88]/30 transition-colors">
                    <div className="text-[#00ff88] mb-1">→ WAIT</div>
                    <div className="text-gray-500">USDCx arrives on Stacks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Deposit */}
          <div className="relative crypto-box p-4 sm:p-6 crypto-box-hover group">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00ff88] flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all">
                  <span className="text-black text-lg sm:text-xl font-black font-mono relative z-10">2</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00ff88] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h4 className="text-white text-base sm:text-lg font-bold font-mono">PRIVATE_DEPOSIT</h4>
                  <div className="text-[#00ff88]/60 text-xs font-mono border border-[#00ff88]/30 px-2 py-1 self-start">
                    INSTANT
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">
                  Lock USDCx in privacy pool with cryptographic commitment.
                </p>
                <div className="bg-black/60 border-l-4 border-[#00ff88] p-3 sm:p-4 mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#00ff88_2px,#00ff88_3px)]"></div>
                  <div className="relative z-10">
                    <div className="text-[#00ff88] text-xs font-mono mb-2">COMMITMENT FORMULA:</div>
                    <code className="text-white text-xs sm:text-sm font-mono break-all">
                      Poseidon(secret, amount, nonce)
                    </code>
                  </div>
                </div>
                <div className="status-error p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold text-base sm:text-lg flex-shrink-0">⚠</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-red-400 font-bold text-xs font-mono mb-1">CRITICAL:</div>
                      <div className="text-gray-400 text-xs font-mono">
                        SAVE SECRET AND NONCE! Cannot be recovered if lost.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Wait (Optional) */}
          <div className="relative crypto-box p-4 sm:p-6 crypto-box-hover group">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-[#00ff88] bg-black/60 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
                  <span className="text-[#00ff88] text-lg sm:text-xl font-black font-mono relative z-10">3</span>
                  <div className="absolute inset-0 bg-[#00ff88]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00ff88]/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h4 className="text-white text-base sm:text-lg font-bold font-mono">BREAK_THE_LINK</h4>
                  <div className="text-yellow-400/80 text-xs font-mono border border-yellow-400/40 px-2 py-1 self-start">
                    OPTIONAL
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">
                  For maximum privacy, wait before withdrawing. Longer wait = harder to correlate deposit/withdrawal.
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  {['MIXING', 'INDEXING', 'ANONYMITY'].map((label, i) => (
                    <div key={i} className="bg-[#00ff88]/5 border border-[#00ff88]/20 p-2 sm:p-3 hover:bg-[#00ff88]/10 transition-colors">
                      <div className="text-[#00ff88] text-[10px] sm:text-xs font-mono">{label}</div>
                      <div className="text-white text-xl sm:text-2xl font-bold mt-1">⟳</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Withdraw */}
          <div className="relative crypto-box p-4 sm:p-6 crypto-box-hover group">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00ff88] flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all">
                  <span className="text-black text-lg sm:text-xl font-black font-mono relative z-10">✓</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h4 className="text-white text-base sm:text-lg font-bold font-mono">WITHDRAW_TO_ANY_ADDRESS</h4>
                  <div className="text-[#00ff88]/60 text-xs font-mono border border-[#00ff88]/30 px-2 py-1 self-start">
                    ~10 SEC PROOF
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 font-mono">
                  Prove deposit ownership without revealing which one, and withdraw to any Stacks address.
                </p>
                <div className="space-y-2">
                  {[
                    'Enter saved secret and nonce',
                    'Choose any recipient address',
                    'Browser generates ZK proof',
                    'Relayer verifies and submits',
                    'USDCx transferred privately'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono group/item">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-[10px] sm:text-xs group-hover/item:bg-[#00ff88]/10 transition-colors flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-gray-400 group-hover/item:text-gray-300 transition-colors flex-1 min-w-0">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="crypto-box-accent p-4 sm:p-6 stagger-3 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(135deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>
        <div className="relative z-10">
          <h4 className="text-[#00ff88] font-bold text-sm sm:text-base mb-4 sm:mb-6 font-mono flex items-center gap-2">
            <span className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-xs sm:text-sm text-[#00ff88] font-bold flex-shrink-0">⚙</span>
            TECHNICAL_SPECIFICATIONS
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="crypto-box p-4 sm:p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <h5 className="text-white font-bold mb-3 sm:mb-4 font-mono flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00ff88]"></div>
                  CRYPTOGRAPHY
                </h5>
                <ul className="space-y-2 sm:space-y-3 text-gray-400 font-mono">
                  {[
                    { label: 'ZK-SNARK circuit', value: 'Groth16' },
                    { label: 'Hash function', value: 'Poseidon' },
                    { label: 'Merkle tree depth', value: '20 levels' },
                    { label: 'Proof generation', value: 'Client-side' }
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center pb-2 border-b border-[#00ff88]/10 gap-2">
                      <span className="text-[#00ff88]/60 text-xs">{item.label}:</span>
                      <span className="text-white font-bold text-xs">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="crypto-box p-4 sm:p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <h5 className="text-white font-bold mb-3 sm:mb-4 font-mono flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00ff88]"></div>
                  PRIVACY_GUARANTEES
                </h5>
                <ul className="space-y-2 sm:space-y-3 text-gray-400 font-mono">
                  {[
                    'Commitment hiding',
                    'Nullifier uniqueness',
                    'Recipient privacy',
                    'No metadata leakage'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#00ff88] flex items-center justify-center text-[#00ff88] text-[10px] sm:text-xs flex-shrink-0 font-bold">✓</div>
                      <span className="text-xs">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="status-error p-4 sm:p-6 stagger-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_11px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-red-400 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 text-red-400 font-bold">
              !
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-red-400 font-bold text-sm sm:text-base mb-3 sm:mb-4 font-mono">SECURITY_BEST_PRACTICES</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { title: 'Never share credentials', desc: 'Anyone with secret/nonce can withdraw' },
                  { title: 'Secure backup required', desc: 'Store in password manager or encrypted file' },
                  { title: 'Use Tor/VPN', desc: 'IP address may leak to relayer' },
                  { title: 'Wait before withdrawing', desc: 'Immediate withdrawals reduce anonymity' }
                ].map((item, i) => (
                  <div key={i} className="bg-black/40 border border-red-400/20 p-3 hover:border-red-400/40 transition-colors">
                    <div className="text-white font-bold text-xs sm:text-sm font-mono mb-1">{item.title}</div>
                    <div className="text-gray-400 text-xs font-mono">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
