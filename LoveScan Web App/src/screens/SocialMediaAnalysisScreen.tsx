import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface PlatformAnalysis {
  platform: string;
  indicators: {
    text: string;
    status: 'red' | 'yellow' | 'green';
  }[];
}

export const SocialMediaAnalysisScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<PlatformAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeSocialMedia = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Get the user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Authentication session not found. Please log in again.');
        }

        // Get the latest social media scan
        const { data: scanData, error: scanError } = await supabase
          .from('social_media_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (scanError) {
          if (scanError.code === 'PGRST116') {
            throw new Error('No social media data found to analyze. Please provide social media URLs first.');
          }
          throw scanError;
        }

        if (!scanData) {
          throw new Error('No social media data found to analyze. Please provide social media URLs first.');
        }

        // Call the social media analysis function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-social`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scanId: scanData.id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Social media analysis failed. Please try again.');
        }

        const analysis = await response.json();
        
        // Transform the analysis results into platform-specific analyses
        const platformAnalyses: PlatformAnalysis[] = [
          {
            platform: 'Instagram',
            indicators: [
              {
                text: 'Multiple accounts with similar names',
                status: analysis.instagram?.similarAccounts ? 'red' : 'green'
              },
              {
                text: 'Low follower/following ratio',
                status: analysis.instagram?.lowEngagement ? 'yellow' : 'green'
              },
              {
                text: 'Verified by another user',
                status: analysis.instagram?.verified ? 'green' : 'yellow'
              }
            ]
          },
          {
            platform: 'Facebook',
            indicators: [
              {
                text: 'Profile created recently',
                status: analysis.facebook?.newAccount ? 'red' : 'green'
              },
              {
                text: 'Limited friends/photo tags',
                status: analysis.facebook?.limitedConnections ? 'yellow' : 'green'
              },
              {
                text: 'Links to multiple platforms',
                status: analysis.facebook?.multiplePlatforms ? 'green' : 'yellow'
              }
            ]
          },
          {
            platform: 'Twitter',
            indicators: [
              {
                text: 'Suspicious behavior/high post counts',
                status: analysis.twitter?.suspiciousActivity ? 'red' : 'green'
              },
              {
                text: 'Recently created account',
                status: analysis.twitter?.newAccount ? 'yellow' : 'green'
              },
              {
                text: 'Verified/linked to other platforms',
                status: analysis.twitter?.verified ? 'green' : 'yellow'
              }
            ]
          }
        ];

        setAnalyses(platformAnalyses);
      } catch (error) {
        console.error('Error analyzing social media:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeSocialMedia();
  }, [navigate]);

  const getStatusDot = (status: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500'
    };

    return (
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
    );
  };

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">Social Media Analysis</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-white">Analyzing social media profiles...</div>
          </div>
        ) : error ? (
          <div className="text-white text-center p-4">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/social-media-scan')}
              className="mt-4 text-white underline"
            >
              Add Social Media Profiles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div 
                key={analysis.platform}
                className="bg-pink-100 rounded-lg p-4"
              >
                <h2 className="text-lg font-semibold mb-3">{analysis.platform}</h2>
                <div className="space-y-2">
                  {analysis.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {getStatusDot(indicator.status)}
                      <span className="text-sm">{indicator.text}</span>
                    </div>
                  ))}
                </div>
                <button className="text-sm text-[#8b0000] mt-2">View more ›</button>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#8b0000] text-white py-3 rounded-full font-medium mt-8 border-2 border-white"
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