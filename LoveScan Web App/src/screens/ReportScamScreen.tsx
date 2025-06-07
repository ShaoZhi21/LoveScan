import React from "react";
import { useNavigate } from "react-router-dom";

export const ReportScamScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full pt-3 px-4">
        <div className="text-black text-sm">9:45</div>
        <div className="flex items-center gap-2">
          <img src="/material-symbols-signal-wifi-4-bar.svg" alt="wifi" className="w-4 h-4" />
          <img src="/carbon-dot-mark.svg" alt="signal" className="w-4 h-4" />
          <img src="/raphael-charging.svg" alt="battery" className="w-4 h-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-2xl font-medium mb-8">Report this as a love scam?</h1>

        {/* Information Points */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-2xl">💕</span>
            </div>
            <p className="text-gray-600">
              LoveScan will review and store this information
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600">
              Others will be alerted to this suspicious profile
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="px-6 pb-6">
        <button 
          onClick={() => navigate('/submit-report')}
          className="w-full bg-[#8b0000] text-white py-4 rounded-lg mb-3"
        >
          Report Love Scam
        </button>
        <button 
          onClick={() => navigate('/home')}
          className="w-full text-gray-600 py-2"
        >
          Not this time
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[60px] border-t flex items-center justify-around px-16">
        <img src="/material-symbols-home-outline.svg" alt="Home" className="w-6 h-6" />
        <img src="/tabler-category.svg" alt="Categories" className="w-6 h-6" />
        <img src="/material-symbols-help-outline-rounded.svg" alt="Help" className="w-6 h-6" />
        <img src="/mdi-account.svg" alt="Account" className="w-6 h-6" />
      </div>
    </div>
  );
};