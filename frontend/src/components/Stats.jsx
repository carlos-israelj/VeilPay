import { useState, useEffect } from 'react';
import axios from 'axios';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001';

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${RELAYER_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#FBFCFC] p-8 rounded-3xl border border-[#E5E8EB] shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#3772FF] bg-opacity-10 flex items-center justify-center">
            <span className="text-[#3772FF] text-xl font-bold">📊</span>
          </div>
          <p className="text-[#777E90] text-sm font-bold">Total Deposits</p>
        </div>
        <p className="text-[#22262E] text-4xl font-bold">{stats.totalDeposits}</p>
      </div>
      <div className="bg-[#FBFCFC] p-8 rounded-3xl border border-[#E5E8EB] shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#45B26A] bg-opacity-10 flex items-center justify-center">
            <span className="text-[#45B26A] text-xl font-bold">🌳</span>
          </div>
          <p className="text-[#777E90] text-sm font-bold">Merkle Root</p>
        </div>
        <p className="text-[#22262E] text-sm font-mono break-all">
          {stats.currentRoot.slice(0, 16)}...
        </p>
      </div>
    </div>
  );
}
