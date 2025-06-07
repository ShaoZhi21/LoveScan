const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads (if needed)
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to analyze chat for romance scam indicators
const analyzeScamPatterns = (chatText) => {
  const scamIndicators = {
    highRisk: [
      'western union', 'money transfer', 'wire money', 'send money', 'gift card',
      'emergency', 'urgent help', 'hospital', 'accident', 'stuck abroad',
      'bitcoin', 'cryptocurrency', 'investment opportunity', 'business proposal',
      'my love', 'my darling', 'my heart', 'soul mate' // when used excessively
    ],
    mediumRisk: [
      'military', 'deployed', 'overseas', 'peacekeeping', 'army', 'soldier',
      'engineer', 'oil rig', 'contractor', 'business trip',
      'widower', 'widow', 'lost my wife', 'lost my husband',
      'trust you', 'honest person', 'real love', 'true love'
    ],
    grammarPatterns: [
      'am from', 'i am loving you', 'how are you doing', 'how was your night',
      'good morning my love', 'good night my love', 'i miss you so much'
    ]
  };

  const text = chatText.toLowerCase();
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let grammarIssues = 0;
  const foundIndicators = [];

  // Check for high-risk indicators
  scamIndicators.highRisk.forEach(indicator => {
    if (text.includes(indicator)) {
      highRiskCount++;
      foundIndicators.push(`High Risk: "${indicator}"`);
    }
  });

  // Check for medium-risk indicators
  scamIndicators.mediumRisk.forEach(indicator => {
    if (text.includes(indicator)) {
      mediumRiskCount++;
      foundIndicators.push(`Medium Risk: "${indicator}"`);
    }
  });

  // Check for grammar patterns
  scamIndicators.grammarPatterns.forEach(pattern => {
    if (text.includes(pattern)) {
      grammarIssues++;
      foundIndicators.push(`Grammar Pattern: "${pattern}"`);
    }
  });

  return {
    highRiskCount,
    mediumRiskCount,
    grammarIssues,
    foundIndicators
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DSTA LoveScan Backend'
  });
});

