import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

interface SocialMediaInput {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  url: string;
  screenshotUrl: string | null;
}

export const SocialMediaScanScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [socialInputs, setSocialInputs] = useState<SocialMediaInput[]>([
    { platform: 'instagram', url: '', screenshotUrl: null },
    { platform: 'facebook', url: '', screenshotUrl: null },
    { platform: 'linkedin', url: '', screenshotUrl: null },
    { platform: 'twitter', url: '', screenshotUrl: null },
  ]);

  const handleUrlChange = async (platform: SocialMediaInput['platform'], url: string) => {
    setSocialInputs(prev => 
      prev.map(input => 
        input.platform === platform ? { ...input, url } : input
      )
    );
    
    // Auto-save after URL change
    await saveScanData();
  };

  const handleScreenshotUpload = async (platform: SocialMediaInput['platform'], file: File) => {
    try {
      setIsUploading(true);
      const { data, error } = await supabase.storage
        .from('social_screenshots')
        .upload(`${Date.now()}-${platform}-${file.name}`, file);

      if (error) throw error;

      setSocialInputs(prev => 
        prev.map(input => 
          input.platform === platform ? { ...input, screenshotUrl: data.path } : input
        )
      );
      
      // Auto-save after screenshot upload
      await saveScanData();
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const saveScanData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const socialData: Record<string, { url?: string; screenshot_url?: string }> = {};

      // Collect URLs and screenshots
      for (const input of socialInputs) {
        if (!input.url && !input.screenshotUrl) continue;

        socialData[input.platform] = {};

        if (input.url) {
          socialData[input.platform].url = input.url;
        }

        if (input.screenshotUrl) {
          socialData[input.platform].screenshot_url = input.screenshotUrl;
        }
      }

      // Create scan record
      const { error } = await supabase
        .from('social_media_scans')
        .insert({
          user_id: user.id,
          social_data: socialData,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  };

  return (
    <div className="bg-white h-screen flex flex-col">
      {/* Header */}
      <div className="h-[100px] bg-[#8b0000] flex items-center justify-between px-6">
        <div className="text-2xl font-bold text-white">Love Scan</div>
        <div className="w-[45px] h-[45px] bg-[url(/image-1.png)] bg-cover bg-center rounded-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6">
        <h2 className="text-xl font-medium mb-2">What are their socials?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Upload your partner's social media URLs / Screenshots
        </p>

        <div className="space-y-6">
          {socialInputs.map((input) => (
            <div key={input.platform} className="space-y-2">
              <div className="flex items-center gap-2">
                <img 
                  src={`/${input.platform}-icon.png`} 
                  alt={input.platform} 
                  className="w-6 h-6"
                />
                <input
                  type="text"
                  placeholder={`Enter ${input.platform} URL`}
                  value={input.url}
                  onChange={(e) => handleUrlChange(input.platform, e.target.value)}
                  className="flex-1 p-3 border rounded-lg outline-none"
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleScreenshotUpload(input.platform, file);
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8b0000] file:text-white hover:file:bg-[#7a0000]"
                  disabled={isUploading}
                />
                {input.screenshotUrl && (
                  <p className="text-sm text-green-600 mt-1">Screenshot uploaded successfully</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#8b0000] text-white py-3 rounded-full font-medium text-lg hover:bg-[#7a0000] transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};