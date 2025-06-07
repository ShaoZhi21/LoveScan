import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { analyzeChatText } from '../lib/chatAnalysis';
import { searchSimilarImages, analyzeImageSafety } from '../lib/googleVision';
import { analyzeSocialMediaProfile } from '../lib/socialMediaAnalysis';

interface ScanningProgressScreenProps {
  navigation?: any;
  route?: {
    params?: {
      uploadedData: {
        chat: any;
        profile: any;
        socialMedia: any;
      };
      uploadStatus: {
        chat: boolean;
        profile: boolean;
        socialMedia: boolean;
      };
    };
  };
}

interface AnalysisResults {
  chatAnalysis?: any;
  profileAnalysis?: any;
  socialMediaAnalysis?: any;
}

export function ScanningProgressScreen({ navigation, route }: ScanningProgressScreenProps) {
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({});

  const { uploadedData, uploadStatus } = route?.params || { uploadedData: {}, uploadStatus: {} };

  useEffect(() => {
    performAnalysis();
  }, []);

  const performAnalysis = async () => {
    try {
      const results: AnalysisResults = {};
      let stepCount = 0;
      const totalSteps = Object.values(uploadStatus).filter(Boolean).length;

      // Analyze Chat if uploaded
      if (uploadStatus.chat && uploadedData.chat) {
        setCurrentStep('Analyzing chat content...');
        setProgress((stepCount / totalSteps) * 100);
        
        try {
          const chatText = uploadedData.chat.messageText || 
                          (uploadedData.chat.chatlogFile ? 'Chatlog file uploaded' : '') ||
                          (uploadedData.chat.screenshotFile ? 'Screenshot uploaded' : '');
          
          if (chatText) {
            results.chatAnalysis = await analyzeChatText(chatText);
          }
        } catch (error) {
          console.error('Chat analysis failed:', error);
        }
        
        stepCount++;
        setProgress((stepCount / totalSteps) * 100);
      }

      // Analyze Profile Image if uploaded
      if (uploadStatus.profile && uploadedData.profile) {
        setCurrentStep('Analyzing profile image...');
        setProgress((stepCount / totalSteps) * 100);
        
        try {
          if (uploadedData.profile.imageUri) {
            const imageMatches = await searchSimilarImages(uploadedData.profile.imageUri);
            const riskAnalysis = analyzeImageSafety(imageMatches);
            results.profileAnalysis = {
              matches: imageMatches,
              riskAnalysis: riskAnalysis
            };
          }
        } catch (error) {
          console.error('Profile analysis failed:', error);
        }
        
        stepCount++;
        setProgress((stepCount / totalSteps) * 100);
      }

      // Analyze Social Media if uploaded
      if (uploadStatus.socialMedia && uploadedData.socialMedia) {
        setCurrentStep('Analyzing social media content...');
        setProgress((stepCount / totalSteps) * 100);
        
        try {
          // Extract URLs from the social media data structure
          const socialMediaUrls = uploadedData.socialMedia.urls || {};
          
          // Find the first non-empty URL and determine the platform
          let profileUrl = '';
          let platform = 'Unknown';
          
          if (socialMediaUrls.instagram && socialMediaUrls.instagram.trim()) {
            profileUrl = socialMediaUrls.instagram.trim();
            platform = 'Instagram';
          } else if (socialMediaUrls.facebook && socialMediaUrls.facebook.trim()) {
            profileUrl = socialMediaUrls.facebook.trim();
            platform = 'Facebook';
          } else if (socialMediaUrls.linkedin && socialMediaUrls.linkedin.trim()) {
            profileUrl = socialMediaUrls.linkedin.trim();
            platform = 'LinkedIn';
          } else if (socialMediaUrls.twitter && socialMediaUrls.twitter.trim()) {
            profileUrl = socialMediaUrls.twitter.trim();
            platform = 'Twitter';
          } else if (socialMediaUrls.other && socialMediaUrls.other.trim()) {
            profileUrl = socialMediaUrls.other.trim();
            platform = 'Other';
          }
          
          console.log('Social media analysis - Profile URL:', profileUrl, 'Platform:', platform);
          
          if (profileUrl || (uploadedData.socialMedia.screenshots && 
              (uploadedData.socialMedia.screenshots.profileScreenshot || uploadedData.socialMedia.screenshots.postScreenshot))) {
            const profileData = {
              urls: socialMediaUrls,
              platform: platform,
              primaryUrl: profileUrl,
              hasScreenshots: !!(uploadedData.socialMedia.screenshots && 
                (uploadedData.socialMedia.screenshots.profileScreenshot || uploadedData.socialMedia.screenshots.postScreenshot))
            };
            
            const socialMediaResult = await analyzeSocialMediaProfile(
              profileUrl, 
              profileData, 
              platform,
              uploadedData.socialMedia.screenshots
            );
            results.socialMediaAnalysis = socialMediaResult;
          } else {
            // Fallback if no URL provided
            results.socialMediaAnalysis = {
              riskLevel: 'MEDIUM',
              riskScore: 50,
              primaryConcerns: ['No valid social media URLs provided'],
              recommendation: 'Unable to analyze without profile URL. Please verify identity through other means.',
              confidence: 'LOW'
            };
          }
        } catch (error) {
          console.error('Social media analysis failed:', error);
          // Fallback analysis
          results.socialMediaAnalysis = {
            riskLevel: 'MEDIUM',
            riskScore: 50,
            primaryConcerns: ['Analysis error occurred', 'Manual verification recommended'],
            recommendation: 'Technical error during analysis. Verify profile manually and use caution.',
            confidence: 'LOW'
          };
        }
        
        stepCount++;
        setProgress((stepCount / totalSteps) * 100);
      }

      // Final step
      setCurrentStep('Generating comprehensive report...');
      setProgress(100);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to summary results
      navigation?.navigate('ScanSummaryResults', {
        analysisResults: results,
        uploadStatus,
        uploadedData
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error - could navigate to error screen or back
      navigation?.goBack();
    }
  };

  const getAnalysisSteps = () => {
    const steps = [];
    if (uploadStatus.chat) steps.push('Chat Content');
    if (uploadStatus.profile) steps.push('Profile Image');
    if (uploadStatus.socialMedia) steps.push('Social Media');
    return steps;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/LoveScanLogoName.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>AI Analysis in Progress</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <Text style={styles.currentStep}>{currentStep}</Text>

        <View style={styles.analysisInfo}>
          <Text style={styles.analysisTitle}>Analyzing Content:</Text>
          {getAnalysisSteps().map((step, index) => (
            <View key={index} style={styles.analysisStep}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b0000" />
          <Text style={styles.loadingText}>Powered by AI Analysis</Text>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your data is processed securely and not stored permanently
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8b0000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 160,
    height: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentStep: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  analysisInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBullet: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  stepText: {
    color: '#fff',
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  securityNote: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  securityText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 