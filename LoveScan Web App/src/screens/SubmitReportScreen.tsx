import React from "react";
import { useNavigate } from "react-router-dom";

export const SubmitReportScreen = (): JSX.Element => {
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

      {/* Close Button */}
      <div className="absolute top-12 right-4">
        <button 
          onClick={() => navigate('/home')} 
          className="text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-12 flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">💕</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-xl font-semibold text-center mb-8">
          We have submitted a love scam report for you
        </h1>

        {/* Timeline */}
        <div className="w-full relative">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-white opacity-20"></div>

          {/* Steps */}
          <div className="space-y-12">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-[#8b0000] text-sm">✓</span>
              </div>
              <p className="text-white text-sm pt-1">
                You and others helped flag this suspicious profile
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">•</span>
              </div>
              <p className="text-white text-sm pt-1">
                Awaiting review by LoveScan
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">•</span>
              </div>
              <p className="text-white text-sm pt-1">
                Others will be alerted to this suspicious profile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[60px] border-t border-white/20 flex items-center justify-around px-16">
        <img src="/material-symbols-home-outline.svg" alt="Home" className="w-6 h-6 invert" />
        <img src="/tabler-category.svg" alt="Categories" className="w-6 h-6 invert" />
        <img src="/material-symbols-help-outline-rounded.svg" alt="Help" className="w-6 h-6 invert" />
        <img src="/mdi-account.svg" alt="Account" className="w-6 h-6 invert" />
      </div>
    </div>
  );
};