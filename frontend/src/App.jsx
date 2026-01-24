import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Bridge from './components/Bridge';
import Header from './components/Header';
import Stats from './components/Stats';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('bridge');

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
        />
      </div>

      {/* Hero Section */}
      <div className="bg-[#FBFCFC] py-20 px-40">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-5 max-w-2xl">
            <span className="text-[#777E90] text-base font-bold">
              Privacy-First Payments on Stacks
            </span>
            <h1 className="text-[#22262E] text-6xl font-bold text-center">
              VeilPay
            </h1>
            <p className="text-[#777E90] text-base text-center">
              Private USDCx transfers using Zero-Knowledge proofs
            </p>
          </div>

          {/* Stats Component */}
          <div className="w-full max-w-4xl">
            <Stats />
          </div>

          {!userData && (
            <button
              onClick={connectWallet}
              className="flex flex-col items-start bg-[#3772FF] text-left py-4 px-6 rounded-[90px] border-0 cursor-pointer hover:bg-[#2C5CE6] transition"
            >
              <span className="text-[#FBFCFC] text-base font-bold">
                Connect Wallet
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {userData && (
        <div className="bg-[#F4F5F6] py-16 px-40">
          <div className="bg-[#FBFCFC] rounded-3xl p-12 shadow-xl max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-12 border-b border-[#E5E8EB]">
              <button
                onClick={() => setActiveTab('bridge')}
                className={`px-6 py-4 font-bold text-sm transition border-b-2 ${
                  activeTab === 'bridge'
                    ? 'text-[#3772FF] border-[#3772FF]'
                    : 'text-[#777E90] border-transparent hover:text-[#22262E]'
                }`}
              >
                Bridge
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={`px-6 py-4 font-bold text-sm transition border-b-2 ${
                  activeTab === 'deposit'
                    ? 'text-[#3772FF] border-[#3772FF]'
                    : 'text-[#777E90] border-transparent hover:text-[#22262E]'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`px-6 py-4 font-bold text-sm transition border-b-2 ${
                  activeTab === 'withdraw'
                    ? 'text-[#3772FF] border-[#3772FF]'
                    : 'text-[#777E90] border-transparent hover:text-[#22262E]'
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'bridge' ? (
                <Bridge stacksAddress={userData?.profile?.stxAddress?.testnet} />
              ) : activeTab === 'deposit' ? (
                <Deposit userSession={userSession} />
              ) : (
                <Withdraw userSession={userSession} />
              )}
            </div>

            {/* How it Works Section */}
            <div className="mt-12 p-8 bg-[#F4F5F6] rounded-2xl">
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
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#FBFCFC] py-12 px-40 mt-auto border-t border-[#E5E8EB]">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-[#22262E] text-xl font-bold">VeilPay</span>
            <div className="bg-[#E5E8EB] w-[1px] h-6"></div>
            <span className="text-[#777E90] text-sm">
              Privacy-preserving payments on Stacks
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#777E90] text-xs">
              © 2024 VeilPay. Built with ZK-SNARKs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
