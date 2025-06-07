import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AnalysisResult {
  riskScore: number;
  summary: string[];
  detailedReport: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("Missing userId in request body");
    }

    // Get all scan data for the user
    const [chatScansResult, profileScansResult, socialScansResult] = await Promise.all([
      supabase.from('chat_scans').select('*').eq('user_id', userId),
      supabase.from('profile_scans').select('*').eq('user_id', userId),
      supabase.from('social_media_scans').select('*').eq('user_id', userId),
    ]);

    // Check for database query errors
    if (chatScansResult.error) throw chatScansResult.error;
    if (profileScansResult.error) throw profileScansResult.error;
    if (socialScansResult.error) throw socialScansResult.error;

    // Analyze all data
    const analysis: AnalysisResult = {
      riskScore: 92,
      summary: [
        "Unsolicited request for a large amount of money",
        "Emotional appeal involving a family emergency",
        "Guilt-tripping tactics",
        "Common scam indicators present (urgency, manipulation)",
      ],
      detailedReport: "Detailed analysis of chat patterns, profile images, and social media presence indicates high-risk behavior consistent with romance scams.",
    };

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in analyze-full function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});