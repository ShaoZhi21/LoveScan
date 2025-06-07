import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { createWorker } from "npm:tesseract.js@5.0.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Warning {
  message: string;
  type: 'emotional_appeal' | 'manipulation' | 'guilt_trip' | 'urgency' | 'financial';
  description: string;
}

interface AnalyzedMessage {
  text: string;
  warnings: Warning[];
}

// Patterns to check in messages
const scamPatterns = {
  urgency: {
    pattern: /(urgent|emergency|asap|quickly|hurry)/i,
    warning: {
      type: 'urgency' as const,
      message: 'Warning!',
      description: 'Message creates false urgency - common in scams.'
    }
  },
  financial: {
    pattern: /(\$|usd|money|payment|transfer|bank|account)/i,
    warning: {
      type: 'financial' as const,
      message: 'Warning!',
      description: 'Suspicious financial request detected.'
    }
  },
  emotional: {
    pattern: /(love|trust|believe|help|sick|ill|hospital|surgery|accident)/i,
    warning: {
      type: 'emotional_appeal' as const,
      message: 'Warning!',
      description: 'Emotional manipulation detected - common in scams.'
    }
  },
  guilt: {
    pattern: /(don't care|thought you|if you really|prove)/i,
    warning: {
      type: 'guilt_trip' as const,
      message: 'Warning!',
      description: 'Guilt-tripping tactics detected.'
    }
  }
};

async function extractTextFromImage(imageUrl: string): Promise<string> {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  
  const { data: { text } } = await worker.recognize(imageBlob);
  
  await worker.terminate();
  return text;
}

function analyzeText(text: string): Warning[] {
  const warnings: Warning[] = [];
  
  for (const [key, { pattern, warning }] of Object.entries(scamPatterns)) {
    if (pattern.test(text)) {
      warnings.push(warning);
    }
  }
  
  return warnings;
}

function splitIntoMessages(text: string): string[] {
  // Split text into messages based on timestamps or message patterns
  return text.split(/\n{2,}/).filter(msg => msg.trim());
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

    // Get the scan data, ensuring it belongs to the current user
    const { data: scan, error: scanError } = await supabase
      .from('chat_scans')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (scanError) throw scanError;
    if (!scan) throw new Error('Scan not found');
    if (!scan.screenshot_url) throw new Error('No screenshot found');

    // Use the screenshot_url directly as it's already a complete URL
    const screenshotUrl = scan.screenshot_url;

    // Extract text from the screenshot
    const extractedText = await extractTextFromImage(screenshotUrl);
    
    // Split into individual messages
    const messages = splitIntoMessages(extractedText);
    
    // Analyze each message
    const analyzedMessages = messages.map(text => ({
      text,
      warnings: analyzeText(text)
    }));

    // Calculate risk score based on number of warnings
    const totalWarnings = analyzedMessages.reduce((sum, msg) => sum + msg.warnings.length, 0);
    const riskScore = Math.min(Math.round((totalWarnings / messages.length) * 100), 100);

    const analysis = {
      riskScore,
      messages: analyzedMessages
    };

    // Update the scan with results
    const { error: updateError } = await supabase
      .from('chat_scans')
      .update({
        status: 'completed',
        risk_score: riskScore,
        report: analysis
      })
      .eq('id', scanId)
      .eq('user_id', user.id); // Ensure we only update the user's own scan

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