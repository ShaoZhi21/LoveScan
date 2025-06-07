import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const ScamEvidenceScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const chatlogInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [socialMediaUrls, setSocialMediaUrls] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleChatlogUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const { data, error } = await supabase.storage
          .from('reported_chatlogs')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;
      } catch (error) {
        console.error('Error uploading chatlog:', error);
        alert('Failed to upload chatlog. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePhotosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      try {
        setIsUploading(true);
        for (const file of Array.from(files)) {
          const { error } = await supabase.storage
            .from('reported_photos')
            .upload(`${Date.now()}-${file.name}`, file);

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert('Failed to upload photos. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    navigate('/submit-report');
  };

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Love Scan</h1>
        <button onClick={() => navigate(-1)} className="text-white text-xl">×</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-[20px] p-6">
        <h2 className="text-xl font-medium mb-2">What is their information?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Upload your chatlog and photos you received
        </p>

        <div className="space-y-6">
          {/* Chatlog Upload */}
          <div>
            <input
              type="file"
              ref={chatlogInputRef}
              onChange={handleChatlogUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />
            <button 
              onClick={() => chatlogInputRef.current?.click()}
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center px-4 text-gray-600"
              disabled={isUploading}
            >
              <span className="mr-2">📱</span>
              Upload chatlog
            </button>
          </div>

          <div className="text-center text-gray-500">OR</div>

          {/* Photos Upload */}
          <div>
            <input
              type="file"
              ref={photosInputRef}
              onChange={handlePhotosUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button 
              onClick={() => photosInputRef.current?.click()}
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center px-4 text-gray-600"
              disabled={isUploading}
            >
              <span className="mr-2">📸</span>
              Upload Photos
            </button>
          </div>

          <div className="text-center text-gray-500">OR</div>

          {/* Social Media URLs */}
          <div>
            <input
              type="text"
              value={socialMediaUrls}
              onChange={(e) => setSocialMediaUrls(e.target.value)}
              placeholder="Upload Social Media URLs"
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          className="w-full bg-[#8b0000] text-white py-3 rounded-lg mt-8"
          disabled={isUploading}
        >
          Submit
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[60px] bg-white border-t flex items-center justify-around px-16">
        <img src="/material-symbols-home-outline.svg" alt="Home" className="w-6 h-6" />
        <img src="/tabler-category.svg" alt="Categories" className="w-6 h-6" />
        <img src="/material-symbols-help-outline-rounded.svg" alt="Help" className="w-6 h-6" />
        <img src="/mdi-account.svg" alt="Account" className="w-6 h-6" />
      </div>
    </div>
  );
};