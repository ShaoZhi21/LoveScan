import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Simple risk analysis function (replace with your AI model)
function analyzeText(text: string) {
  const riskFactors = {
    urgency: text.toLowerCase().includes('urgent') || text.toLowerCase().includes('emergency'),
    money: text.toLowerCase().includes('money') || text.toLowerCase().includes('payment'),
    personalInfo: text.toLowerCase().includes('bank') || text.toLowerCase().includes('account'),
    romance: text.toLowerCase().includes('love') || text.toLowerCase().includes('relationship'),
  };

  const riskScore = Object.values(riskFactors).filter(Boolean).length * 25;

  return {
    riskScore,
    riskFactors,
    analysis: {
      summary: `Risk level: ${riskScore >= 75 ? 'High' : riskScore >= 50 ? 'Medium' : 'Low'}`,
      details: Object.entries(riskFactors)
        .filter(([_, hasRisk]) => hasRisk)
        .map(([factor]) => `Found ${factor} related risk patterns`)
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { scanId } = await req.json();

    // Get the scan data
    const { data: scan, error: scanError } = await supabase
      .from('chat_scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError) throw scanError;

    // Analyze the content
    const textToAnalyze = [
      scan.chat_log,
      scan.message_text
    ].filter(Boolean).join('\n');

    const analysis = analyzeText(textToAnalyze);

    // Update the scan with results
    const { error: updateError } = await supabase
      .from('chat_scans')
      .update({
        status: 'completed',
        risk_score: analysis.riskScore,
        report: analysis
      })
      .eq('id', scanId);

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