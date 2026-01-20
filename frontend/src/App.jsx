import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Header from './components/Header';
import Stats from './components/Stats';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('deposit');

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <Header
        userData={userData}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            VeilPay
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Private USDCx transfers using Zero-Knowledge proofs
          </p>

          <Stats />

          {userData ? (
            <>
              <div className="flex space-x-4 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === 'deposit'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === 'withdraw'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {activeTab === 'deposit' ? (
                <Deposit userSession={userSession} />
              ) : (
                <Withdraw userSession={userSession} />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-6">
                Connect your wallet to start using VeilPay
              </p>
              <button
                onClick={connectWallet}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Connect Wallet
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg">
            <h3 className="text-white font-semibold mb-2">How it works:</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                <strong>Deposit:</strong> Lock USDCx with a private commitment
              </li>
              <li>
                <strong>Withdraw:</strong> Prove ownership without revealing the
                deposit
              </li>
              <li>
                <strong>Privacy:</strong> Zero-Knowledge proofs ensure complete
                anonymity
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
