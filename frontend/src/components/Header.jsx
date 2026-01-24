import React from 'react';

export default function Header({ userData, connectWallet, disconnectWallet }) {
  return (
    <header className="bg-[#FBFCFC] border-b border-[#E5E8EB]">
      <div className="max-w-7xl mx-auto px-40 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3772FF] flex items-center justify-center">
            <span className="text-[#FBFCFC] font-bold text-lg">V</span>
          </div>
          <span className="text-[#22262E] font-bold text-xl">VeilPay</span>
        </div>

        <div>
          {userData ? (
            <div className="flex items-center gap-4">
              <div className="bg-[#F4F5F6] px-4 py-2 rounded-full border border-[#E5E8EB]">
                <span className="text-[#353945] text-sm font-medium">
                  {userData.profile?.stxAddress?.testnet?.slice(0, 8)}...
                  {userData.profile?.stxAddress?.testnet?.slice(-6)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="bg-[#F4F5F6] hover:bg-[#E5E8EB] text-[#22262E] px-5 py-2 rounded-full text-sm font-bold transition border border-[#E5E8EB]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-[#3772FF] hover:bg-[#2C5CE6] text-[#FBFCFC] px-6 py-3 rounded-full text-sm font-bold transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
