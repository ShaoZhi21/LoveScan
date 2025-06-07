import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SocialMediaAnalysis {
  instagram?: {
    similarAccounts: boolean;
    lowEngagement: boolean;
    verified: boolean;
  };
  facebook?: {
    newAccount: boolean;
    limitedConnections: boolean;
    multiplePlatforms: boolean;
  };
  twitter?: {
    suspiciousActivity: boolean;
    newAccount: boolean;
    verified: boolean;
  };
}

function analyzeSocialMediaProfile(platform: string, url: string): any {
  // This is a mock implementation - replace with actual analysis logic
  switch (platform) {
    case 'instagram':
      return {
        similarAccounts: Math.random() > 0.5,
        lowEngagement: Math.random() > 0.5,
        verified: Math.random() > 0.7
      };
    case 'facebook':
      return {
        newAccount: Math.random() > 0.5,
        limitedConnections: Math.random() > 0.5,
        multiplePlatforms: Math.random() > 0.7
      };
    case 'twitter':
      return {
        suspiciousActivity: Math.random() > 0.5,
        newAccount: Math.random() > 0.5,
        verified: Math.random() > 0.7
      };
    default:
      return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId } = await req.json();
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    // Get the scan data
    const { data: scan, error: scanError } = await supabase
      .from('social_media_scans')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .single();

    if (scanError) throw scanError;
    if (!scan) throw new Error('Scan not found');
    if (!scan.social_data) throw new Error('No social media data found');

    const analysis: SocialMediaAnalysis = {};

    // Analyze each platform's data
    for (const [platform, data] of Object.entries(scan.social_data)) {
      if (data.url) {
        analysis[platform] = analyzeSocialMediaProfile(platform, data.url);
      }
    }

    // Calculate overall risk score
    const riskFactors = Object.values(analysis).flatMap(platformData => 
      Object.values(platformData).filter(value => value === true)
    );
    
    const riskScore = Math.min(Math.round((riskFactors.length / 9) * 100), 100);

    // Update the scan with results
    const { error: updateError } = await supabase
      .from('social_media_scans')
      .update({
        status: 'completed',
        risk_score: riskScore,
        report: { analysis, riskScore }
      })
      .eq('id', scanId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

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
    return new Response(
      JSON.stringify({ error: error.message }),
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