import { createClient } from "npm:@supabase/supabase-js@2.39.0";

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

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  warnings?: Warning[];
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

function analyzeText(text: string): Warning[] {
  const warnings: Warning[] = [];
  
  for (const [key, { pattern, warning }] of Object.entries(scamPatterns)) {
    if (pattern.test(text)) {
      warnings.push(warning);
    }
  }
  
  return warnings;
}

async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  const pdfData = await response.arrayBuffer();
  
  // Here you would integrate with a PDF parsing library
  // For this example, we'll simulate parsing with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock extracted text
  return `
    User: Help...I need money
    Other: Oh no... Is everything ok?
    User: My dad is very ill and needs surgery
    Other: Can you transfer $10k to me so that I can help my dad?
    User: $10k?? I don't have that much money
    Other: I knew it, you don't care about me.
    User: I thought you loved me...
  `.trim();
}

function parseChat(text: string): ChatMessage[] {
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const isUser = line.startsWith('User:');
    const text = line.replace(/^(User|Other):/, '').trim();
    
    return {
      id: String(index + 1),
      text,
      isUser,
      timestamp: new Date(Date.now() - (index * 60000)).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      warnings: analyzeText(text)
    };
  });
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
      .from('chat_scans')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', user.id)
      .single();

    if (scanError) throw scanError;
    if (!scan) throw new Error('Scan not found');
    if (!scan.chat_log) throw new Error('No chatlog found');

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(scan.chat_log);
    
    // Parse and analyze the chat
    const messages = parseChat(extractedText);
    
    // Calculate risk score based on number of warnings
    const totalWarnings = messages.reduce((sum, msg) => sum + (msg.warnings?.length || 0), 0);
    const riskScore = Math.min(Math.round((totalWarnings / messages.length) * 100), 100);

    const analysis = {
      riskScore,
      messages
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