import React from "react";
import { useNavigate } from "react-router-dom";

export const DetailedReportScreen = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">Detailed Breakdown Report</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-20 space-y-4">
        {/* Reverse Image Search Results */}
        <button 
          onClick={() => navigate('/reverse-image-search')}
          className="w-full bg-[#FFE4E1] rounded-lg p-4 flex flex-col items-start"
        >
          <span className="font-medium text-lg mb-1">Reverse Image Search Results</span>
          <span className="text-sm text-gray-600">Based on your uploaded profile picture</span>
        </button>

        {/* Chatlog Analysis */}
        <button 
          onClick={() => navigate('/chatlog-analysis')}
          className="w-full bg-[#FFE4E1] rounded-lg p-4 flex flex-col items-start"
        >
          <span className="font-medium text-lg mb-1">Chatlog Analysis</span>
          <span className="text-sm text-gray-600">Based on your uploaded chatlog</span>
        </button>

        {/* Screenshot Chat Analysis */}
        <button 
          onClick={() => navigate('/screenshot-analysis')}
          className="w-full bg-[#FFE4E1] rounded-lg p-4 flex flex-col items-start"
        >
          <span className="font-medium text-lg mb-1">Screenshot Chat Analysis</span>
          <span className="text-sm text-gray-600">Based on your uploaded screenshots</span>
        </button>

        {/* Social Media Analysis */}
        <button 
          onClick={() => navigate('/social-media-analysis')}
          className="w-full bg-[#FFE4E1] rounded-lg p-4 flex flex-col items-start"
        >
          <span className="font-medium text-lg mb-1">Social Media Analysis</span>
          <span className="text-sm text-gray-600">Based on your provided social media URLs</span>
        </button>

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#8b0000] text-white py-3 rounded-full border-2 border-white font-medium mt-8"
        >
          Back
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