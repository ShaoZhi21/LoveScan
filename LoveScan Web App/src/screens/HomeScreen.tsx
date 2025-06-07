import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export const HomeScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#8b0000] h-screen flex flex-col">
      {/* Header */}
      <div className="h-[100px] flex items-center justify-between px-6">
        <div className="text-2xl font-bold text-white">Love Scan</div>
        <div className="w-[45px] h-[45px] bg-[url(/image-1.png)] bg-cover bg-center rounded-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-[50px] p-6 flex flex-col gap-6">
        <div 
          className="bg-[#ffd8df] rounded-[25px] p-6 cursor-pointer"
          onClick={() => navigate("/check-preview")}
        >
          <h2 className="text-xl font-semibold mb-2">Check for love scams</h2>
          <p className="text-gray-600 text-sm">
            Use our dedicated AI agent to check if the person you are chatting with may be a fraud
          </p>
        </div>

        <div 
          className="bg-[#ffd8df] rounded-[25px] p-6 cursor-pointer"
          onClick={() => navigate("/begin-report")}
        >
          <h2 className="text-xl font-semibold mb-2">Submit a scam report</h2>
          <p className="text-gray-600 text-sm">
            Recently encountered a love scam? Submit a report to help us improve detection and protect others.
          </p>
        </div>
      </div>
    </div>
  );
};