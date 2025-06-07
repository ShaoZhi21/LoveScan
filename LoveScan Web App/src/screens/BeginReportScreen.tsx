import React from "react";
import { useNavigate } from "react-router-dom";

export const BeginReportScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full pt-3 px-4">
        <div className="text-white text-sm">9:45</div>
        <div className="flex items-center gap-2">
          <img src="/material-symbols-signal-wifi-4-bar.svg" alt="wifi" className="w-4 h-4 invert" />
          <img src="/carbon-dot-mark.svg" alt="signal" className="w-4 h-4 invert" />
          <img src="/raphael-charging.svg" alt="battery" className="w-4 h-4 invert" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-white text-2xl font-medium mb-8">
          Reporting love scams keeps others safe.
        </h1>

        {/* Information Points */}
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💕</span>
            </div>
            <p className="text-white pt-3">
              LoveScan will block it if the authorities mark it as a scam.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-white pt-3">
              Others will be alerted to this suspicious profile
            </p>
          </div>
        </div>

        <p className="text-white text-sm mt-12">
          This is not an official police report. If you fell for a scam, please file an e-report with the police.
        </p>
      </div>

      {/* Begin Report Button */}
      <div className="px-6 pb-20">
        <button 
          onClick={() => navigate('/scam-evidence')}
          className="w-full bg-white text-[#8b0000] py-4 rounded-lg font-medium"
        >
          Begin Report
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[60px] border-t border-white/20 flex items-center justify-around px-16 fixed bottom-0 left-0 right-0 bg-[#8b0000]">
        <img src="/material-symbols-home-outline.svg" alt="Home" className="w-6 h-6 invert" />
        <img src="/tabler-category.svg" alt="Categories" className="w-6 h-6 invert" />
        <img src="/material-symbols-help-outline-rounded.svg" alt="Help" className="w-6 h-6 invert" />
        <img src="/mdi-account.svg" alt="Account" className="w-6 h-6 invert" />
      </div>
    </div>
  );
};