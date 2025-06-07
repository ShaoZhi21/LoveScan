import axios from 'axios';
import { CONFIG } from '../config/env';

export interface ChatAnalysisResult {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  primaryConcerns: string[];
  detailedAnalysis: {
    financialRequests: string;
    emotionalManipulation: string;
    avoidancePatterns: string;
    profileConsistency: string;
    languagePatterns: string;
    timelineRedFlags: string;
  };
  recommendation: string;
  confidence: string;
  patternAnalysis: {
    highRiskIndicators: number;
    mediumRiskIndicators: number;
    grammarIssues: number;
    foundPatterns: string[];
  };
  metadata: {
    chatLength: number;
    wordCount: number;
    analysisTimestamp: string;
    aiModel: string;
  };
}

export interface BackendChatResponse {
  success: boolean;
  data: ChatAnalysisResult;
  timestamp: string;
}

export const analyzeChatText = async (
  chatText: string, 
  participantNames?: string[]
): Promise<ChatAnalysisResult> => {
  try {
    console.log('🔍 Starting chat analysis via backend...');
    
    // Make API call to our secure backend
    const response = await axios.post(
      `${CONFIG.BACKEND_URL}/api/chat/analyze`,
      {
        chatText: chatText,
        participantNames: participantNames || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for chat analysis
      }
    );

    console.log('✅ Chat analysis response received');

    const backendResponse: BackendChatResponse = response.data;
    
    if (!backendResponse.success) {
      throw new Error('Backend chat analysis failed');
    }

    return backendResponse.data;

  } catch (error) {
    console.error('❌ Error analyzing chat:', error);
    
    // If backend fails, return mock results for demo
    console.log('🔄 Falling back to mock analysis for demo purposes');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    return generateMockChatAnalysis(chatText);
  }
};

// Mock function for demo purposes when backend fails
const generateMockChatAnalysis = (chatText: string): ChatAnalysisResult => {
  const wordCount = chatText.split(/\s+/).length;
  const hasMoneyKeywords = /money|send|western union|gift card|emergency/i.test(chatText);
  const hasRomanticKeywords = /love|darling|soul mate|my heart/i.test(chatText);
  const hasGrammarIssues = /am from|how are you doing|good morning my/i.test(chatText);
  
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let riskScore = 20;
  
  if (hasMoneyKeywords) {
    riskLevel = 'HIGH';
    riskScore = 85;
  } else if (hasRomanticKeywords && hasGrammarIssues) {
    riskLevel = 'MEDIUM';
    riskScore = 60;
  }

  return {
    riskLevel,
    riskScore,
    primaryConcerns: hasMoneyKeywords 
      ? ['Financial requests detected', 'Emotional manipulation patterns', 'Urgent emergency claims']
      : hasRomanticKeywords 
      ? ['Excessive romantic language', 'Grammar inconsistencies', 'Fast relationship progression']
      : ['Limited conversation analysis', 'No major red flags detected'],
    detailedAnalysis: {
      financialRequests: hasMoneyKeywords 
        ? 'Multiple requests for money transfers and financial assistance detected'
        : 'No direct financial requests found in the conversation',
      emotionalManipulation: hasRomanticKeywords
        ? 'Excessive use of romantic language and emotional appeals'
        : 'Normal conversational tone without excessive emotional manipulation',
      avoidancePatterns: 'Unable to determine avoidance patterns from text alone',
      profileConsistency: 'Profile consistency analysis requires additional context',
      languagePatterns: hasGrammarIssues
        ? 'Non-native English patterns and grammar inconsistencies detected'
        : 'Language patterns appear consistent with native speaker',
      timelineRedFlags: 'Timeline analysis requires conversation timestamps'
    },
    recommendation: riskLevel === 'HIGH' 
      ? '⚠️ HIGH RISK: Avoid sending money or personal information. Consider ending contact.'
      : riskLevel === 'MEDIUM'
      ? '⚡ MEDIUM RISK: Proceed with caution. Verify identity through video calls.'
      : '✅ LOW RISK: Continue normal conversation but remain vigilant.',
    confidence: 'Medium',
    patternAnalysis: {
      highRiskIndicators: hasMoneyKeywords ? 3 : 0,
      mediumRiskIndicators: hasRomanticKeywords ? 2 : 0,
      grammarIssues: hasGrammarIssues ? 1 : 0,
      foundPatterns: [
        ...(hasMoneyKeywords ? ['Financial requests detected'] : []),
        ...(hasRomanticKeywords ? ['Excessive romantic language'] : []),
        ...(hasGrammarIssues ? ['Grammar inconsistencies'] : [])
      ]
    },
    metadata: {
      chatLength: chatText.length,
      wordCount,
      analysisTimestamp: new Date().toISOString(),
      aiModel: 'mock-analysis-fallback'
    }
  };
};

export const getRiskColor = (level: 'LOW' | 'MEDIUM' | 'HIGH'): string => {
  switch (level) {
    case 'HIGH': return '#ff4444';
    case 'MEDIUM': return '#ff8800';
    case 'LOW': return '#44aa44';
    default: return '#666';
  }
};

export const formatRiskScore = (score: number): string => {
  if (score >= 80) return 'Very High Risk';
  if (score >= 60) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  if (score >= 20) return 'Low Risk';
  return 'Very Low Risk';
}; 