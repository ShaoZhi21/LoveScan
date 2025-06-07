import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export const CheckPreviewScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#8b0000] h-screen flex flex-col p-6">
      <div className="flex-1 flex flex-col text-white">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">Think you're being love scammed?</span>
          <img src="/image-12.png" alt="Warning" className="w-5 h-5" />
        </div>
        <h2 className="text-xl mb-8">Check if it's a romance scam.</h2>
        
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/image-17.png" alt="Upload" className="w-7 h-7" />
            </div>
            <p className="text-lg">Upload and share as much information as possible</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/image-35.png" alt="AI" className="w-7 h-7" />
            </div>
            <p className="text-lg">LoveScan's AI-powered checker will provide its results in our report</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/image-16.png" alt="Report" className="w-7 h-7" />
            </div>
            <p className="text-lg">A detailed break-down report will be generated</p>
          </div>
        </div>
      </div>

      <Button 
        className="h-[50px] bg-[#ffd8df] rounded-[25px] hover:bg-[#ffc8d2]"
        onClick={() => navigate("/check")}
      >
        <span className="font-medium text-black text-lg">Start check</span>
      </Button>
    </div>
  );
};