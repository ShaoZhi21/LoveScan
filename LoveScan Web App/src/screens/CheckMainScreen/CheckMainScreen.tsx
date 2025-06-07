import { HelpCircleIcon, HomeIcon, UserIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";

export const CheckMainScreen = (): JSX.Element => {
  const navigate = useNavigate();
  
  const handleFullScan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      navigate('/risk-report');
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/login');
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-[100px] flex items-center justify-between px-4">
        <button onClick={() => navigate(-1)}>
          <img
            src="/image-12.png"
            alt="Back"
            className="w-[30px] h-[30px]"
          />
        </button>
        <div className="text-2xl font-bold text-white">Love Scan</div>
        <div className="w-[45px] h-[45px] bg-[url(/image-1.png)] bg-cover bg-center" />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-[50px] p-6 relative">
        {/* Chat Scanner Section */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">Chat Scanner</h2>
          <Card 
            className="w-[150px] h-[150px] bg-[#ffd8df] rounded-[25px] border-black cursor-pointer"
            onClick={() => navigate('/chat-scan')}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <img
                className="w-[70px] h-[70px] object-cover mb-2"
                alt="Chat Log icon"
                src="/image.png"
              />
              <div className="font-medium text-black text-sm">Chat Log</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Scanner Section */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">Profile Scanner</h2>
          <div className="flex gap-4">
            <Card 
              className="w-[150px] h-[150px] bg-[#ffd8df] rounded-[25px] border-black cursor-pointer"
              onClick={() => navigate('/profile-scan')}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <img
                  className="w-[70px] h-[70px] object-cover mb-2"
                  alt="Image icon"
                  src="/image-17.png"
                />
                <div className="font-medium text-black text-sm">Image</div>
              </CardContent>
            </Card>
            <Card 
              className="w-[150px] h-[150px] bg-[#ffd8df] rounded-[25px] border-black cursor-pointer"
              onClick={() => navigate('/social-media-scan')}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <img
                  className="w-[70px] h-[70px] object-cover mb-2"
                  alt="Social Media icon"
                  src="/image-16.png"
                />
                <div className="font-medium text-black text-sm">Social Media</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Scan Button */}
        <Button 
          className="w-full h-[76px] bg-[#ffd8df] rounded-[25px] border border-black hover:bg-[#ffc8d2] mt-auto"
          onClick={handleFullScan}
        >
          <div className="flex items-center justify-between w-full px-8">
            <span className="font-medium text-black text-xl">Perform Full Scan</span>
            <img
              className="w-[50px] h-[50px] object-cover"
              alt="Scan icon"
              src="/image-35.png"
            />
          </div>
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="h-[72px] bg-white flex items-center justify-around px-16 border-t">
        <HomeIcon className="w-7 h-7 text-gray-700" />
        <img
          className="w-7 h-7"
          alt="Categories"
          src="/tabler-category.svg"
        />
        <HelpCircleIcon className="w-7 h-7 text-gray-700" />
        <UserIcon className="w-7 h-7 text-gray-700" />
      </div>
    </div>
  );
};