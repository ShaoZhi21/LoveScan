import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const LoginScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        navigate("/home");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-screen flex flex-col px-6">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full pt-3">
        <div className="text-black text-sm">9:45</div>
        <div className="flex items-center gap-2">
          <img src="/material-symbols-signal-wifi-4-bar.svg" alt="wifi" className="w-4 h-4" />
          <img src="/carbon-dot-mark.svg" alt="signal" className="w-4 h-4" />
          <img src="/raphael-charging.svg" alt="battery" className="w-4 h-4" />
        </div>
      </div>

      {/* Back button and Logo */}
      <div className="mt-4 flex items-center">
        <button onClick={() => navigate(-1)} className="text-black">
          <span className="text-lg">← Back</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mt-8">
        <img 
          src="/CODE EXP 2025 TRIO SOLUTIONS (1).png" 
          alt="Logo" 
          className="w-32 h-32 object-contain"
        />
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="mt-8">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border-b border-gray-300 focus:outline-none focus:border-[#8b0000]"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 border-b border-gray-300 focus:outline-none focus:border-[#8b0000]"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8b0000] text-white py-4 rounded-lg mt-8 disabled:bg-opacity-70"
        >
          {isLoading ? "Logging in..." : "Continue"}
        </button>

        <div className="mt-4 text-center">
          <span className="text-gray-500 text-sm">New User? </span>
          <button 
            type="button"
            onClick={() => navigate("/signup")}
            className="text-[#8b0000] text-sm"
          >
            Sign up here.
          </button>
        </div>
      </form>
    </div>
  );
};