// Chat analysis endpoint
app.post('/api/chat/analyze', async (req, res) => {
  try {
    const { chatText, participantNames } = req.body;

    if (!chatText) {
      return res.status(400).json({ 
        error: 'Missing chatText in request body' 
      });
    }

    // Validate OpenRouter API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    console.log('Analyzing chat with OpenRouter...');

    // First, do basic pattern analysis
    const patternAnalysis = analyzeScamPatterns(chatText);

    // Prepare the prompt for OpenRouter
    const analysisPrompt = `You are an expert in romance scam detection. Analyze this chat conversation for romance scam indicators and provide a comprehensive assessment with specific advice.

Chat conversation:
"""
${chatText}
"""

${participantNames ? `Participants: ${participantNames.join(', ')}` : ''}

Please analyze for these specific romance scam red flags:

1. **Financial requests** - Any requests for money, gifts, wire transfers, gift cards, cryptocurrency
2. **Emotional manipulation** - Excessive romantic language, quick profession of love, creating urgency
3. **Avoidance patterns** - Refusing video calls, avoiding specific questions, inconsistent details
4. **Common scammer profiles** - Military personnel, engineers, doctors working overseas, widowers
5. **Grammar and language patterns** - Non-native English patterns, generic romantic phrases
6. **Timeline analysis** - How quickly the relationship is progressing
7. **Emergency scenarios** - Sudden emergencies requiring financial help

For each section in detailedAnalysis, provide specific examples from the text and explain WHY it's dangerous and WHAT the user should do.

Provide your response in this exact JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "riskScore": 0-100,
  "primaryConcerns": ["list of main red flags found"],
  "detailedAnalysis": {
    "financialRequests": "Detailed analysis of any money requests with specific examples and why they're dangerous",
    "emotionalManipulation": "Analysis of emotional tactics with examples and why they're manipulative",
    "avoidancePatterns": "Analysis of avoidance behaviors with examples and what they indicate",
    "profileConsistency": "Analysis of profile claims with inconsistencies and why they're suspicious",
    "languagePatterns": "Analysis of language and grammar with examples and what they suggest",
    "timelineRedFlags": "Analysis of relationship progression speed and why it's concerning"
  },
  "recommendation": "Specific actionable advice for the user based on the findings",
  "confidence": "HIGH|MEDIUM|LOW confidence level in this assessment"
}`;

    // Make API call to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    console.log('OpenRouter API response received');

    let aiAnalysis;
    try {
      // Try to parse the AI response as JSON
      const aiResponse = response.data.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      console.log('Attempting to parse as JSON...');
      
      // Try to extract JSON from the response (in case there's extra text)
      let jsonString = aiResponse.trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
        console.log('Extracted JSON string:', jsonString);
      }
      
      aiAnalysis = JSON.parse(jsonString);
      console.log('Successfully parsed AI response as JSON');
    } catch (parseError) {
      console.warn('Failed to parse AI response, using enhanced fallback analysis');
      
      // Enhanced fallback analysis with screenshot consideration
      const hasScreenshots = screenshots && (screenshots.profileScreenshot || screenshots.postScreenshot);
      const hasVisionData = screenshotAnalysis.profileData?.analysisComplete || screenshotAnalysis.postData?.analysisComplete;
      
      // Use Vision API metrics if available
      const profileMetrics = screenshotAnalysis.profileData?.metrics;
      const postMetrics = screenshotAnalysis.postData?.metrics;
      
      let riskLevel = 'MEDIUM';
      let riskScore = 50;
      let primaryConcerns = [];
      
      if (hasVisionData && profileMetrics) {
        // Analyze based on actual extracted data
        const followerCount = profileMetrics.followerCount || 0;
        const isVerified = profileMetrics.isVerified;
        const followingCount = profileMetrics.followingCount || 0;
        
        console.log('📊 Using Vision API metrics for fallback analysis:', {
          followers: followerCount,
          verified: isVerified,
          following: followingCount
        });
        
        if (isVerified && followerCount > 100000) {
          riskLevel = 'HIGH';
          riskScore = 85;
          primaryConcerns = [
            'CELEBRITY/INFLUENCER ALERT: Account has millions of followers',
            'Extremely suspicious - celebrities do not randomly chat with strangers',
            'Very likely to be a catfish using stolen celebrity content'
          ];
        } else if (followerCount > 1000000) {
          riskLevel = 'HIGH';
          riskScore = 90;
          primaryConcerns = [
            'MAJOR RED FLAG: Account has over 1M followers',
            'High-profile accounts do not engage in personal romantic conversations',
            'Almost certainly a scammer using stolen celebrity photos'
          ];
        } else if (followerCount > 100000) {
          riskLevel = 'HIGH';
          riskScore = 80;
          primaryConcerns = [
            'WARNING: High-profile account detected',
            'Influencers/public figures rarely engage personally with strangers',
            'High probability of catfish/romance scam'
          ];
        } else if (followerCount > 10000 && isVerified) {
          riskLevel = 'MEDIUM';
          riskScore = 65;
          primaryConcerns = [
            'Verified account with significant following',
            'Question why this person is contacting you personally',
            'Verify identity through video calls before proceeding'
          ];
        } else if (followerCount < 100 && followingCount > 1000) {
          riskLevel = 'HIGH';
          riskScore = 80;
          primaryConcerns = [
            'Very low followers with high following count',
            'Suspicious follower-to-following ratio',
            'Pattern consistent with fake accounts'
          ];
        } else if (!isVerified && followerCount < 1000) {
          riskLevel = 'MEDIUM';
          riskScore = 60;
          primaryConcerns = [
            'Low follower count',
            'No verification badge',
            'Manual verification recommended'
          ];
        } else {
          riskLevel = 'LOW';
          riskScore = 35;
          primaryConcerns = [
            'Profile metrics within normal range for genuine personal accounts',
            'No significant red flags detected'
          ];
        }
      } else if (hasScreenshots) {
        riskLevel = 'MEDIUM';
        riskScore = 40;
        primaryConcerns = [
          'Screenshots uploaded but analysis incomplete',
          'Manual review of screenshots recommended'
        ];
      } else {
        primaryConcerns = [
          'Limited profile information provided',
          'Upload screenshots for more accurate analysis'
        ];
      }
      
      aiAnalysis = {
        riskLevel,
        riskScore,
        primaryConcerns,
        detailedAnalysis: {
          accountAge: hasVisionData ? 
            'Account age analysis based on screenshot visual indicators.' :
            'Unable to determine account age from provided information.',
          followerAnalysis: profileMetrics ? 
            `Follower analysis based on extracted metrics: ${profileMetrics.followerCount} followers, ${profileMetrics.followingCount} following. ${profileMetrics.isVerified ? 'Account is verified.' : 'Account not verified.'}` :
            hasScreenshots ? 'Screenshot provided but follower metrics could not be extracted.' :
            'Follower analysis requires screenshot or profile access.',
          contentQuality: postMetrics ?
            `Content analysis based on post engagement: ${postMetrics.likesCount} likes, ${postMetrics.commentsCount} comments detected.` :
            hasScreenshots ? 'Screenshots provided for content analysis.' :
            'Content quality assessment requires post screenshots.',
          engagementPatterns: (profileMetrics && postMetrics) ?
            `Engagement pattern analysis: ${((postMetrics.likesCount || 0) / (profileMetrics.followerCount || 1) * 100).toFixed(2)}% engagement rate detected.` :
            hasVisionData ? 'Engagement patterns analyzed from available screenshot data.' :
            'Engagement analysis requires profile and post screenshots.',
          profileInformation: profileMetrics ?
            `Profile completeness: ${profileMetrics.isVerified ? 'Verified account' : 'Unverified account'}, ${profileMetrics.isBusiness ? 'Business/Creator profile' : 'Personal profile'}, Platform: ${profileMetrics.platform}` :
            hasScreenshots ? 'Profile information extracted from screenshots.' :
            'Profile analysis requires screenshot upload.',
          geographicConsistency: 'Geographic consistency analysis requires additional location data.'
        },
        recommendation: riskLevel === 'HIGH' ?
          '⚠️ HIGH RISK: Multiple suspicious indicators detected. Avoid sharing personal information. Verify identity through video calls.' :
          riskLevel === 'MEDIUM' ?
          '⚡ MEDIUM RISK: Some concerns identified. ' + (hasVisionData ? 'Review extracted metrics carefully.' : 'Upload clearer screenshots for better analysis.') + ' Verify identity before proceeding.' :
          '✅ LOW RISK: ' + (hasVisionData ? 'Account metrics appear legitimate.' : 'No major red flags detected.') + ' Continue with normal caution and verify identity.',
        confidence: hasVisionData ? 'HIGH' : hasScreenshots ? 'MEDIUM' : 'LOW',
        suspiciousIndicators: {
          lowEngagement: profileMetrics ? 
            (profileMetrics.followerCount > 10000 && (!postMetrics || postMetrics.likesCount < profileMetrics.followerCount * 0.01)) :
            false,
          newAccount: false, // Cannot determine from screenshots alone
          stockPhotos: false, // Would require image analysis
          inconsistentPosting: false, // Would require timeline analysis
          fakeLooking: profileMetrics ? 
            (profileMetrics.followerCount < 100 && profileMetrics.followingCount > 1000) : 
            false,
          unverified: profileMetrics ? !profileMetrics.isVerified : !hasScreenshots
        }
      };
    }

    // Combine AI analysis with pattern analysis
    const combinedAnalysis = {
      ...aiAnalysis,
      patternAnalysis: {
        highRiskIndicators: patternAnalysis.highRiskCount,
        mediumRiskIndicators: patternAnalysis.mediumRiskCount,
        grammarIssues: patternAnalysis.grammarIssues,
        foundPatterns: patternAnalysis.foundIndicators
      },
      metadata: {
        chatLength: chatText.length,
        wordCount: chatText.split(/\s+/).length,
        analysisTimestamp: new Date().toISOString(),
        aiModel: 'anthropic/claude-3-sonnet'
      }
    };

    // Return the analysis
    res.json({
      success: true,
      data: combinedAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat analysis failed:', error.message);
    
    // Handle specific error types
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
      
      return res.status(error.response.status).json({
        error: `OpenRouter API error (${error.response.status})`,
        details: error.response.data,
        timestamp: new Date().toISOString()
      });
    }

    // General server error
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Social media analysis endpoint
app.post('/api/social-media/analyze', async (req, res) => {
  try {
    const { profileUrl, profileData, socialMediaType, screenshots } = req.body;

    if (!profileUrl && !screenshots) {
      return res.status(400).json({ 
        error: 'Missing profileUrl or screenshots in request body' 
      });
    }

    // Validate API keys
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    console.log('Analyzing social media profile with OpenRouter...');

    let screenshotAnalysis = {};
    
    // If screenshots are provided, analyze them first using Google Vision API
    if (screenshots && (screenshots.profileScreenshot || screenshots.postScreenshot)) {
      console.log('Processing screenshots for social media analysis...');
      
      try {
        if (screenshots.profileScreenshot) {
          console.log('Analyzing profile screenshot...');
          const profileImageAnalysis = await analyzeScreenshotWithVision(screenshots.profileScreenshot);
          screenshotAnalysis.profileData = profileImageAnalysis;
          console.log('✅ Profile screenshot analysis completed:', {
            hasText: !!profileImageAnalysis.extractedText,
            hasMetrics: !!profileImageAnalysis.metrics,
            followerCount: profileImageAnalysis.metrics?.followerCount,
            isVerified: profileImageAnalysis.metrics?.isVerified
          });
        }
        
        if (screenshots.postScreenshot) {
          console.log('Analyzing post screenshot...');
          const postImageAnalysis = await analyzeScreenshotWithVision(screenshots.postScreenshot);
          screenshotAnalysis.postData = postImageAnalysis;
          console.log('✅ Post screenshot analysis completed:', {
            hasText: !!postImageAnalysis.extractedText,
            hasMetrics: !!postImageAnalysis.metrics,
            likesCount: postImageAnalysis.metrics?.likesCount,
            commentsCount: postImageAnalysis.metrics?.commentsCount
          });
        }
        
        console.log('📊 Complete screenshot analysis data:', {
          profileAnalysisComplete: screenshotAnalysis.profileData?.analysisComplete,
          postAnalysisComplete: screenshotAnalysis.postData?.analysisComplete,
          hasProfileMetrics: !!screenshotAnalysis.profileData?.metrics,
          hasPostMetrics: !!screenshotAnalysis.postData?.metrics
        });
        
      } catch (visionError) {
        console.error('❌ Vision API analysis failed:', visionError.message);
        console.error('Vision API error details:', visionError);
        screenshotAnalysis.error = 'Failed to analyze screenshots: ' + visionError.message;
      }
    } else {
      console.log('ℹ️ No screenshots provided for analysis');
    }

    // Prepare the prompt for OpenRouter with screenshot data
    const analysisPrompt = `You are an expert in social media fraud detection and romance scam identification. Analyze this social media profile for suspicious patterns commonly found in fake accounts used for romance scams.

Social Media Profile Information:
Platform: ${socialMediaType || 'Instagram'}
Profile URL: ${profileUrl || 'Not provided'}
Profile Data: ${JSON.stringify(profileData, null, 2)}

${screenshots && (screenshotAnalysis.profileData || screenshotAnalysis.postData) ? `
SCREENSHOT ANALYSIS RESULTS:
${screenshotAnalysis.profileData ? `
PROFILE SCREENSHOT DATA:
- Extracted Text: ${screenshotAnalysis.profileData.extractedText || 'No text detected'}
- Detected Numbers: ${screenshotAnalysis.profileData.detectedNumbers?.join(', ') || 'None'}
- Follower Count: ${screenshotAnalysis.profileData.metrics?.followerCount || 'Not detected'}
- Following Count: ${screenshotAnalysis.profileData.metrics?.followingCount || 'Not detected'}
- Post Count: ${screenshotAnalysis.profileData.metrics?.postCount || 'Not detected'}
- Verified Account: ${screenshotAnalysis.profileData.metrics?.isVerified ? 'YES ✓' : 'No verification detected'}
- Business Account: ${screenshotAnalysis.profileData.metrics?.isBusiness ? 'YES' : 'No'}
- Platform Detected: ${screenshotAnalysis.profileData.metrics?.platform || 'Unknown'}
` : ''}

${screenshotAnalysis.postData ? `
POST SCREENSHOT DATA:
- Extracted Text: ${screenshotAnalysis.postData.extractedText || 'No text detected'}
- Detected Numbers: ${screenshotAnalysis.postData.detectedNumbers?.join(', ') || 'None'}
- Likes Count: ${screenshotAnalysis.postData.metrics?.likesCount || 'Not detected'}
- Comments Count: ${screenshotAnalysis.postData.metrics?.commentsCount || 'Not detected'}
- Post Quality Indicators: ${screenshotAnalysis.postData.labels?.map(l => l.description).join(', ') || 'No quality indicators detected'}
` : ''}

ANALYSIS INSTRUCTIONS:
Based on the screenshot data above, analyze the account legitimacy FOR ROMANCE SCAM DETECTION:

1. **CELEBRITY/HIGH FOLLOWER ALERT (100K+)**: MAJOR RED FLAG - Celebrities and influencers do not randomly engage in romantic conversations with strangers. This is almost always a catfish/scammer using stolen content.
2. **High Follower Count (10K-100K)**: SUSPICIOUS - Question why this person is contacting you personally
3. **Verification Badge**: Does not make high-follower accounts safer - still very suspicious for personal contact
4. **Normal Engagement**: Personal accounts (under 5K followers) with proportional engagement are safer
5. **Suspicious Patterns**: Very low followers with high following, no verification with suspicious content

CRITICAL: High follower counts in romance contexts = HIGH RISK. Use the ACTUAL NUMBERS from screenshots above.`
 : 'Note: No screenshot data available - analysis will be limited to URL patterns only.'}

Please analyze for these specific red flags:

1. **Account Verification & Authenticity** - Use screenshot verification data
2. **Follower Analysis** - Use actual follower counts from screenshots  
3. **Content Quality** - Assess based on screenshot visual indicators
4. **Engagement Patterns** - Analyze likes/comments ratio from screenshot data
5. **Profile Completeness** - Check bio, verification from screenshots
6. **Suspicious Indicators** - Look for fake patterns vs. legitimate metrics

${screenshots ? 'IMPORTANT: Base your analysis primarily on the actual numbers and verification status extracted from screenshots above. If the account has millions of followers and is verified, it should be LOW RISK.' : 'LIMITED ANALYSIS: Without screenshots, analysis is based on URL patterns only.'}

Respond in this exact JSON format:
{
  "riskLevel": "LOW|MEDIUM|HIGH",
  "riskScore": 0-100,
  "primaryConcerns": ["list of main red flags found or positive indicators"],
  "detailedAnalysis": {
    "accountAge": "Analysis based on screenshot data or limitations",
    "followerAnalysis": "Analysis of actual follower counts from screenshots",
    "contentQuality": "Analysis based on screenshot visual quality and engagement",
    "engagementPatterns": "Analysis of likes/comments ratios from screenshot data",
    "profileInformation": "Analysis of verification status and profile completeness from screenshots", 
    "geographicConsistency": "Analysis of location data if available"
  },
  "recommendation": "Specific advice based on screenshot analysis results",
  "confidence": "HIGH|MEDIUM|LOW confidence level",
  "suspiciousIndicators": {
    "lowEngagement": true/false,
    "newAccount": true/false,
    "stockPhotos": true/false,
    "inconsistentPosting": true/false,
    "fakeLooking": true/false,
    "unverified": true/false
  }
}`;

    // Make API call to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    console.log('OpenRouter API response received');

    let aiAnalysis;
    try {
      // Try to parse the AI response as JSON
      const aiResponse = response.data.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      // Try to extract JSON from the response
      let jsonString = aiResponse.trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }
      
      aiAnalysis = JSON.parse(jsonString);
      console.log('Successfully parsed social media AI response');
    } catch (parseError) {
      console.warn('Failed to parse AI response, using enhanced fallback analysis');
      
      // Enhanced fallback analysis with screenshot consideration
      const hasScreenshots = screenshots && (screenshots.profileScreenshot || screenshots.postScreenshot);
      const hasVisionData = screenshotAnalysis.profileData?.analysisComplete || screenshotAnalysis.postData?.analysisComplete;
      
      // Use Vision API metrics if available
      const profileMetrics = screenshotAnalysis.profileData?.metrics;
      const postMetrics = screenshotAnalysis.postData?.metrics;
      
      let riskLevel = 'MEDIUM';
      let riskScore = 50;
      let primaryConcerns = [];
      
      if (hasVisionData && profileMetrics) {
        // Analyze based on actual extracted data
        const followerCount = profileMetrics.followerCount || 0;
        const isVerified = profileMetrics.isVerified;
        const followingCount = profileMetrics.followingCount || 0;
        
        console.log('📊 Using Vision API metrics for fallback analysis:', {
          followers: followerCount,
          verified: isVerified,
          following: followingCount
        });
        
        if (isVerified && followerCount > 100000) {
          riskLevel = 'HIGH';
          riskScore = 85;
          primaryConcerns = [
            'CELEBRITY/INFLUENCER ALERT: Account has millions of followers',
            'Extremely suspicious - celebrities do not randomly chat with strangers',
            'Very likely to be a catfish using stolen celebrity content'
          ];
        } else if (followerCount > 1000000) {
          riskLevel = 'HIGH';
          riskScore = 90;
          primaryConcerns = [
            'MAJOR RED FLAG: Account has over 1M followers',
            'High-profile accounts do not engage in personal romantic conversations',
            'Almost certainly a scammer using stolen celebrity photos'
          ];
        } else if (followerCount > 100000) {
          riskLevel = 'HIGH';
          riskScore = 80;
          primaryConcerns = [
            'WARNING: High-profile account detected',
            'Influencers/public figures rarely engage personally with strangers',
            'High probability of catfish/romance scam'
          ];
        } else if (followerCount > 10000 && isVerified) {
          riskLevel = 'MEDIUM';
          riskScore = 65;
          primaryConcerns = [
            'Verified account with significant following',
            'Question why this person is contacting you personally',
            'Verify identity through video calls before proceeding'
          ];
        } else if (followerCount < 100 && followingCount > 1000) {
          riskLevel = 'HIGH';
          riskScore = 80;
          primaryConcerns = [
            'Very low followers with high following count',
            'Suspicious follower-to-following ratio',
            'Pattern consistent with fake accounts'
          ];
        } else if (!isVerified && followerCount < 1000) {
          riskLevel = 'MEDIUM';
          riskScore = 60;
          primaryConcerns = [
            'Low follower count',
            'No verification badge',
            'Manual verification recommended'
          ];
        } else {
          riskLevel = 'LOW';
          riskScore = 35;
          primaryConcerns = [
            'Profile metrics within normal range for genuine personal accounts',
            'No significant red flags detected'
          ];
        }
      } else if (hasScreenshots) {
        riskLevel = 'MEDIUM';
        riskScore = 40;
        primaryConcerns = [
          'Screenshots uploaded but analysis incomplete',
          'Manual review of screenshots recommended'
        ];
      } else {
        primaryConcerns = [
          'Limited profile information provided',
          'Upload screenshots for more accurate analysis'
        ];
      }
      
      aiAnalysis = {
        riskLevel,
        riskScore,
        primaryConcerns,
        detailedAnalysis: {
          accountAge: hasVisionData ? 
            'Account age analysis based on screenshot visual indicators.' :
            'Unable to determine account age from provided information.',
          followerAnalysis: profileMetrics ? 
            `Follower analysis based on extracted metrics: ${profileMetrics.followerCount} followers, ${profileMetrics.followingCount} following. ${profileMetrics.isVerified ? 'Account is verified.' : 'Account not verified.'}` :
            hasScreenshots ? 'Screenshot provided but follower metrics could not be extracted.' :
            'Follower analysis requires screenshot or profile access.',
          contentQuality: postMetrics ?
            `Content analysis based on post engagement: ${postMetrics.likesCount} likes, ${postMetrics.commentsCount} comments detected.` :
            hasScreenshots ? 'Screenshots provided for content analysis.' :
            'Content quality assessment requires post screenshots.',
          engagementPatterns: (profileMetrics && postMetrics) ?
            `Engagement pattern analysis: ${((postMetrics.likesCount || 0) / (profileMetrics.followerCount || 1) * 100).toFixed(2)}% engagement rate detected.` :
            hasVisionData ? 'Engagement patterns analyzed from available screenshot data.' :
            'Engagement analysis requires profile and post screenshots.',
          profileInformation: profileMetrics ?
            `Profile completeness: ${profileMetrics.isVerified ? 'Verified account' : 'Unverified account'}, ${profileMetrics.isBusiness ? 'Business/Creator profile' : 'Personal profile'}, Platform: ${profileMetrics.platform}` :
            hasScreenshots ? 'Profile information extracted from screenshots.' :
            'Profile analysis requires screenshot upload.',
          geographicConsistency: 'Geographic consistency analysis requires additional location data.'
        },
        recommendation: riskLevel === 'HIGH' ?
          '⚠️ HIGH RISK: Multiple suspicious indicators detected. Avoid sharing personal information. Verify identity through video calls.' :
          riskLevel === 'MEDIUM' ?
          '⚡ MEDIUM RISK: Some concerns identified. ' + (hasVisionData ? 'Review extracted metrics carefully.' : 'Upload clearer screenshots for better analysis.') + ' Verify identity before proceeding.' :
          '✅ LOW RISK: ' + (hasVisionData ? 'Account metrics appear legitimate.' : 'No major red flags detected.') + ' Continue with normal caution and verify identity.',
        confidence: hasVisionData ? 'HIGH' : hasScreenshots ? 'MEDIUM' : 'LOW',
        suspiciousIndicators: {
          lowEngagement: profileMetrics ? 
            (profileMetrics.followerCount > 10000 && (!postMetrics || postMetrics.likesCount < profileMetrics.followerCount * 0.01)) :
            false,
          newAccount: false, // Cannot determine from screenshots alone
          stockPhotos: false, // Would require image analysis
          inconsistentPosting: false, // Would require timeline analysis
          fakeLooking: profileMetrics ? 
            (profileMetrics.followerCount < 100 && profileMetrics.followingCount > 1000) : 
            false,
          unverified: profileMetrics ? !profileMetrics.isVerified : !hasScreenshots
        }
      };
    }

    // Add metadata including screenshot analysis
    const analysisResult = {
      ...aiAnalysis,
      screenshotAnalysis: screenshotAnalysis,
      metadata: {
        profileUrl: profileUrl || 'Not provided',
        platform: socialMediaType || 'Unknown',
        hasScreenshots: !!(screenshots && (screenshots.profileScreenshot || screenshots.postScreenshot)),
        analysisTimestamp: new Date().toISOString(),
        aiModel: 'anthropic/claude-3-sonnet'
      }
    };

    // Return the analysis
    res.json({
      success: true,
      data: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Social media analysis failed:', error.message);
    
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      return res.status(error.response.status).json({
        error: `OpenRouter API error (${error.response.status})`,
        details: error.response.data,
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to analyze screenshots using Google Vision API
async function analyzeScreenshotWithVision(imageData) {
  try {
    console.log('🔍 Starting Google Vision analysis for social media screenshot...');
    
    // Handle base64 image data
    let imageBase64;
    if (imageData.startsWith('data:image')) {
      imageBase64 = imageData.split(',')[1];
      console.log('✅ Base64 image data received, length:', imageBase64.length);
    } else {
      throw new Error('Invalid image format - expected base64 data URL');
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 100, // Increased to catch more text
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 30,
            },
            {
              type: 'LOGO_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    };

    console.log('📡 Sending request to Google Vision API...');
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const visionData = response.data.responses[0];
    
    if (visionData.error) {
      throw new Error(visionData.error.message);
    }

    console.log('✅ Google Vision API response received');

    // Extract text and look for social media patterns
    const extractedText = visionData.fullTextAnnotation?.text || '';
    console.log('📝 Extracted text length:', extractedText.length);
    console.log('📝 Sample text:', extractedText.substring(0, 200) + '...');
    
    // Enhanced number extraction with various formats
    const numbers = extractedText.match(/\d+(?:,\d+)*(?:\.\d+)?[KMB]?/gi) || [];
    console.log('🔢 Found numbers:', numbers);
    
    // Enhanced social media pattern detection
    const socialMediaPatterns = {
      // Follower patterns - enhanced to catch "14.5 M" format properly
      followers: extractedText.match(/(\d+(?:\.\d+)?)\s*M\s*followers?/i) ||
                extractedText.match(/(\d+(?:\.\d+)?)\s*K\s*followers?/i) ||
                extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*followers?/i) ||
                extractedText.match(/followers?\s*(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i) ||
                extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*Followers/i),
      
      // Following patterns - enhanced similarly
      following: extractedText.match(/(\d+(?:\.\d+)?)\s*M\s*following/i) ||
                extractedText.match(/(\d+(?:\.\d+)?)\s*K\s*following/i) ||
                extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*following/i) ||
                extractedText.match(/following\s*(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i) ||
                extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*Following/i),
      
      // Posts patterns
      posts: extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*posts?/i) ||
             extractedText.match(/posts?\s*(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i) ||
             extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*Posts/i),
      
      // Likes patterns (for individual posts)
      likes: extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*likes?/i) ||
             extractedText.match(/likes?\s*(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i) ||
             extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*Likes/i),
      
      // Comments patterns
      comments: extractedText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*comments?/i) ||
                extractedText.match(/comments?\s*(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i),
      
      // Verification detection - multiple indicators
      verified: extractedText.includes('✓') || 
                extractedText.includes('Verified') || 
                extractedText.includes('verified') ||
                extractedText.toLowerCase().includes('blue checkmark') ||
                visionData.labelAnnotations?.some(label => 
                  label.description.toLowerCase().includes('verified') ||
                  label.description.toLowerCase().includes('checkmark')
                ),
      
      // Account type detection
      businessAccount: extractedText.toLowerCase().includes('business') ||
                      extractedText.toLowerCase().includes('professional') ||
                      extractedText.toLowerCase().includes('creator'),
      
      // Platform detection
      platform: extractedText.toLowerCase().includes('instagram') ? 'Instagram' :
                extractedText.toLowerCase().includes('facebook') ? 'Facebook' :
                extractedText.toLowerCase().includes('twitter') ? 'Twitter' :
                extractedText.toLowerCase().includes('linkedin') ? 'LinkedIn' : 'Unknown'
    };

    // Parse numbers to actual values for analysis
    const parseNumber = (numberString) => {
      if (!numberString) return 0;
      
      console.log('🔢 Parsing number:', numberString);
      
      // Handle "14.5 M" format where M is separate (priority check)
      if (extractedText.includes(`${numberString} M`)) {
        const baseNumber = parseFloat(numberString);
        console.log('📊 Found M format:', numberString, '→', baseNumber * 1000000);
        return Math.round(baseNumber * 1000000);
      }
      
      // Handle "14.5 K" format where K is separate  
      if (extractedText.includes(`${numberString} K`)) {
        const baseNumber = parseFloat(numberString);
        console.log('📊 Found K format:', numberString, '→', baseNumber * 1000);
        return Math.round(baseNumber * 1000);
      }
      
      // Handle "14.5 B" format where B is separate
      if (extractedText.includes(`${numberString} B`)) {
        const baseNumber = parseFloat(numberString);
        console.log('📊 Found B format:', numberString, '→', baseNumber * 1000000000);
        return Math.round(baseNumber * 1000000000);
      }
      
      // Handle standard "14.5M" format (no space)
      const cleanNumber = numberString.replace(/,/g, '');
      const multiplier = cleanNumber.includes('K') ? 1000 :
                        cleanNumber.includes('M') ? 1000000 :
                        cleanNumber.includes('B') ? 1000000000 : 1;
      
      const baseNumber = parseFloat(cleanNumber.replace(/[KMB]/i, ''));
      const result = Math.round(baseNumber * multiplier);
      console.log('📊 Standard format:', numberString, '→', result);
      return result;
    };

    const metrics = {
      followerCount: parseNumber(socialMediaPatterns.followers?.[1]),
      followingCount: parseNumber(socialMediaPatterns.following?.[1]),
      postCount: parseNumber(socialMediaPatterns.posts?.[1]),
      likesCount: parseNumber(socialMediaPatterns.likes?.[1]),
      commentsCount: parseNumber(socialMediaPatterns.comments?.[1]),
      isVerified: socialMediaPatterns.verified,
      isBusiness: socialMediaPatterns.businessAccount,
      platform: socialMediaPatterns.platform
    };

    console.log('📊 Extracted metrics:', metrics);

    return {
      extractedText: extractedText.substring(0, 1000), // Limit text for analysis
      detectedNumbers: numbers,
      socialMediaPatterns,
      metrics,
      labels: visionData.labelAnnotations?.slice(0, 10) || [],
      confidence: 'HIGH',
      analysisComplete: true
    };

  } catch (error) {
    console.error('❌ Vision API analysis failed:', error.message);
    return {
      extractedText: '',
      detectedNumbers: [],
      error: error.message,
      confidence: 'LOW',
      analysisComplete: false
    };
  }
}

// Google Vision API endpoint
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        error: 'Missing imageBase64 in request body' 
      });
    }

    // Validate API key exists
    if (!process.env.GOOGLE_VISION_API_KEY) {
      console.error('GOOGLE_VISION_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    // Prepare request for Google Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: 'WEB_DETECTION',
              maxResults: 20,
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 10,
            },
            {
              type: 'SAFE_SEARCH_DETECTION',
            },
          ],
        },
      ],
    };

    console.log('Making request to Google Vision API...');

    // Make API call to Google Vision
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('Google Vision API response received');

    // Check for API errors
    if (response.data.responses[0]?.error) {
      console.error('Google Vision API error:', response.data.responses[0].error);
      return res.status(400).json({ 
        error: 'Vision API error: ' + response.data.responses[0].error.message 
      });
    }

    // Return the processed response
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Vision API request failed:', error.message);
    
    // Handle specific error types
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
      
      // Return specific error information
      return res.status(error.response.status).json({
        error: `Google Vision API error (${error.response.status})`,
        details: error.response.data,
        timestamp: new Date().toISOString()
      });
    }

    // General server error
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DSTA LoveScan Backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Vision API: http://localhost:${PORT}/api/vision/analyze`);
  console.log(`💬 Chat Analysis: http://localhost:${PORT}/api/chat/analyze`);
  
  // Validate environment
  if (!process.env.GOOGLE_VISION_API_KEY) {
    console.warn('⚠️  WARNING: GOOGLE_VISION_API_KEY not found in environment');
  } else {
    console.log('✅ Google Vision API key loaded');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY not found in environment');
  } else {
    console.log('✅ OpenRouter API key loaded');
  }
});

module.exports = app; 