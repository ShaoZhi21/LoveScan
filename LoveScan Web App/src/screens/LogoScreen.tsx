import React from "react";
import { useNavigate } from "react-router-dom";

export const LogoScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-white h-screen flex flex-col items-center justify-between p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full pt-3">
        <div className="text-black text-sm">9:45</div>
        <div className="flex items-center gap-2">
          <img src="/material-symbols-signal-wifi-4-bar.svg" alt="wifi" className="w-4 h-4" />
          <img src="/carbon-dot-mark.svg" alt="signal" className="w-4 h-4" />
          <img src="/raphael-charging.svg" alt="battery" className="w-4 h-4" />
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img 
          src="/CODE EXP 2025 TRIO SOLUTIONS (1).png" 
          alt="Logo" 
          className="w-64 h-64 sm:w-96 sm:h-96 object-contain mb-8"
        />
      </div>

      {/* Button */}
      <div 
        onClick={() => navigate("/login")} 
        className="w-full bg-[#8b0000] text-white py-4 rounded-lg text-lg font-medium text-center cursor-pointer mb-4"
      >
        Let's Go
      </div>
    </div>
  );
}