import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface SearchResult {
  url: string;
  similarity: number;
}

export const ReverseImageSearchScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImageAndSearch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: scanData, error: scanError } = await supabase
          .from('profile_scans')
          .select('image_url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (scanError) throw scanError;
        if (!scanData?.image_url) {
          throw new Error("No profile image found");
        }

        setProfileImage(scanData.image_url);

        // Call the reverse image search API
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reverse-image-search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_images/${scanData.image_url}` 
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const { results } = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileImageAndSearch();
  }, [navigate]);

  return (
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full pt-3 px-4">
        <div className="text-white text-sm">9:45</div>
        <div className="flex items-center gap-2">
          <img src="/material-symbols-signal-wifi-4-bar.svg" alt="wifi" className="w-4 h-4 invert" />
          <img src="/carbon-dot-mark.svg" alt="signal" className="w-4 h-4 invert" />
          <img src="/raphael-charging.svg" alt="battery" className="w-4 h-4 invert" />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold text-white">Reverse Image Search Results</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-[20px] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-gray-600">Searching...</div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center p-4">{error}</div>
        ) : (
          <>
            {profileImage && (
              <div className="w-48 h-48 mx-auto mb-6 rounded-lg overflow-hidden">
                <img 
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_images/${profileImage}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-gray-600 mb-4">Image was found at the following:</p>

            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <span className="text-sm text-gray-600 truncate flex-1 mr-2">{result.url}</span>
                  <button 
                    className="bg-[#8b0000] text-white px-4 py-1 rounded-full text-sm"
                    onClick={() => window.open(result.url, '_blank')}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#8b0000] text-white py-3 rounded-full font-medium mt-8"
        >
          Back
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