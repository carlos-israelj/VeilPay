import { useState, useEffect } from 'react';
import axios from 'axios';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${RELAYER_URL}/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#00ff88]/20 bg-black/40 p-6 backdrop-blur-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-[#00ff88]/10 w-24 mb-4"></div>
            <div className="h-8 bg-[#00ff88]/10 w-16"></div>
          </div>
        </div>
        <div className="border border-[#00ff88]/20 bg-black/40 p-6 backdrop-blur-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-[#00ff88]/10 w-32 mb-4"></div>
            <div className="h-6 bg-[#00ff88]/10 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Generate hex pattern from root for visual effect
  const generatePattern = (root) => {
    const hexChars = root.slice(0, 32).split('');
    return hexChars.map((char, i) => ({
      char,
      opacity: (parseInt(char, 16) / 15) * 0.3 + 0.1,
      delay: i * 0.05
    }));
  };

  const pattern = stats.currentRoot ? generatePattern(stats.currentRoot) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Deposits */}
      <div className="relative border border-[#00ff88]/20 bg-black/40 backdrop-blur-sm overflow-hidden group hover:border-[#00ff88]/50 transition-colors">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2 text-[#00ff88] text-xs font-mono animate-pulse">
            {Array(8).fill(0).map((_, i) => (
              <span key={i} style={{ opacity: Math.random() * 0.5 + 0.3 }}>
                {Math.random().toString(16).substr(2, 2)}
                {i < 7 && ' '}
              </span>
            ))}
          </div>
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] font-mono text-sm group-hover:bg-[#00ff88]/10 transition-colors">
              Σ
            </div>
            <div className="flex-1">
              <div className="text-[#00ff88]/60 text-xs font-mono tracking-wider">
                TOTAL_DEPOSITS
              </div>
            </div>
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
          </div>

          {/* Value */}
          <div className="text-white text-5xl font-black mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            {stats.totalDeposits}
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-xs font-mono">
            deposits.count()
          </div>
        </div>
      </div>

      {/* Merkle Root */}
      <div className="relative border border-[#00ff88]/20 bg-black/40 backdrop-blur-sm overflow-hidden group hover:border-[#00ff88]/50 transition-colors">
        {/* Animated hex pattern derived from actual root */}
        <div className="absolute inset-0 opacity-5 font-mono text-xs text-[#00ff88] overflow-hidden">
          <div className="flex flex-wrap gap-1 p-2">
            {pattern.map((item, i) => (
              <span
                key={i}
                style={{
                  opacity: item.opacity,
                  animationDelay: `${item.delay}s`
                }}
                className="animate-pulse"
              >
                {item.char}
              </span>
            ))}
          </div>
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-sm group-hover:bg-[#00ff88]/10 transition-colors">
              🌳
            </div>
            <div className="flex-1">
              <div className="text-[#00ff88]/60 text-xs font-mono tracking-wider">
                MERKLE_ROOT
              </div>
            </div>
            <div className="text-[#00ff88]/40 text-xs font-mono">
              LIVE
            </div>
          </div>

          {/* Hash Value */}
          <div className="relative">
            <div className="text-white text-sm font-mono break-all mb-2 bg-black/40 p-3 border-l-2 border-[#00ff88]/30">
              {stats.currentRoot.slice(0, 32)}
              <span className="text-gray-600">...</span>
            </div>

            {/* Copy indicator */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-[#00ff88]/60 text-xs font-mono">
                [HASH]
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-xs font-mono">
            merkle.getRoot()
          </div>
        </div>
      </div>
    </div>
  );
}
