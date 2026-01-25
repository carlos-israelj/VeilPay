import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Bridge from './components/Bridge';
import Header from './components/Header';
import Stats from './components/Stats';
import Home from './components/Home';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import History from './components/History';
import Integrations from './components/Integrations';
import ToastContainer from './components/Toast';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'VeilPay',
        icon: window.location.origin + '/veilpay-icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00ff88_2px,#00ff88_4px)]"
           style={{ animation: 'scanline 8s linear infinite' }}></div>

      {/* Header with cryptographic feel */}
      <header className="relative border-b border-[#00ff88]/20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            {/* Logo with hash visualization */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center transition-all group-hover:border-[#00ff88]/60 overflow-hidden rounded-lg">
                    <img src="/veilpay-icon.png" alt="VeilPay" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    VEILPAY
                  </h1>
                  <div className="text-xs text-[#00ff88]/60 tracking-widest">ZK-PROTOCOL</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-1 ml-8">
                {[
                  { id: 'home', label: 'HOME' },
                  { id: 'bridge', label: 'BRIDGE' },
                  { id: 'deposit', label: 'DEPOSIT' },
                  { id: 'withdraw', label: 'WITHDRAW' },
                  { id: 'history', label: 'HISTORY' },
                  { id: 'how-it-works', label: 'PROTOCOL' },
                  { id: 'faq', label: 'FAQ' },
                  { id: 'integrations', label: 'INTEGRATE' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-xs font-bold tracking-wider transition-all relative group ${
                      activeTab === tab.id
                        ? 'text-[#00ff88]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00ff88]"></div>
                    )}
                    <div className="absolute inset-0 border border-transparent group-hover:border-[#00ff88]/20 transition-colors"></div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Wallet connection */}
            <div className="flex items-center gap-4">
              {userData ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-black/60 border border-[#00ff88]/30 px-4 py-2">
                    <div className="w-2 h-2 bg-[#00ff88] animate-pulse"></div>
                    <span className="text-xs text-[#00ff88]">
                      {userData.profile?.stxAddress?.testnet?.slice(0, 6)}...
                      {userData.profile?.stxAddress?.testnet?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-bold tracking-wider"
                  >
                    DISCONNECT
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all font-bold text-sm tracking-wider relative group overflow-hidden"
                >
                  <span className="relative z-10">CONNECT WALLET</span>
                  <div className="absolute inset-0 bg-[#00ff88]/5 translate-x-full group-hover:translate-x-0 transition-transform"></div>
                </button>
              )}
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'home', label: 'HOME' },
              { id: 'bridge', label: 'BRIDGE' },
              { id: 'deposit', label: 'DEPOSIT' },
              { id: 'withdraw', label: 'WITHDRAW' },
              { id: 'history', label: 'HISTORY' },
              { id: 'how-it-works', label: 'PROTOCOL' },
              { id: 'faq', label: 'FAQ' },
              { id: 'integrations', label: 'INTEGRATE' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88]'
                    : 'border border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section - Only show when wallet NOT connected */}
      {!userData && activeTab === 'home' && (
        <div className="relative border-b border-[#00ff88]/10 py-20 px-4 overflow-hidden">
          {/* Animated hex pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-[#00ff88] text-xs animate-pulse">
              0x3a7f...b4c2
            </div>
            <div className="absolute top-20 right-20 text-[#00ff88] text-xs animate-pulse delay-100">
              0xd91e...5a8f
            </div>
            <div className="absolute bottom-20 left-1/4 text-[#00ff88] text-xs animate-pulse delay-200">
              0x7c4b...1f3d
            </div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col items-center gap-8 text-center">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#00ff88]/30 text-[#00ff88] text-xs tracking-widest font-bold">
                <div className="w-1.5 h-1.5 bg-[#00ff88] animate-pulse"></div>
                ZERO-KNOWLEDGE PRIVACY PROTOCOL
              </div>

              {/* Main title */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter"
                  style={{ fontFamily: "'Syne', sans-serif", lineHeight: 0.9 }}>
                <span className="block text-white">VEILPAY</span>
                <span className="block text-[#00ff88] mt-4">PRIVACY</span>
                <span className="block text-white mt-4">FOR USDC<span className="text-[#00ff88]">x</span></span>
              </h1>

              {/* Description */}
              <p className="max-w-2xl text-gray-400 text-base leading-relaxed">
                Break transaction surveillance. Private transfers using Groth16 ZK-SNARKs on Stacks blockchain.
                Provably anonymous. Cryptographically secure. Completely unstoppable.
              </p>

              {/* Stats display */}
              <div className="w-full max-w-3xl mt-8">
                <Stats />
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={connectWallet}
                  className="px-8 py-4 bg-[#00ff88] text-black hover:bg-[#00ff88]/90 transition-all font-bold text-sm tracking-wider relative group overflow-hidden"
                >
                  <span className="relative z-10">INITIALIZE CONNECTION</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </button>
                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="px-8 py-4 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all font-bold text-sm tracking-wider"
                >
                  STUDY PROTOCOL
                </button>
              </div>

              {/* Hash separator */}
              <div className="mt-12 text-[#00ff88]/20 text-xs font-mono">
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Content container with terminal aesthetic */}
          <div className="bg-black/40 border border-[#00ff88]/20 backdrop-blur-sm">
            {/* Terminal header */}
            <div className="border-b border-[#00ff88]/20 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <span className="ml-4 text-[#00ff88]/60 text-xs font-mono">
                  veilpay:~$ {activeTab}.execute()
                </span>
              </div>
              <div className="text-[#00ff88]/40 text-xs font-mono">
                {new Date().toISOString().split('T')[0]}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8 lg:p-12 min-h-[500px]">
              {activeTab === 'home' ? (
                <div className="fade-in-up">
                  <Home />
                </div>
              ) : activeTab === 'bridge' ? (
                userData ? (
                  <Bridge stacksAddress={userData?.profile?.stxAddress?.testnet} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-20 h-20 border border-[#00ff88]/30 flex items-center justify-center text-4xl">
                      🔒
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                        AUTHENTICATION REQUIRED
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 max-w-md">
                        Bridge functionality requires wallet connection for cross-chain USDCx transfers
                      </p>
                      <button
                        onClick={connectWallet}
                        className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all font-bold text-sm tracking-wider"
                      >
                        CONNECT WALLET
                      </button>
                    </div>
                  </div>
                )
              ) : activeTab === 'deposit' ? (
                userData ? (
                  <Deposit userSession={userSession} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-20 h-20 border border-[#00ff88]/30 flex items-center justify-center text-4xl">
                      🔒
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                        AUTHENTICATION REQUIRED
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 max-w-md">
                        Deposit operations require wallet connection for cryptographic commitment generation
                      </p>
                      <button
                        onClick={connectWallet}
                        className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all font-bold text-sm tracking-wider"
                      >
                        CONNECT WALLET
                      </button>
                    </div>
                  </div>
                )
              ) : activeTab === 'withdraw' ? (
                userData ? (
                  <Withdraw userSession={userSession} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-20 h-20 border border-[#00ff88]/30 flex items-center justify-center text-4xl">
                      🔒
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                        AUTHENTICATION REQUIRED
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 max-w-md">
                        Withdrawal operations require wallet connection for zero-knowledge proof verification
                      </p>
                      <button
                        onClick={connectWallet}
                        className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all font-bold text-sm tracking-wider"
                      >
                        CONNECT WALLET
                      </button>
                    </div>
                  </div>
                )
              ) : activeTab === 'history' ? (
                <History />
              ) : activeTab === 'how-it-works' ? (
                <HowItWorks />
              ) : activeTab === 'faq' ? (
                <FAQ />
              ) : activeTab === 'integrations' ? (
                <Integrations />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#00ff88]/10 bg-black/40 py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>
                VEILPAY
              </div>
              <div className="text-xs text-gray-500 font-mono">
                Zero-Knowledge Privacy Infrastructure
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-gray-500">
              <a href="https://github.com/carlos-israelj/VeilPay"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hover:text-[#00ff88] transition-colors tracking-wider">
                GITHUB
              </a>
              <div className="w-px h-4 bg-gray-700"></div>
              <span className="font-mono">© 2024 VEILPAY</span>
              <div className="w-px h-4 bg-gray-700"></div>
              <span className="text-[#00ff88]/60">ZK-SNARK POWERED</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
