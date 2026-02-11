import { useState } from 'react';

/**
 * BotCard - Individual bot display card
 * Matches VeilPay's cryptographic noir aesthetic
 */

const BOT_ICONS = {
  security: '🛡️',
  tokenomics: '📊',
  sentiment: '💭',
  coordinator: '🤖'
};

export default function BotCard({ bot, onHire, disabled }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleHire = () => {
    if (!disabled && onHire) {
      onHire(bot);
    }
  };

  return (
    <div
      className={`relative transition-all duration-300 group/card ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleHire}
    >
      {/* Card Container */}
      <div className={`crypto-box-accent p-5 sm:p-6 relative overflow-hidden ${
        isHovered && !disabled ? 'shadow-[0_0_30px_rgba(0,255,136,0.4)]' : ''
      }`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-purple-400/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"></div>

        {/* Diagonal pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00ff88_5px,#00ff88_6px)] group-hover/card:opacity-10 transition-opacity"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-purple-400/20 flex items-center justify-center text-2xl border border-[#00ff88]/30">
                {BOT_ICONS[bot.id]}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {bot.name}
                </h3>
                <div className="flex items-center gap-2 text-[#00ff88] text-xs font-mono mt-1">
                  <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse"></div>
                  AVAILABLE
                </div>
              </div>
            </div>

            {/* Price badge */}
            <div className="crypto-box px-3 py-1.5 border-[#00ff88]/50">
              <div className="text-[#00ff88] font-mono text-sm font-bold">
                {bot.pricing.STX}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed mb-4">
            {bot.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-wider">
              CAPABILITIES
            </div>
            <div className="space-y-1.5">
              {bot.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-400 font-mono">
                  <div className="w-1 h-1 bg-[#00ff88] rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated time */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {bot.estimatedTime}
          </div>

          {/* Hire button */}
          <button
            disabled={disabled}
            className={`w-full py-3 px-4 font-mono text-sm font-bold transition-all duration-300 relative overflow-hidden group/btn ${
              disabled
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'crypto-box-accent border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-black'
            }`}
          >
            {/* Button glow effect */}
            {!disabled && (
              <div className="absolute inset-0 bg-[#00ff88] opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
            )}

            <div className="relative z-10 flex items-center justify-center gap-2">
              <span>HIRE_BOT</span>
              <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00ff88] opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00ff88] opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
    </div>
  );
}
