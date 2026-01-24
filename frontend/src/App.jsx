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

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'VeilPay',
        icon: window.location.origin + '/logo.png',
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
    <div className="flex flex-col bg-[#FBFCFC] min-h-screen">
      {/* Header */}
      <div className="bg-[#FBFCFC] border-b border-[#E5E8EB]">
        <Header
          userData={userData}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Hero Section - Only show when wallet NOT connected */}
      {!userData && (
        <div className="bg-[#FBFCFC] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-8 sm:gap-10">
              <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-2xl">
                <span className="text-[#777E90] text-sm sm:text-base font-bold text-center">
                  Privacy-First Payments on Stacks
                </span>
                <h1 className="text-[#22262E] text-4xl sm:text-5xl lg:text-6xl font-bold text-center">
                  VeilPay
                </h1>
                <p className="text-[#777E90] text-sm sm:text-base text-center px-4">
                  Private USDCx transfers using Zero-Knowledge proofs
                </p>
              </div>

              {/* Stats Component */}
              <div className="w-full max-w-4xl">
                <Stats />
              </div>

              <button
                onClick={connectWallet}
                className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] py-4 px-8 rounded-full font-bold text-base transition"
              >
                Connect Wallet to Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Always visible */}
      <div className="bg-[#F4F5F6] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FBFCFC] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl max-w-5xl mx-auto">
          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'home' ? (
              <Home />
            ) : activeTab === 'bridge' ? (
              userData ? (
                <Bridge stacksAddress={userData?.profile?.stxAddress?.testnet} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-[#22262E] font-bold text-xl mb-2">Connect Wallet Required</h3>
                  <p className="text-[#777E90] text-sm mb-6 text-center max-w-md">
                    Please connect your Stacks wallet to access the bridge functionality
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full text-sm font-bold transition"
                  >
                    Connect Wallet
                  </button>
                </div>
              )
            ) : activeTab === 'deposit' ? (
              userData ? (
                <Deposit userSession={userSession} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-[#22262E] font-bold text-xl mb-2">Connect Wallet Required</h3>
                  <p className="text-[#777E90] text-sm mb-6 text-center max-w-md">
                    Please connect your Stacks wallet to make deposits
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full text-sm font-bold transition"
                  >
                    Connect Wallet
                  </button>
                </div>
              )
            ) : activeTab === 'withdraw' ? (
              userData ? (
                <Withdraw userSession={userSession} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="text-[#22262E] font-bold text-xl mb-2">Connect Wallet Required</h3>
                  <p className="text-[#777E90] text-sm mb-6 text-center max-w-md">
                    Please connect your Stacks wallet to make withdrawals
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full text-sm font-bold transition"
                  >
                    Connect Wallet
                  </button>
                </div>
              )
            ) : activeTab === 'history' ? (
              <History />
            ) : activeTab === 'how-it-works' ? (
              <HowItWorks />
            ) : activeTab === 'faq' ? (
              <FAQ />
            ) : null}
          </div>

          {/* How it Works Section - Remove or keep minimal */}
          {userData && (
            <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-[#F4F5F6] rounded-2xl">
              <h3 className="text-[#22262E] text-xl font-bold mb-6">
                How it works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#3772FF] flex items-center justify-center">
                      <span className="text-[#FBFCFC] text-sm font-bold">1</span>
                    </div>
                    <span className="text-[#22262E] text-base font-bold">Deposit</span>
                  </div>
                  <p className="text-[#777E90] text-sm">
                    Lock USDCx with a private commitment using Zero-Knowledge proofs
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#3772FF] flex items-center justify-center">
                      <span className="text-[#FBFCFC] text-sm font-bold">2</span>
                    </div>
                    <span className="text-[#22262E] text-base font-bold">Withdraw</span>
                  </div>
                  <p className="text-[#777E90] text-sm">
                    Prove ownership without revealing the deposit to any address
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#45B26A] flex items-center justify-center">
                      <span className="text-[#FBFCFC] text-sm font-bold">✓</span>
                    </div>
                    <span className="text-[#22262E] text-base font-bold">Privacy</span>
                  </div>
                  <p className="text-[#777E90] text-sm">
                    Complete anonymity ensured through cryptographic proofs
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )

      {/* Footer */}
      <div className="bg-[#FBFCFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-[#E5E8EB]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
              <span className="text-[#22262E] text-lg sm:text-xl font-bold">VeilPay</span>
              <div className="hidden sm:block bg-[#E5E8EB] w-[1px] h-6"></div>
              <span className="text-[#777E90] text-xs sm:text-sm">
                Privacy-preserving payments on Stacks
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-[#777E90] text-xs">
                © 2024 VeilPay. Built with ZK-SNARKs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
