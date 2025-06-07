import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface RiskReport {
  riskScore: number;
  summary: string[];
  detailedReport: string;
}

export const RiskReportScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [report, setReport] = useState<RiskReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeAllData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Trigger full analysis
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-full`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) throw new Error('Analysis failed');

        const analysisResult = await response.json();
        setReport({
          riskScore: analysisResult.riskScore,
          summary: [
            "Money request",
            "Family emergency",
            "Guilt tactics",
            "Urgency indicators"
          ],
          detailedReport: analysisResult.detailedReport,
        });
      } catch (error) {
        console.error('Error analyzing data:', error);
        alert('Failed to analyze data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeAllData();
  }, [navigate]);

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="text-white">☰</button>
          <span className="text-xl font-bold text-white">Love Scan</span>
        </div>
        <div className="w-[35px] h-[35px] bg-[url(/image-1.png)] bg-cover bg-center rounded-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-4 pb-20">
        {isLoading ? (
          <div className="text-white text-xl text-center mt-8">Analyzing data...</div>
        ) : report ? (
          <>
            {/* Risk Score Circle */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-8 border-[#FFA500] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-2xl font-bold">{report.riskScore}/100</div>
                  <div className="text-[#FFD700] text-4xl mt-2">⚠️</div>
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-white rounded-lg p-3 mb-4 flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>Do not proceed with conversation</span>
            </div>

            {/* Detailed Report Button */}
            <button 
              onClick={() => navigate('/detailed-report')}
              className="w-full bg-white rounded-lg p-4 mb-4 flex items-center justify-between"
            >
              <span className="font-medium">Detailed Breakdown Report</span>
              <span>📊</span>
            </button>

            {/* Summary Section */}
            <div>
              <h3 className="text-white text-xl mb-3">Summary</h3>
              <div className="space-y-2">
                {report.summary.map((item, index) => (
                  <div key={index} className="bg-[#FFE4E1] rounded-full py-2 px-4 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Text and Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#8b0000] px-4 pb-4 pt-2">
              <p className="text-white text-sm text-center mb-3">
                If you think this may be a love scam, you can report it to us
              </p>
              <button 
                onClick={() => navigate('/report')}
                className="w-full bg-[#8b0000] text-white py-3 rounded-full border-2 border-white font-medium"
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          <div className="text-white text-xl text-center mt-8">Failed to generate report</div>
        )}
      </div>
    </div>
  );
};