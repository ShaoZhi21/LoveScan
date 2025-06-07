import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

export const ProfileScanScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const { data, error } = await supabase.storage
          .from('profile_images')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;
        setImageUrl(data.path);
        
        // Auto-save to profile_scans
        await saveScanData(data.path);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const saveScanData = async (url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Create scan record
      const { error } = await supabase
        .from('profile_scans')
        .insert({
          user_id: user.id,
          image_url: url,
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
        <h2 className="text-xl font-medium mb-2">What is their profile picture?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Upload your partner's profile picture
        </p>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 hover:border-gray-400"
            disabled={isUploading}
          >
            <img src="/image.png" alt="Upload" className="w-6 h-6" />
            <span>{isUploading ? "Uploading..." : imageUrl ? "Image uploaded" : "Upload profile picture"}</span>
          </button>
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