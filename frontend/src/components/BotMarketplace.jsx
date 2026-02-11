import { useState, useEffect } from 'react';
import BotCard from './BotCard';
import BotAnalysisModal from './BotAnalysisModal';
import axios from 'axios';

/**
 * BotMarketplace - Main bot marketplace interface
 * Cryptographic noir aesthetic matching VeilPay design
 */

export default function BotMarketplace({ userSession }) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch bots from relayer
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/x402/bots`);
        setBots(response.data.bots);
      } catch (error) {
        console.error('Error fetching bots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  // Fetch marketplace stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/x402/stats`);
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const handleHireBot = (bot) => {
    setSelectedBot(bot);
    setShowAnalysisModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-[#00ff88] font-mono text-sm">LOADING_MARKETPLACE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="crypto-box-accent p-6 sm:p-8 lg:p-10 relative overflow-hidden group">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        {/* Matrix rain effect (subtle) */}
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,#00ff88_10px,#00ff88_11px)]"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                BOT_MARKETPLACE
              </h1>
              <div className="flex items-center gap-2 text-[#00ff88] text-xs sm:text-sm font-mono">
                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
                AI_AGENT_ECONOMY
              </div>
            </div>

            {/* Stats Display */}
            {stats && (
              <div className="crypto-box p-4 border-[#00ff88]/30">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-[#00ff88]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {stats.totalPayments || 0}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">TOTAL_JOBS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#00ff88]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {Math.round((stats.totalRevenue?.STX || 0) / 1000000)}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">STX_REVENUE</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm sm:text-base font-mono leading-relaxed max-w-3xl">
            Hire autonomous AI agents to analyze Stacks projects. All payments are private via VeilPay ZK-SNARKs.
            No transaction graphs, no payment correlation. <span className="text-[#00ff88]">Fully unlinkable.</span>
          </p>

          {/* Features badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { icon: '🔐', text: 'ZK_PRIVACY' },
              { icon: '⚡', text: 'INSTANT_ANALYSIS' },
              { icon: '🤖', text: 'AI_POWERED' },
              { icon: '📊', text: 'MULTI_ASSET' }
            ].map((badge, idx) => (
              <div key={idx} className="crypto-box px-3 py-1.5 border-[#00ff88]/30 flex items-center gap-2">
                <span>{badge.icon}</span>
                <span className="text-xs font-mono text-gray-400">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            onHire={handleHireBot}
            disabled={!userSession?.isUserSignedIn()}
          />
        ))}
      </div>

      {/* Info Banner */}
      {!userSession?.isUserSignedIn() && (
        <div className="crypto-box border-yellow-500/30 p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="text-yellow-500 font-mono text-sm font-bold mb-2">
                WALLET_NOT_CONNECTED
              </div>
              <div className="text-gray-400 text-xs sm:text-sm font-mono">
                Connect your Stacks wallet to hire bots and run project analyses.
                All payments are private via VeilPay ZK proofs.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="crypto-box p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          HOW_IT_WORKS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'DEPOSIT_TO_POOL',
              desc: 'Deposit STX/USDCx/sBTC to VeilPay privacy pool',
              icon: '💰'
            },
            {
              step: '02',
              title: 'HIRE_BOTS',
              desc: 'Pay bots privately using ZK proofs (no correlation)',
              icon: '🤖'
            },
            {
              step: '03',
              title: 'GET_RESULTS',
              desc: 'Receive comprehensive analysis and recommendations',
              icon: '📊'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -top-2 -left-2 text-5xl font-black text-[#00ff88]/10" style={{ fontFamily: "'Syne', sans-serif" }}>
                {item.step}
              </div>
              <div className="relative z-10 pt-8">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-white font-mono text-sm font-bold mb-2">
                  {item.title}
                </div>
                <div className="text-gray-500 text-xs font-mono">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && selectedBot && (
        <BotAnalysisModal
          bot={selectedBot}
          userSession={userSession}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedBot(null);
          }}
        />
      )}
    </div>
  );
}
