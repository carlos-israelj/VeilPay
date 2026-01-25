export default function Integrations() {
  const integrationCategories = [
    {
      title: "AI & Micropayment Platforms",
      description: "Privacy-preserving payment rails for autonomous agents",
      badge: "AI",
      icon: "AI",
      tier: "PREMIUM",
      integrations: [
        {
          useCase: "AI Agent Micropayments",
          problem: "AI agents making HTTP 402 payments expose transaction graphs revealing business logic and usage patterns",
          solution: "VeilPay provides anonymous payment channels for AI agents. Agents can pay for API calls without revealing which agent paid for what service.",
          implementation: "Integrate VeilPay's deposit/withdraw flow into payment middleware. Agents deposit USDCx once, withdraw privately to API providers. No correlation between deposits and API usage.",
          value: "Complete privacy for autonomous agent operations while maintaining payment settlement guarantees",
          maturity: "EXPERIMENTAL"
        },
        {
          useCase: "Pay-per-Request APIs",
          problem: "On-chain API payment tracking creates public records of what data/services each user consumes",
          solution: "VeilPay allows users to pay for API requests without revealing identity or consumption patterns to competitors or surveillance",
          implementation: "API providers accept withdrawals from VeilPay's privacy pool. Payment verification via ZK proofs ensures valid payment without identity disclosure.",
          value: "Users get privacy, API providers get guaranteed payment settlement",
          maturity: "PRODUCTION"
        }
      ]
    },
    {
      title: "DeFi & Yield Protocols",
      description: "Private entry/exit for yield strategies",
      badge: "DEFI",
      icon: "DF",
      tier: "CORE",
      integrations: [
        {
          useCase: "Yield Vault Privacy",
          problem: "Large deposits/withdrawals from yield vaults are publicly visible, enabling front-running and strategy copying",
          solution: "VeilPay acts as privacy layer for vault interactions. Whales can enter/exit positions without revealing amounts or timing",
          implementation: "Users deposit to VeilPay, then withdraw directly to vault contracts. Vault sees anonymous deposits with no link to original depositor. Same for withdrawals.",
          value: "Institutional-grade privacy for DeFi positions. Prevents MEV attacks and competitive intelligence gathering",
          maturity: "PRODUCTION"
        },
        {
          useCase: "Cross-Chain Arbitrage",
          problem: "Arbitrage transactions reveal profitable routes to competitors, reducing alpha",
          solution: "Use VeilPay to obfuscate capital deployment and profit extraction paths",
          implementation: "Bridge funds through VeilPay before/after arbitrage operations. Break the on-chain trail between entry capital and exit profits.",
          value: "Protect proprietary trading strategies from copycat bots",
          maturity: "BETA"
        },
        {
          useCase: "Lending Protocol Privacy",
          problem: "Public borrowing/lending positions expose liquidation risks and enable targeted attacks",
          solution: "VeilPay enables private collateral deposits and loan repayments",
          implementation: "Integrate VeilPay withdrawals as valid collateral sources. Borrowers deposit collateral privately, repay loans anonymously.",
          value: "Reduce liquidation risk from targeted attacks, improve borrower privacy",
          maturity: "PRODUCTION"
        }
      ]
    },
    {
      title: "Payment & Commerce",
      description: "Privacy-first payment infrastructure",
      badge: "PAY",
      icon: "$",
      tier: "CORE",
      integrations: [
        {
          useCase: "Merchant Payment Privacy",
          problem: "Payment links and QR code payments expose customer spending patterns and merchant revenue to competitors",
          solution: "VeilPay-powered payment links accept anonymous payments while ensuring merchant receives funds",
          implementation: "Generate payment links that accept VeilPay withdrawals. Customer deposits once, pays multiple merchants anonymously. Merchants verify payment via ZK proof.",
          value: "Customer privacy + merchant payment guarantees. Competitors can't track revenue or customer base",
          maturity: "PRODUCTION"
        },
        {
          useCase: "Streaming Payments Privacy",
          problem: "Continuous payment streams reveal exact compensation amounts and payment schedules publicly",
          solution: "Private streaming via VeilPay deposit → periodic anonymous withdrawals to recipient",
          implementation: "Stream funds into VeilPay pool, recipient withdraws in irregular patterns. Observer can't correlate payer ↔ payee or determine exact amounts.",
          value: "Salary/creator payment privacy. No one can track who pays whom or how much",
          maturity: "BETA"
        },
        {
          useCase: "P2P Escrow Privacy",
          problem: "Escrow transactions reveal trade terms, amounts, and counterparty identities",
          solution: "VeilPay as privacy layer for escrow deposits and releases",
          implementation: "Buyer deposits to VeilPay, escrow contract verifies deposit via ZK proof. On completion, seller withdraws anonymously from pool.",
          value: "Trade privacy for freelancers and merchants. Competitors can't see deal flow or pricing",
          maturity: "EXPERIMENTAL"
        }
      ]
    },
    {
      title: "Bridge & Cross-Chain",
      description: "Privacy-preserving bridge infrastructure",
      badge: "BRIDGE",
      icon: "BR",
      tier: "PREMIUM",
      integrations: [
        {
          useCase: "Private Bridge Transfers",
          problem: "Bridge transactions create permanent on-chain links between Ethereum and Stacks addresses, enabling cross-chain tracking",
          solution: "VeilPay breaks the link. Bridge to Stacks, deposit to VeilPay, withdraw to unlinkable address",
          implementation: "Integrate VeilPay as post-bridge privacy step. User bridges USDC → USDCx → VeilPay deposit → anonymous withdrawal to final Stacks address.",
          value: "Complete unlinkability between Ethereum source and Stacks destination addresses",
          maturity: "PRODUCTION"
        },
        {
          useCase: "Cross-Chain DeFi Privacy",
          problem: "Multi-chain DeFi users leave correlated transaction trails across all chains",
          solution: "VeilPay as privacy mixer for bridged assets before/after cross-chain operations",
          implementation: "Automated routing: Bridge → VeilPay deposit → wait randomized delay → withdraw to DeFi protocol. Reverse path for exit.",
          value: "Institutional users can deploy capital across chains without revealing strategy",
          maturity: "BETA"
        }
      ]
    },
    {
      title: "Savings & Off-Ramp",
      description: "Privacy for fiat-adjacent operations",
      badge: "SAVINGS",
      icon: "SV",
      tier: "STANDARD",
      integrations: [
        {
          useCase: "Private Savings Accounts",
          problem: "Savings deposits reveal exact holdings and interest earnings publicly",
          solution: "Deposit to VeilPay → withdraw to savings vault. Interest accumulation not linked to depositor identity",
          implementation: "Savings protocols accept VeilPay withdrawals as deposits. Interest payments return to VeilPay pool for re-anonymization.",
          value: "Financial privacy for long-term holders. No one can track net worth or interest income",
          maturity: "PRODUCTION"
        },
        {
          useCase: "Private Crypto Debit Cards",
          problem: "Debit card top-ups reveal exact spending amounts and create permanent links to card provider",
          solution: "Top-up debit cards via VeilPay withdrawals. Card provider sees payments but can't link to original source",
          implementation: "Card providers integrate VeilPay withdrawal verification. Users deposit once, top-up cards anonymously multiple times.",
          value: "Spending privacy. Card provider can't build profile of user's crypto holdings or sources",
          maturity: "EXPERIMENTAL"
        }
      ]
    },
    {
      title: "Security & Compliance",
      description: "Privacy without compromising security",
      badge: "SEC",
      icon: "SC",
      tier: "STANDARD",
      integrations: [
        {
          useCase: "Rug Pull Prevention",
          problem: "Security protocols need to track fund flows, but this creates privacy invasion",
          solution: "VeilPay provides cryptographic proofs of fund legitimacy without revealing transaction history",
          implementation: "Security protocols verify ZK proofs that funds originated from legitimate sources without seeing deposit/withdrawal graph.",
          value: "Security guarantees + privacy. Prove funds are clean without doxxing transaction history",
          maturity: "EXPERIMENTAL"
        }
      ]
    }
  ];

  const getMaturityColor = (maturity) => {
    switch (maturity) {
      case 'PRODUCTION':
        return { border: 'border-[#00ff88]/40', text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10' };
      case 'BETA':
        return { border: 'border-blue-400/40', text: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'EXPERIMENTAL':
        return { border: 'border-yellow-400/40', text: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      default:
        return { border: 'border-gray-500/40', text: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'PREMIUM':
        return { border: 'border-purple-400/30', text: 'text-purple-400', bg: 'bg-purple-400/10', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' };
      case 'CORE':
        return { border: 'border-[#00ff88]/30', text: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', glow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]' };
      default:
        return { border: 'border-gray-500/30', text: 'text-gray-400', bg: 'bg-gray-500/10', glow: 'shadow-[0_0_10px_rgba(128,128,128,0.2)]' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 fade-in-up">
      {/* Hero Header with Holographic Effect */}
      <div className="crypto-box-accent p-4 sm:p-6 lg:p-8 stagger-1 relative overflow-hidden group">
        {/* Holographic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              INTEGRATION_ECOSYSTEM
            </h1>
            <div className="flex items-center gap-2 text-[#00ff88] text-[10px] sm:text-xs font-mono">
              <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
              COMPOSABLE
            </div>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 font-mono leading-relaxed">
            VeilPay is not just a standalone privacy protocol—it's infrastructure that enhances the entire Stacks ecosystem.
            Our zero-knowledge proof system can provide privacy guarantees for any USDCx-based application.
          </p>

          {/* Core Value Props with Visual Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: "Composable Privacy", value: "Add privacy without rebuilding", icon: "↔" },
              { label: "Trustless Verification", value: "ZK proofs enable verification without identity", icon: "✓" },
              { label: "Network Effects", value: "Larger anonymity set improves privacy", icon: "↑" },
              { label: "Bitcoin Security", value: "Secured by Bitcoin finality via Stacks", icon: "₿" }
            ].map((prop, i) => (
              <div key={i} className="crypto-box p-3 sm:p-4 crypto-box-hover group/card">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-base sm:text-lg flex-shrink-0 group-hover/card:shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-all">
                    {prop.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-xs sm:text-sm font-mono mb-1">{prop.label}</div>
                    <div className="text-gray-400 text-[10px] sm:text-xs font-mono break-words">{prop.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="space-y-5 sm:space-y-6">
        {integrationCategories.map((category, idx) => {
          const tierColors = getTierColor(category.tier);

          return (
            <div key={idx} className={`crypto-box p-4 sm:p-5 lg:p-6 stagger-${Math.min(idx + 2, 5)} relative overflow-hidden group/category`}>
              {/* Holographic border effect */}
              <div className={`absolute inset-0 border-2 ${tierColors.border} opacity-0 group-hover/category:opacity-100 transition-opacity duration-500 pointer-events-none ${tierColors.glow}`}></div>

              {/* Category Header */}
              <div className="mb-4 sm:mb-5 lg:mb-6 pb-3 sm:pb-4 border-b border-[#00ff88]/20 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${tierColors.bg} border ${tierColors.border} flex items-center justify-center text-xl sm:text-2xl group-hover/category:${tierColors.glow} transition-all flex-shrink-0`}>
                      {category.icon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white font-mono break-words">{category.title}</h2>
                      <p className="text-gray-400 text-xs sm:text-sm font-mono break-words">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Tier Badge */}
                    <div className={`${tierColors.border} ${tierColors.text} ${tierColors.bg} border px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono font-bold`}>
                      {category.tier}
                    </div>
                    {/* Category Badge */}
                    <div className="border border-[#00ff88]/30 text-[#00ff88] bg-[#00ff88]/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono font-bold">
                      {category.badge}
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Case Cards with Holographic Effects */}
              <div className="space-y-3 sm:space-y-4 relative z-10">
                {category.integrations.map((integration, intIdx) => {
                  const maturityColors = getMaturityColor(integration.maturity);

                  return (
                    <div
                      key={intIdx}
                      className="crypto-box border border-[#00ff88]/10 p-4 sm:p-5 lg:p-6 relative overflow-hidden group/card hover:border-[#00ff88]/30 transition-all"
                    >
                      {/* Holographic shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

                      {/* Card Content */}
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-[#00ff88]/10">
                          <h3 className="text-base sm:text-lg font-semibold text-white font-mono pr-0 sm:pr-4 group-hover/card:text-[#00ff88] transition-colors break-words min-w-0">
                            {integration.useCase}
                          </h3>
                          {/* Maturity Badge */}
                          <div className={`${maturityColors.border} ${maturityColors.text} ${maturityColors.bg} border px-2 py-1 text-[10px] font-mono font-bold flex-shrink-0 self-start`}>
                            {integration.maturity}
                          </div>
                        </div>

                        {/* Problem/Solution Grid */}
                        <div className="grid gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="bg-red-400/5 border-l-2 sm:border-l-4 border-red-400/40 p-3 sm:p-4">
                            <h4 className="text-[10px] sm:text-xs font-semibold text-red-400 mb-2 font-mono flex items-center gap-2">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border border-red-400 flex items-center justify-center text-[8px] sm:text-[10px] flex-shrink-0">!</div>
                              PROBLEM
                            </h4>
                            <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed break-words">{integration.problem}</p>
                          </div>

                          <div className="bg-[#00ff88]/5 border-l-2 sm:border-l-4 border-[#00ff88]/40 p-3 sm:p-4">
                            <h4 className="text-[10px] sm:text-xs font-semibold text-[#00ff88] mb-2 font-mono flex items-center gap-2">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border border-[#00ff88] flex items-center justify-center text-[8px] sm:text-[10px] flex-shrink-0">✓</div>
                              SOLUTION
                            </h4>
                            <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed break-words">{integration.solution}</p>
                          </div>
                        </div>

                        {/* Implementation Details - Collapsible Style */}
                        <div className="bg-black/40 border border-[#00ff88]/10 p-3 sm:p-4 mb-3">
                          <h4 className="text-[10px] sm:text-xs font-semibold text-white mb-2 font-mono flex items-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[8px] sm:text-[10px] text-[#00ff88] flex-shrink-0">→</div>
                            IMPLEMENTATION
                          </h4>
                          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed break-words">{integration.implementation}</p>
                        </div>

                        {/* Value Proposition Highlight */}
                        <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border border-[#00ff88]/30 p-3 sm:p-4 relative overflow-hidden group-hover/card:from-[#00ff88]/20 transition-all">
                          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-l from-[#00ff88]/5 to-transparent"></div>
                          <div className="flex items-start gap-2 sm:gap-3 relative z-10">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00ff88] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                              $
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] sm:text-xs font-semibold text-[#00ff88] mb-1 font-mono">VALUE_PROPOSITION</h4>
                              <p className="text-gray-300 text-xs sm:text-sm font-mono leading-relaxed break-words">{integration.value}</p>
                            </div>
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
      </div>

      {/* Integration Architecture Section */}
      <div className="crypto-box-accent p-4 sm:p-6 lg:p-8 stagger-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              ⚙
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-mono break-words">INTEGRATION_ARCHITECTURE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
            {/* For Developers */}
            <div className="crypto-box p-4 sm:p-5 lg:p-6 crypto-box-hover">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-400/20 border border-purple-400 flex items-center justify-center text-[10px] sm:text-xs text-purple-400 font-mono font-bold flex-shrink-0">
                  DEV
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-400 font-mono">FOR_DEVELOPERS</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400 font-mono">
                {[
                  "Accept VeilPay withdrawals as valid payment sources",
                  "Verify ZK proofs via Clarity contract integration",
                  "No custody required—remains self-custodial",
                  "Plug-and-play privacy with minimal code changes"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 group/item">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-purple-400/30 flex items-center justify-center text-purple-400 text-[10px] sm:text-xs flex-shrink-0 mt-0.5 group-hover/item:bg-purple-400/10 transition-colors">
                      {i + 1}
                    </div>
                    <span className="group-hover/item:text-gray-300 transition-colors break-words flex-1 min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For End Users */}
            <div className="crypto-box p-4 sm:p-5 lg:p-6 crypto-box-hover">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center text-[10px] sm:text-xs text-[#00ff88] font-mono font-bold flex-shrink-0">
                  USR
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#00ff88] font-mono">FOR_END_USERS</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400 font-mono">
                {[
                  "Single deposit enables privacy across all integrated protocols",
                  "No need to learn new privacy tools for each dApp",
                  "Stronger anonymity set as ecosystem grows",
                  "Unified privacy UX across Stacks ecosystem"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3 group/item">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-[10px] sm:text-xs flex-shrink-0 mt-0.5 group-hover/item:bg-[#00ff88]/10 transition-colors">
                      {i + 1}
                    </div>
                    <span className="group-hover/item:text-gray-300 transition-colors break-words flex-1 min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Developer Resources */}
          <div className="crypto-box p-4 sm:p-5 border-l-2 sm:border-l-4 border-[#00ff88]">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00ff88] flex items-center justify-center text-black text-[10px] font-bold flex-shrink-0 mt-0.5 font-mono">
                []
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-mono flex-1 min-w-0 break-words">
                <strong className="text-white">DEVELOPER_RESOURCES:</strong> Integration guide, SDK, and testnet support available at{' '}
                <a
                  href="https://github.com/carlos-israelj/VeilPay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:text-white underline font-bold transition-colors break-all"
                >
                  github.com/carlos-israelj/VeilPay
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Closing Message */}
      <div className="text-center crypto-box p-4 sm:p-5 lg:p-6 stagger-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 border border-[#00ff88] flex items-center justify-center text-[#00ff88] flex-shrink-0">
              ∞
            </div>
            <span className="text-[#00ff88] font-mono text-xs sm:text-sm font-bold">NETWORK_EFFECT_PROTOCOL</span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-mono max-w-3xl mx-auto leading-relaxed">
            VeilPay provides the privacy infrastructure layer that the Stacks ecosystem needs to compete with traditional finance privacy standards.
            Every protocol that integrates VeilPay strengthens the network effect, creating better privacy for all users.
          </p>
        </div>
      </div>
    </div>
  );
}
