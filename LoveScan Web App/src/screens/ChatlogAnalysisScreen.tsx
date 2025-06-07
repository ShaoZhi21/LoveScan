import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Warning {
  message: string;
  type: 'emotional_appeal' | 'manipulation' | 'guilt_trip' | 'urgency' | 'financial';
  description: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  warnings?: Warning[];
}

export const ChatlogAnalysisScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeChatlog = async () => {
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

        // Get the latest chat scan with chatlog
        const { data: scanData, error: scanError } = await supabase
          .from('chat_scans')
          .select('*')
          .eq('user_id', user.id)
          .not('chat_log', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (scanError) {
          if (scanError.code === 'PGRST116') {
            throw new Error('No chatlog found to analyze. Please upload a chatlog first.');
          }
          throw scanError;
        }

        if (!scanData) {
          throw new Error('No chatlog found to analyze. Please upload a chatlog first.');
        }

        // Call the chatlog analysis function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chatlog`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scanId: scanData.id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Chatlog analysis failed. Please try again.');
        }

        const analysis = await response.json();
        
        if (!analysis?.messages || !Array.isArray(analysis.messages)) {
          throw new Error('Invalid analysis response format');
        }

        setMessages(analysis.messages);
      } catch (error) {
        console.error('Error analyzing chatlog:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeChatlog();
  }, [navigate]);

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Header */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-white">Chatlog Analysis</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-t-[20px] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-600">Analyzing chatlog...</div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center p-4">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/chat-scan')}
              className="mt-4 text-[#8b0000] underline"
            >
              Upload a Chatlog
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="text-blue-500">‹ Chats</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div>
                  <div className="font-medium">Chat Analysis</div>
                  <div className="text-xs text-gray-500">Analyzing messages for potential scams</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%]">
                    <div 
                      className={`rounded-lg p-3 ${
                        message.isUser 
                          ? 'bg-green-100 text-black' 
                          : 'bg-white border text-black'
                      }`}
                    >
                      {message.text}
                      <div className="text-xs text-gray-500 mt-1">
                        {message.timestamp}
                      </div>
                    </div>
                    {message.warnings && message.warnings.map((warning, index) => (
                      <div 
                        key={index}
                        className="mt-1 bg-red-50 border border-red-200 rounded p-2 text-sm"
                      >
                        <div className="flex items-center gap-1 text-red-600">
                          <span>⚠️</span>
                          <span className="font-medium">{warning.message}</span>
                        </div>
                        <p className="text-red-600 text-xs mt-1">
                          {warning.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#8b0000] text-white py-3 rounded-full font-medium mt-8"
        >
          Back
        </button>
      </div>
    </div>
  );
};