import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      classification: "PUBLIC",
      questions: [
        {
          q: "What is VeilPay?",
          a: "VeilPay is a privacy protocol for USDCx transfers on the Stacks blockchain. It uses Zero-Knowledge proofs (ZK-SNARKs) to break the link between deposits and withdrawals, enabling completely anonymous transfers."
        },
        {
          q: "How do I get USDCx on Stacks testnet?",
          a: "You need to bridge USDC from Ethereum Sepolia to Stacks testnet using Circle's xReserve protocol. Use the 'Bridge' tab to transfer USDC. First, get testnet USDC from Circle's faucet (faucet.circle.com) and testnet ETH from Alchemy's faucet."
        },
        {
          q: "What wallets do I need?",
          a: "You need two wallets: (1) A Stacks wallet like Leather or Hiro Wallet for interacting with VeilPay, and (2) An Ethereum wallet like MetaMask for bridging USDC from Ethereum Sepolia."
        },
        {
          q: "Is VeilPay live on mainnet?",
          a: "VeilPay is currently on testnet only. Do not use real funds. This is an experimental protocol for educational purposes."
        }
      ]
    },
    {
      category: "Using VeilPay",
      classification: "INTERNAL",
      questions: [
        {
          q: "What is the minimum deposit amount?",
          a: "The minimum deposit is 1 USDCx (1,000,000 micro-units). There is no maximum limit."
        },
        {
          q: "What are the secret and nonce?",
          a: "The secret and nonce are random numbers generated in your browser when you make a deposit. They are used to create a cryptographic commitment and later prove ownership during withdrawal. You MUST save these values - they cannot be recovered if lost."
        },
        {
          q: "Can I withdraw to a different address than I deposited from?",
          a: "Yes! This is the key privacy feature. You can withdraw to ANY Stacks address, completely breaking the link between your deposit and withdrawal."
        },
        {
          q: "How long does a withdrawal take?",
          a: "Generating the ZK proof takes about 10 seconds in your browser. After that, the relayer submits the transaction to Stacks, which confirms in ~10 minutes depending on network congestion."
        },
        {
          q: "How long should I wait before withdrawing?",
          a: "For maximum privacy, wait for more deposits to accumulate in the pool. Withdrawing immediately after depositing reduces your anonymity set. We recommend waiting at least a few hours or days."
        }
      ]
    },
    {
      category: "Privacy & Security",
      classification: "CONFIDENTIAL",
      questions: [
        {
          q: "How private is VeilPay?",
          a: "VeilPay provides strong privacy guarantees: (1) No one can link your deposit to your withdrawal, (2) The recipient address is hidden from your deposit address, (3) All cryptographic operations happen client-side. However, your IP address may be visible to the relayer unless you use Tor/VPN."
        },
        {
          q: "What happens if I lose my secret/nonce?",
          a: "Your funds are PERMANENTLY LOST. There is no recovery mechanism - this is a fundamental property of the cryptographic design. Always backup your secret and nonce securely (password manager, encrypted file, etc.)."
        },
        {
          q: "Can the relayer steal my funds?",
          a: "No. The relayer cannot steal funds because: (1) It doesn't know your secret/nonce, (2) Withdrawals require a valid ZK proof that only you can generate, (3) The smart contract enforces all rules on-chain."
        },
        {
          q: "What is a nullifier and why does it matter?",
          a: "A nullifier is a unique identifier derived from your secret and nonce (Poseidon(secret, nonce)). It prevents double-spending: once you withdraw, your nullifier is recorded on-chain, preventing you from withdrawing the same deposit twice."
        },
        {
          q: "Is my transaction amount hidden?",
          a: "Currently, NO. Deposit and withdrawal amounts are visible on-chain. Future versions may implement fixed denominations (e.g., 10, 100, 1000 USDCx pools) to hide amounts."
        }
      ]
    },
    {
      category: "Technical Questions",
      classification: "INTERNAL",
      questions: [
        {
          q: "What is a ZK-SNARK?",
          a: "ZK-SNARK stands for 'Zero-Knowledge Succinct Non-Interactive Argument of Knowledge'. It's a cryptographic proof that lets you prove you know something (like a secret) without revealing what that something is. VeilPay uses the Groth16 proving system."
        },
        {
          q: "Why does proof generation take 10 seconds?",
          a: "Generating a ZK proof is computationally intensive. Your browser must perform complex cryptographic operations on a 20-level Merkle tree circuit. This happens entirely client-side for security."
        },
        {
          q: "What is the Poseidon hash function?",
          a: "Poseidon is a hash function optimized for ZK circuits. Unlike SHA-256, Poseidon is 'SNARK-friendly', meaning it's much more efficient to compute inside Zero-Knowledge proofs."
        },
        {
          q: "Why use a relayer instead of on-chain verification?",
          a: "Stacks/Clarity doesn't currently have the cryptographic primitives (elliptic curve operations for BN254/BLS12-381) needed to verify ZK proofs on-chain. The relayer verifies proofs off-chain and signs the transaction. When Stacks adds these primitives, VeilPay can migrate to fully on-chain verification."
        },
        {
          q: "How many deposits can the Merkle tree hold?",
          a: "The tree has 20 levels, supporting up to 2^20 = 1,048,576 deposits. This should be sufficient for testnet and early mainnet usage."
        }
      ]
    },
    {
      category: "Troubleshooting",
      classification: "PUBLIC",
      questions: [
        {
          q: "Why does my withdrawal fail with 'Assert Failed' error?",
          a: "This usually means: (1) Your Merkle proof is outdated - the relayer hasn't indexed your deposit yet (wait 30 seconds after depositing), or (2) You're using an incompatible deposit from when the system used a different hash function."
        },
        {
          q: "I get 'Not enough values for pathElements' - what does this mean?",
          a: "This is a technical error indicating the Merkle proof isn't properly padded to 20 levels. This should be handled automatically by the relayer. Try refreshing and withdrawing again."
        },
        {
          q: "The bridge says 'ERR-INVALID-SIGNATURE' - what went wrong?",
          a: "This has been fixed in the latest version. If you still see this, make sure you're using the latest frontend and relayer code."
        },
        {
          q: "My deposit isn't showing up for withdrawal",
          a: "Wait 30 seconds for the relayer to index your deposit. The relayer scans the blockchain every 30 seconds. You can check /stats endpoint to see total deposits indexed."
        },
        {
          q: "Can I cancel a deposit?",
          a: "No. Once a deposit is made, it's locked in the contract. You can only retrieve funds by withdrawing with your secret/nonce."
        }
      ]
    },
    {
      category: "Bridge (xReserve)",
      classification: "PUBLIC",
      questions: [
        {
          q: "Why does bridging take 18 minutes?",
          a: "Circle's xReserve protocol has a built-in settlement time of approximately 18 minutes to ensure cross-chain security. This is not specific to VeilPay - all xReserve bridges have this delay."
        },
        {
          q: "What if I disconnect my Ethereum wallet during bridging?",
          a: "You can safely disconnect. The transaction has already been submitted to Ethereum. VeilPay will continue showing the countdown timer and notify you when your USDCx arrives on Stacks."
        },
        {
          q: "Can I bridge directly to VeilPay?",
          a: "Currently, no. You must first bridge to your Stacks address, then make a separate deposit into VeilPay. Future versions may integrate direct bridging into the privacy pool."
        },
        {
          q: "Where can I get testnet USDC and ETH?",
          a: "Get USDC from Circle's faucet at faucet.circle.com (requires login). Get Sepolia ETH from Alchemy's faucet at alchemy.com/faucets/ethereum-sepolia."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'CONFIDENTIAL':
        return { border: 'border-red-400/30', text: 'text-red-400', bg: 'bg-red-400/10' };
      case 'INTERNAL':
        return { border: 'border-yellow-400/30', text: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      default:
        return { border: 'border-[#00ff88]/30', text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10' };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in-up">
      {/* Introduction Header with Declassification Style */}
      <div className="crypto-box-accent p-4 sm:p-6 stagger-1 relative overflow-hidden">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-4 opacity-20 text-[#00ff88] font-mono text-[10px] sm:text-xs rotate-12">
          DECLASSIFIED
        </div>
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h3 className="text-white font-black text-xl sm:text-2xl lg:text-3xl" style={{ fontFamily: "'Syne', sans-serif" }}>
              KNOWLEDGE_BASE_ACCESS
            </h3>
            <div className="flex items-center gap-2 text-[#00ff88] text-xs font-mono">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              UNRESTRICTED
            </div>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed">
            Access declassified documentation on VeilPay's privacy protocol, usage guidelines, and technical specifications.
          </p>
        </div>
      </div>

      {/* FAQ Categories with Document Classification Style */}
      {faqs.map((category, catIndex) => {
        const colors = getClassificationColor(category.classification);

        return (
          <div key={catIndex} className={`crypto-box p-4 sm:p-6 stagger-${Math.min(catIndex + 2, 5)}`}>
            {/* Category Header with Classification Badge */}
            <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#00ff88]/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                <h4 className="text-white font-bold text-base sm:text-lg font-mono flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                    {catIndex + 1}
                  </div>
                  <span className="break-words">{category.category.toUpperCase().replace(/ /g, '_')}</span>
                </h4>
                <div className={`${colors.border} ${colors.text} ${colors.bg} border px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono font-bold self-start sm:self-auto flex-shrink-0`}>
                  {category.classification}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs font-mono">
                <span>CLEARANCE LEVEL:</span>
                <div className="flex-1 h-1 bg-black/60 relative overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} transition-all duration-1000`}
                    style={{ width: category.classification === 'CONFIDENTIAL' ? '100%' : category.classification === 'INTERNAL' ? '60%' : '30%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Questions Accordion */}
            <div className="space-y-2 sm:space-y-3">
              {category.questions.map((faq, qIndex) => {
                const isOpen = openIndex === `${catIndex}-${qIndex}`;
                return (
                  <div
                    key={qIndex}
                    className="relative crypto-box border border-[#00ff88]/10 overflow-hidden transition-all group hover:border-[#00ff88]/30"
                  >
                    {/* Declassification Stamp - appears on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                      <div className={`${colors.text} text-[10px] font-mono font-bold px-2 py-1 border ${colors.border} rotate-12`}>
                        AUTHORIZED
                      </div>
                    </div>

                    {/* Question Button */}
                    <button
                      onClick={() => toggleQuestion(catIndex, qIndex)}
                      className="w-full p-3 sm:p-5 text-left flex items-start justify-between hover:bg-black/40 transition-all group/btn"
                    >
                      <div className="flex items-start gap-2 sm:gap-4 flex-1 pr-3 sm:pr-4 min-w-0">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 border ${colors.border} flex items-center justify-center text-[10px] sm:text-xs ${colors.text} flex-shrink-0 mt-0.5 group-hover/btn:bg-[#00ff88]/5 transition-colors`}>
                          Q
                        </div>
                        <span className="text-white font-bold text-xs sm:text-sm font-mono group-hover/btn:text-[#00ff88] transition-colors break-words">
                          {faq.q}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Status indicator */}
                        <div className={`text-[10px] sm:text-xs font-mono ${isOpen ? 'text-[#00ff88]' : 'text-gray-600'} transition-colors hidden sm:block`}>
                          {isOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                        {/* Arrow */}
                        <span className={`text-[#00ff88] text-base sm:text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Answer - with declassification reveal animation */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-2 border-t border-[#00ff88]/20">
                        {/* Declassification header */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 border-b border-[#00ff88]/10">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[10px] sm:text-xs text-[#00ff88] flex-shrink-0">
                            A
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                            <span>REDACTED:</span>
                            <div className="flex gap-0.5 sm:gap-1">
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-0.5 sm:w-1 h-2 sm:h-3 transition-all duration-300 ${isOpen ? 'bg-[#00ff88]/20' : 'bg-gray-700'}`}
                                  style={{ transitionDelay: `${i * 50}ms` }}
                                ></div>
                              ))}
                            </div>
                            <span className={`transition-all duration-500 ${isOpen ? 'text-[#00ff88]' : 'text-gray-600'}`}>
                              {isOpen ? '[NONE]' : '[FULL]'}
                            </span>
                          </div>
                        </div>

                        {/* Answer content with typewriter-like reveal */}
                        <div className={`text-gray-400 text-xs sm:text-sm leading-relaxed font-mono transition-all duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'} break-words`}>
                          {faq.a}
                        </div>

                        {/* Document footer */}
                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[#00ff88]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] font-mono text-gray-600">
                          <span>DOC_ID: VP-FAQ-{String(catIndex).padStart(2, '0')}{String(qIndex).padStart(2, '0')}</span>
                          <span className={colors.text}>CLASSIFICATION: {category.classification}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Additional Resources - Styled as declassified archives */}
      <div className="crypto-box p-4 sm:p-6 stagger-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent"></div>

        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center flex-shrink-0">
            <span className="text-[#00ff88] text-[10px] sm:text-xs font-mono font-bold">DOC</span>
          </div>
          <h4 className="text-[#00ff88] font-bold text-sm sm:text-base font-mono">EXTERNAL_REFERENCE_ARCHIVES</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            { title: 'GitHub Repository', url: 'https://github.com/carlos-israelj/VeilPay', code: 'REPO-001' },
            { title: 'Stacks Documentation', url: 'https://docs.stacks.co', code: 'DOC-STX' },
            { title: 'USDCx Bridge Guide', url: 'https://docs.stacks.co/more-guides/bridging-usdcx', code: 'GUIDE-BRIDGE' },
            { title: 'Circom Documentation', url: 'https://docs.circom.io', code: 'DOC-ZK' }
          ].map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="crypto-box p-3 sm:p-4 crypto-box-hover group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold text-xs sm:text-sm font-mono group-hover:text-[#00ff88] transition-colors break-words pr-2">
                  {resource.title}
                </span>
                <div className="text-[#00ff88] text-xs flex-shrink-0">→</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-[10px] sm:text-xs font-mono">REF:</span>
                <span className="text-gray-500 text-[10px] sm:text-xs font-mono">{resource.code}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Section - Styled as classified document footer */}
      <div className="status-success p-4 sm:p-6 stagger-5 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-[#00ff88]/20 text-[10px] sm:text-xs font-mono font-bold rotate-12">
          OPEN SOURCE
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#00ff88] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            ?
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#00ff88] font-bold text-sm sm:text-base mb-2 sm:mb-3 font-mono">REQUEST_ADDITIONAL_INFORMATION</h4>
            <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed break-words">
              VeilPay operates as an open-source protocol. For technical inquiries, bug reports, or documentation requests,
              submit a formal issue report to the{' '}
              <a
                href="https://github.com/carlos-israelj/VeilPay/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ff88] hover:text-white underline font-bold transition-colors"
              >
                GitHub Issue Tracker
              </a>
              .
            </p>
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[#00ff88]/20 text-[10px] sm:text-xs font-mono text-gray-600">
              DOCUMENT STATUS: ACTIVE | LAST UPDATED: 2025-01-25 | CLEARANCE: PUBLIC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
