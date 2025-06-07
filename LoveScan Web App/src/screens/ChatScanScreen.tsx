import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

export const ChatScanScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const chatlogInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState("");
  const [chatlogUrl, setChatlogUrl] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChatlogUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const { data, error } = await supabase.storage
          .from('chatlogs')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;
        
        if (data?.path) {
          const { data: { publicUrl } } = supabase.storage
            .from('chatlogs')
            .getPublicUrl(data.path);
            
          setChatlogUrl(publicUrl);
          await saveScanData(publicUrl, screenshotUrl, messageText);
        }
      } catch (error) {
        console.error('Error uploading chatlog:', error);
        alert('Failed to upload chatlog. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const { data, error } = await supabase.storage
          .from('screenshots')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;
        
        if (data?.path) {
          const { data: { publicUrl } } = supabase.storage
            .from('screenshots')
            .getPublicUrl(data.path);
            
          setScreenshotUrl(publicUrl);
          await saveScanData(chatlogUrl, publicUrl, messageText);
        }
      } catch (error) {
        console.error('Error uploading screenshot:', error);
        alert('Failed to upload screenshot. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleMessageTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessageText(text);
    
    // Only save if we have actual text content
    if (text.trim()) {
      await saveScanData(chatlogUrl, screenshotUrl, text);
    }
  };

  const saveScanData = async (chatLog: string | null, screenshot: string | null, text: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Ensure at least one input is present
      if (!chatLog && !screenshot && !text?.trim()) {
        return;
      }

      // Create scan record
      const { error } = await supabase
        .from('chat_scans')
        .insert({
          user_id: user.id,
          chat_log: chatLog,
          screenshot_url: screenshot,
          message_text: text?.trim() || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error; // Re-throw to handle in the UI
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
        <h2 className="text-xl font-medium mb-2">What is the message?</h2>
        <p className="text-gray-600 text-sm mb-6">
          Upload your chatlog, screenshots or paste the full text of the message you received.
        </p>

        <div className="space-y-4">
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
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 hover:border-gray-400"
              disabled={isUploading}
            >
              <img src="/image.png" alt="Upload" className="w-6 h-6" />
              <span>{isUploading ? "Uploading..." : chatlogUrl ? "Chatlog uploaded" : "Upload chatlog"}</span>
            </button>
          </div>

          <div className="text-center text-gray-500">OR</div>

          <div>
            <input
              type="file"
              ref={screenshotInputRef}
              onChange={handleScreenshotUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => screenshotInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 hover:border-gray-400"
              disabled={isUploading}
            >
              <img src="/image.png" alt="Upload" className="w-6 h-6" />
              <span>{isUploading ? "Uploading..." : screenshotUrl ? "Screenshot uploaded" : "Upload message screenshot"}</span>
            </button>
          </div>

          <div className="text-center text-gray-500">OR</div>

          <textarea
            value={messageText}
            onChange={handleMessageTextChange}
            placeholder="Paste message text"
            className="w-full h-32 border-2 border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:border-gray-400"
          />
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