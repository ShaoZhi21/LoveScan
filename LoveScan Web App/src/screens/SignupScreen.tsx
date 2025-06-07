import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const SignupScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
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
    <div className="bg-[#8b0000] min-h-screen flex flex-col">
      <div className="w-full h-[100px] flex items-center justify-between px-4">
        <button onClick={() => navigate(-1)}>
          <img
            src="/image-12.png"
            alt="Back"
            className="w-[30px] h-[30px]"
          />
        </button>
        <div className="text-3xl font-bold text-white">Love Scan</div>
        <div className="w-[30px]"></div>
      </div>
      
      <form onSubmit={handleSignup} className="w-full mt-8 px-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300"
          required
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-white text-[#8b0000] hover:bg-gray-100 rounded-lg disabled:bg-gray-200"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};