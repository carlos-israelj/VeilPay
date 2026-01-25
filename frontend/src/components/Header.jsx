import React from 'react';

export default function Header({ userData, connectWallet, disconnectWallet, activeTab, setActiveTab }) {
  // Determine network type
  const getNetworkInfo = () => {
    if (!userData) return null;

    const hasMainnet = userData.profile?.stxAddress?.mainnet;
    const hasTestnet = userData.profile?.stxAddress?.testnet;

    if (hasTestnet) {
      return { name: 'Testnet', color: 'text-[#EF466F]', bg: 'bg-[#EF466F]' };
    } else if (hasMainnet) {
      return { name: 'Mainnet', color: 'text-[#45B26A]', bg: 'bg-[#45B26A]' };
    }
    return { name: 'Unknown', color: 'text-[#777E90]', bg: 'bg-[#777E90]' };
  };

  const networkInfo = getNetworkInfo();

  return (
    <>
      <header className="bg-[#FBFCFC] border-b border-[#E5E8EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Logo and Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <img src="/favicon.png" alt="VeilPay Logo" className="w-10 h-10 object-contain" />
                </div>
                <span className="text-[#22262E] font-bold text-xl">VeilPay</span>
              </div>

              {/* Navigation Tabs - Always visible */}
              <nav className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'home'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('bridge')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'bridge'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  Bridge
                </button>
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'deposit'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'withdraw'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'how-it-works'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  How it Works
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'faq'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`px-3 py-2 font-bold text-xs sm:text-sm transition rounded-lg whitespace-nowrap ${
                    activeTab === 'integrations'
                      ? 'bg-[#3772FF] text-[#FBFCFC]'
                      : 'text-[#777E90] hover:text-[#22262E] hover:bg-[#F4F5F6]'
                  }`}
                >
                  Integrations
                </button>
              </nav>
            </div>

            {/* Wallet Button */}
            <div className="flex justify-center sm:justify-end">
              {!userData && (
                <button
                  onClick={connectWallet}
                  className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full text-sm font-bold transition"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Info Bar - Only show when connected */}
      {userData && (
        <div className="bg-[#F4F5F6] border-b border-[#E5E8EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              {/* Wallet Address and Network */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#777E90] text-xs font-bold">Connected:</span>
                  <div className="bg-[#FBFCFC] px-3 py-1.5 rounded-full border border-[#E5E8EB]">
                    <span className="text-[#353945] text-xs font-mono font-medium">
                      {userData.profile?.stxAddress?.testnet?.slice(0, 8)}...
                      {userData.profile?.stxAddress?.testnet?.slice(-6)}
                    </span>
                  </div>
                </div>

                {networkInfo && (
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${networkInfo.bg} animate-pulse`}></span>
                    <span className={`text-xs font-bold ${networkInfo.color}`}>
                      {networkInfo.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnectWallet}
                className="bg-[#FBFCFC] hover:bg-[#E5E8EB] text-[#22262E] px-5 py-2 rounded-full text-xs font-bold transition border border-[#E5E8EB]"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
