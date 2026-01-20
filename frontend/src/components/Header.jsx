import React from 'react';

export default function Header({ userData, connectWallet, disconnectWallet }) {
  return (
    <header className="bg-black bg-opacity-50 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
          <span className="text-white font-bold text-xl">VeilPay</span>
        </div>

        <div>
          {userData ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                {userData.profile?.stxAddress?.testnet?.slice(0, 8)}...
                {userData.profile?.stxAddress?.testnet?.slice(-6)}
              </span>
              <button
                onClick={disconnectWallet}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
