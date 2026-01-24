import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
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

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-[#9656D6] bg-opacity-10 p-6 rounded-2xl border border-[#9656D6] border-opacity-30">
        <h3 className="text-[#9656D6] font-bold text-lg mb-2">Frequently Asked Questions</h3>
        <p className="text-[#353945] text-sm">
          Find answers to common questions about VeilPay's privacy protocol, usage, and technical details.
        </p>
      </div>

      {/* FAQ Categories */}
      {faqs.map((category, catIndex) => (
        <div key={catIndex}>
          <h4 className="text-[#22262E] font-bold text-base mb-4 flex items-center gap-2">
            <span className="text-[#3772FF]">•</span>
            {category.category}
          </h4>
          <div className="space-y-3">
            {category.questions.map((faq, qIndex) => {
              const isOpen = openIndex === `${catIndex}-${qIndex}`;
              return (
                <div
                  key={qIndex}
                  className="bg-[#F4F5F6] rounded-xl border border-[#E5E8EB] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleQuestion(catIndex, qIndex)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-[#E5E8EB] transition"
                  >
                    <span className="text-[#22262E] font-bold text-sm pr-4">{faq.q}</span>
                    <span className={`text-[#3772FF] text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2">
                      <p className="text-[#353945] text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Additional Resources */}
      <div className="bg-[#3772FF] bg-opacity-10 p-6 rounded-2xl border border-[#3772FF] border-opacity-30">
        <h4 className="text-[#3772FF] font-bold text-base mb-3">Additional Resources</h4>
        <ul className="space-y-2 text-[#353945] text-sm">
          <li className="flex items-start gap-2">
            <span className="text-[#3772FF] font-bold">•</span>
            <span>
              <strong>GitHub Repository:</strong>{' '}
              <a
                href="https://github.com/carlos-israelj/VeilPay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3772FF] underline hover:text-[#2C5CE6]"
              >
                github.com/carlos-israelj/VeilPay
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#3772FF] font-bold">•</span>
            <span>
              <strong>Stacks Documentation:</strong>{' '}
              <a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3772FF] underline hover:text-[#2C5CE6]"
              >
                docs.stacks.co
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#3772FF] font-bold">•</span>
            <span>
              <strong>USDCx Bridge Guide:</strong>{' '}
              <a
                href="https://docs.stacks.co/more-guides/bridging-usdcx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3772FF] underline hover:text-[#2C5CE6]"
              >
                docs.stacks.co/more-guides/bridging-usdcx
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#3772FF] font-bold">•</span>
            <span>
              <strong>Circom Documentation:</strong>{' '}
              <a
                href="https://docs.circom.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3772FF] underline hover:text-[#2C5CE6]"
              >
                docs.circom.io
              </a>
            </span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="bg-[#45B26A] bg-opacity-10 p-6 rounded-2xl border border-[#45B26A] border-opacity-30">
        <h4 className="text-[#45B26A] font-bold text-base mb-2">Still have questions?</h4>
        <p className="text-[#353945] text-sm">
          VeilPay is an open-source project. If you have technical questions or found a bug,
          please open an issue on{' '}
          <a
            href="https://github.com/carlos-israelj/VeilPay/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3772FF] underline hover:text-[#2C5CE6] font-medium"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
