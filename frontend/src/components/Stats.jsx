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
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-4 rounded-lg">
        <p className="text-purple-200 text-sm">Total Deposits</p>
        <p className="text-white text-2xl font-bold">{stats.totalDeposits}</p>
      </div>
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-4 rounded-lg">
        <p className="text-blue-200 text-sm">Merkle Root</p>
        <p className="text-white text-xs font-mono">
          {stats.currentRoot.slice(0, 10)}...
        </p>
      </div>
    </div>
  );
}
