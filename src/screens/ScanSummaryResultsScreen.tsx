import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ReportModal } from '../components/ReportModal';
import { ReportService } from '../lib/reportService';
import { ReportSubmissionData } from '../types/report';

interface ScanSummaryResultsProps {
  navigation?: any;
  route?: {
    params?: {
      analysisResults: {
        chatAnalysis?: any;
        profileAnalysis?: any;
        socialMediaAnalysis?: any;
      };
      uploadStatus: {
        chat: boolean;
        profile: boolean;
        socialMedia: boolean;
      };
      uploadedData: any;
      isViewingPreviousReport?: boolean;
      previousReportData?: {
        reportId: string;
        reportedName: string;
        reportReason: string;
        submittedAt: string;
        status: string;
      };
      sourceScreen?: string;
    };
  };
}

export function ScanSummaryResultsScreen({ navigation, route }: ScanSummaryResultsProps) {
  const { 
    analysisResults = {}, 
    uploadStatus = { chat: false, profile: false, socialMedia: false }, 
    uploadedData = {},
    isViewingPreviousReport = false,
    previousReportData = null,
    sourceScreen = null
  } = route?.params || {};

  const [showReportModal, setShowReportModal] = useState(false);

  const calculateOverallRisk = () => {
    let totalRisk = 0;
    let count = 0;

    if (analysisResults?.chatAnalysis?.riskScore) {
      totalRisk += analysisResults.chatAnalysis.riskScore;
      count++;
    }
    if (analysisResults?.profileAnalysis?.riskAnalysis?.riskScore) {
      totalRisk += analysisResults.profileAnalysis.riskAnalysis.riskScore;
      count++;
    }
    if (analysisResults?.socialMediaAnalysis?.riskScore) {
      totalRisk += analysisResults.socialMediaAnalysis.riskScore;
      count++;
    }

    return count > 0 ? Math.round(totalRisk / count) : 0;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#FF4444';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return '#666';
    }
  };

  const overallRisk = calculateOverallRisk();
  const riskLevel = getRiskLevel(overallRisk);
  const riskColor = getRiskColor(riskLevel);

  const handleViewDetails = (type: string) => {
    switch (type) {
      case 'chat':
        navigation?.navigate('ChatAnalysisResults', { 
          analysisResult: analysisResults?.chatAnalysis,
          originalText: uploadedData?.chat?.messageText || uploadedData?.chat?.extractedText || 'Chat content analyzed',
          hasScreenshot: !!uploadedData?.chat?.screenshotFile,
          hasChatlog: !!uploadedData?.chat?.chatlogFile
        });
        break;
      case 'profile':
        navigation?.navigate('ReverseImageSearch', { 
          imageUri: uploadedData?.profile?.imageUri,
          preloadedResults: analysisResults?.profileAnalysis 
        });
        break;
      case 'socialMedia':
        // Extract the primary URL from social media data for navigation
        const socialMediaUrls = uploadedData?.socialMedia?.urls || {};
        let primaryUrl = '';
        
        // Find the first non-empty URL (prioritize Instagram)
        if (socialMediaUrls.instagram?.trim()) {
          primaryUrl = socialMediaUrls.instagram.trim();
        } else if (socialMediaUrls.facebook?.trim()) {
          primaryUrl = socialMediaUrls.facebook.trim();
        } else if (socialMediaUrls.linkedin?.trim()) {
          primaryUrl = socialMediaUrls.linkedin.trim();
        } else if (socialMediaUrls.twitter?.trim()) {
          primaryUrl = socialMediaUrls.twitter.trim();
        } else if (socialMediaUrls.other?.trim()) {
          primaryUrl = socialMediaUrls.other.trim();
        }
        
        navigation?.navigate('SocialMediaAnalysisResults', {
          analysisResult: analysisResults?.socialMediaAnalysis,
          profileUrl: primaryUrl
        });
        break;
    }
  };

  const handleDone = () => {
    // Navigate back to source screen if specified, otherwise go to HomeScreen
    if (sourceScreen === 'PreviousReports') {
      navigation?.navigate('PreviousReports');
    } else {
      navigation?.navigate('HomeScreen');
    }
  };

  const handleReport = async () => {
    // Quick connection test before opening modal
    console.log('Testing Supabase connection...');
    try {
      const testResult = await ReportService.testConnection();
      if (!testResult.success) {
        console.warn('Supabase connection test failed:', testResult.error);
      } else {
        console.log('Supabase connection test successful');
      }
    } catch (error) {
      console.warn('Connection test error:', error);
    }
    
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reportData: ReportSubmissionData) => {
    try {
      const result = await ReportService.submitReport(reportData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit report');
      }
      // Report was submitted successfully, modal will close automatically
    } catch (error) {
      // Error handling is done in the modal
      throw error;
    }
  };

  const getScanData = () => {
    console.log('🔍 Creating comprehensive report from all available scans...');
    console.log('📊 Upload status:', uploadStatus);
    console.log('📈 Analysis results available:', Object.keys(analysisResults || {}));

    // Helper function to extract names from chat text
    const extractNamesFromChat = (chatText: string): string | null => {
      console.log('🔍 Extracting names from chat text:', chatText.substring(0, 200) + '...');
      const names: string[] = [];
      
      // Enhanced name patterns to catch more variations
      const namePatterns = [
        /my name is (\w+)/gi,
        /my name's (\w+)/gi,
        /i'm (\w+)/gi,
        /i am (\w+)/gi,
        /call me (\w+)/gi,
        /this is (\w+)/gi,
        /hi,?\s*i'm (\w+)/gi,
        /hello,?\s*i'm (\w+)/gi,
        /hey,?\s*i'm (\w+)/gi,
        /hi,?\s*my name is (\w+)/gi,
        /hello,?\s*my name is (\w+)/gi,
        /(?:^|\n)\s*(\w+):\s/gm, // Format like "Olivia: message"
        /(?:^|\n)\s*(\w+)\s+\[.*?\]:/gm, // Format like "Olivia [Apr 15, 2025, 10:12 AM]:"
        /(\w+)\s+\[.*?\]:/g, // Alternative for "Olivia [timestamp]:"
        /(?:^|\n)\s*hi,?\s+(\w+)\s+here/gi, // "Hi Olivia here"
        /(?:^|\n)\s*(\w+)\s+here/gi, // "Olivia here"
      ];
      
      namePatterns.forEach((pattern, index) => {
        // Reset regex lastIndex for global patterns
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(chatText)) !== null) {
          const extractedName = match[1];
          if (extractedName && extractedName.length > 1 && 
              !['hi', 'hey', 'hello', 'good', 'how', 'what', 'when', 'where', 'why', 'ok', 'yes', 'no'].includes(extractedName.toLowerCase())) {
            console.log(`✅ Found name "${extractedName}" using pattern ${index + 1}`);
            names.push(extractedName);
          }
        }
      });
      
      // Also try to find capitalized words that might be names (fallback)
      if (names.length === 0) {
        const capitalizedWords = chatText.match(/\b[A-Z][a-z]{2,}\b/g);
        if (capitalizedWords) {
          const potentialNames = capitalizedWords.filter(word => 
            word.length > 2 && 
            !['The', 'This', 'That', 'Hello', 'Good', 'Morning', 'Evening', 'Night', 'Today', 'Tomorrow', 'Yesterday'].includes(word)
          );
          if (potentialNames.length > 0) {
            console.log(`📝 Found potential name from capitalized words: "${potentialNames[0]}"`);
            names.push(potentialNames[0]);
          }
        }
      }
      
      const result = names.length > 0 ? names[0] : null;
      console.log('🎯 Final extracted name:', result);
      return result;
    };

    // Collect data from ALL available scans
    const performedScans: string[] = [];
    const allScanData: any = {};
    const allNames: string[] = [];
    const allImageUrls: string[] = [];
    const allSocialMedia: any = {};

    // 1. CHAT ANALYSIS DATA
    if (uploadStatus.chat && analysisResults?.chatAnalysis) {
      console.log('💬 Processing chat analysis data...');
      performedScans.push('chat_analysis');
      allScanData.chatAnalysis = analysisResults.chatAnalysis;
      
      // Extract name from chat
      const chatText = uploadedData?.chat?.messageText || 
                      uploadedData?.chat?.extractedText || 
                      uploadedData?.chat?.chatlogFile || '';
      
      const chatName = extractNamesFromChat(chatText);
      if (chatName) {
        allNames.push(chatName);
        console.log(`📝 Chat name: ${chatName}`);
      }
      
      // Extract social media handles from chat
      const socialHandlePatterns = [
        /instagram[:\s]*@?(\w+)/gi,
        /ig[:\s]*@?(\w+)/gi,
        /facebook[:\s]*(\w+)/gi,
        /whatsapp[:\s]*(\+?\d+)/gi,
        /@(\w+)/g
      ];
      
      socialHandlePatterns.forEach(pattern => {
        const matches = chatText.match(pattern);
        if (matches) {
          matches.forEach((match: string) => {
            const handleMatch = pattern.exec(match);
            if (handleMatch && handleMatch[1]) {
              if (match.toLowerCase().includes('instagram') || match.toLowerCase().includes('ig')) {
                allSocialMedia.instagram = handleMatch[1];
              } else if (match.toLowerCase().includes('facebook')) {
                allSocialMedia.facebook = handleMatch[1];
              } else if (match.toLowerCase().includes('whatsapp')) {
                allSocialMedia.whatsapp = handleMatch[1];
              }
            }
          });
        }
      });
      
      allScanData.chatAnalysis.extractedData = {
        chatExcerpt: chatText.substring(0, 300) + '...',
        extractedName: chatName,
        socialHandles: allSocialMedia,
        inputMethod: uploadedData?.chat?.screenshotFile ? 'screenshot' : 
                     uploadedData?.chat?.chatlogFile ? 'file_upload' : 'manual_text'
      };
    }

    // 2. SOCIAL MEDIA ANALYSIS DATA  
    if (uploadStatus.socialMedia && analysisResults?.socialMediaAnalysis) {
      console.log('📱 Processing social media analysis data...');
      performedScans.push('social_media');
      allScanData.socialMediaAnalysis = analysisResults.socialMediaAnalysis;
      
      const socialName = analysisResults.socialMediaAnalysis.analysis?.profileInfo?.username || 
                         analysisResults.socialMediaAnalysis.profileUrl?.split('/').pop();
      if (socialName) {
        allNames.push(socialName);
        console.log(`📱 Social media name: ${socialName}`);
      }
      
      const profilePic = analysisResults.socialMediaAnalysis.analysis?.profileInfo?.profilePicture;
      if (profilePic) {
        allImageUrls.push(profilePic);
      }
      
      // Merge social media info
      Object.assign(allSocialMedia, {
        [analysisResults.socialMediaAnalysis.metadata?.platform || 'instagram']: 
          analysisResults.socialMediaAnalysis.profileUrl,
        ...analysisResults.socialMediaAnalysis.analysis?.profileInfo
      });
    }

    // 3. PROFILE/IMAGE ANALYSIS DATA
    if (uploadStatus.profile && analysisResults?.profileAnalysis) {
      console.log('🖼️ Processing profile image analysis data...');
      performedScans.push('reverse_image');
      allScanData.profileAnalysis = analysisResults.profileAnalysis;
      
      const imageName = analysisResults.profileAnalysis.matches?.[0]?.title || 
                        analysisResults.profileAnalysis.matches?.[0]?.description;
      if (imageName) {
        allNames.push(imageName);
        console.log(`🖼️ Image search name: ${imageName}`);
      }
      
      const imageUri = uploadedData?.profile?.imageUri;
      if (imageUri) {
        allImageUrls.push(imageUri);
      }
    }

    // Determine primary name (prioritize social media > chat > image search)
    const primaryName = allNames.find(name => name && !name.includes('Profile from')) || 
                       allNames[0] || 
                       `Multi-scan contact (${new Date().toLocaleDateString()})`;

    console.log('🎯 All extracted names:', allNames);
    console.log('🎯 Primary name selected:', primaryName);
    console.log('🎯 Performed scans:', performedScans);

    return {
      name: primaryName,
      imageUrl: allImageUrls[0] || '',
      socialMedia: allSocialMedia,
      scanType: performedScans.join('+') as ReportSubmissionData['scan_type'], // e.g., "chat_analysis+social_media+reverse_image"
      riskScore: overallRisk,
      riskLevel: riskLevel as ReportSubmissionData['risk_level'],
      fullScanData: {
        performedScans,
        scanResults: allScanData,
        overallRisk,
        combinedAnalysis: {
          allExtractedNames: allNames,
          allImageUrls,
          allSocialMediaHandles: allSocialMedia,
          primaryIdentifier: primaryName,
          scanCombination: performedScans.join(' + '),
          totalRiskFactors: performedScans.length
        },
        originalResults: analysisResults,
        uploadedData,
        reportTimestamp: new Date().toISOString()
      }
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Results</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Overall Risk Assessment */}
          <Card style={styles.overallCard}>
            <CardContent style={styles.overallCardContent}>
              <View style={styles.riskContainer}>
                <View style={[styles.riskIndicator, { backgroundColor: riskColor }]}>
                  <Text style={styles.riskScore}>{overallRisk}</Text>
                </View>
                <View style={styles.riskDetails}>
                  <Text style={styles.riskLevelText}>
                    Risk Level: <Text style={[styles.riskLevel, { color: riskColor }]}>{riskLevel}</Text>
                  </Text>
                  <Text style={styles.riskDescription}>
                    {riskLevel === 'HIGH' && 'High risk indicators detected. Exercise extreme caution.'}
                    {riskLevel === 'MEDIUM' && 'Some risk indicators found. Be cautious and verify information.'}
                    {riskLevel === 'LOW' && 'Low risk detected. Profile appears legitimate.'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Individual Analysis Results */}
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Individual Analysis</Text>

            {/* Chat Analysis */}
            {uploadStatus.chat && (
              <Card style={styles.resultCard}>
                <CardContent style={styles.resultCardContent}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultIcon}>💬</Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>Chat Analysis</Text>
                      <Text style={styles.resultSubtitle}>
                        {analysisResults?.chatAnalysis?.riskLevel && (
                          <Text style={{ color: getRiskColor(analysisResults.chatAnalysis.riskLevel) }}>
                            {analysisResults.chatAnalysis.riskLevel} RISK
                          </Text>
                        )} • Score: {analysisResults?.chatAnalysis?.riskScore || 'N/A'}/100
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewDetails('chat')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Profile Analysis */}
            {uploadStatus.profile && (
              <Card style={styles.resultCard}>
                <CardContent style={styles.resultCardContent}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultIcon}>🖼️</Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>Profile Image Analysis</Text>
                      <Text style={styles.resultSubtitle}>
                        {analysisResults?.profileAnalysis?.matches?.length || 0} matches found
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewDetails('profile')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Social Media Analysis */}
            {uploadStatus.socialMedia && (
              <Card style={styles.resultCard}>
                <CardContent style={styles.resultCardContent}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultIcon}>📱</Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>Social Media Analysis</Text>
                      <Text style={styles.resultSubtitle}>
                        {analysisResults?.socialMediaAnalysis?.riskLevel && (
                          <Text style={{ color: getRiskColor(analysisResults.socialMediaAnalysis.riskLevel) }}>
                            {analysisResults.socialMediaAnalysis.riskLevel} RISK
                          </Text>
                        )} • Score: {analysisResults?.socialMediaAnalysis?.riskScore || 'N/A'}/100
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewDetails('socialMedia')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            )}
          </View>

          {/* Recommendations */}
          <Card style={styles.recommendationsCard}>
            <CardContent style={styles.recommendationsContent}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              <View style={styles.recommendationsList}>
                {riskLevel === 'HIGH' && (
                  <>
                    <Text style={styles.recommendation}>⚠️ Do not send money or personal information</Text>
                    <Text style={styles.recommendation}>⚠️ Verify identity through video call</Text>
                    <Text style={styles.recommendation}>⚠️ Research the person independently</Text>
                  </>
                )}
                {riskLevel === 'MEDIUM' && (
                  <>
                    <Text style={styles.recommendation}>🔍 Verify information provided</Text>
                    <Text style={styles.recommendation}>🔍 Ask for additional verification</Text>
                    <Text style={styles.recommendation}>🔍 Be cautious with personal information</Text>
                  </>
                )}
                {riskLevel === 'LOW' && (
                  <>
                    <Text style={styles.recommendation}>✅ Profile appears legitimate</Text>
                    <Text style={styles.recommendation}>✅ Continue with normal caution</Text>
                    <Text style={styles.recommendation}>✅ Trust your instincts</Text>
                  </>
                )}
              </View>
            </CardContent>
          </Card>

          {/* Previous Report Info - Only show when viewing previous report */}
          {isViewingPreviousReport && (
            <View style={styles.previousReportContainer}>
              <Text style={styles.previousReportTitle}>📋 Report Already Submitted</Text>
              <Text style={styles.previousReportDetails}>
                Reported: {previousReportData?.reportedName || 'Unknown'}
              </Text>
              <Text style={styles.previousReportDetails}>
                Reason: {previousReportData?.reportReason || 'Not specified'}
              </Text>
              <Text style={styles.previousReportDetails}>
                Status: {previousReportData?.status || 'Submitted'}
              </Text>
              <Text style={styles.previousReportDate}>
                Submitted: {previousReportData?.submittedAt ? new Date(previousReportData.submittedAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {!isViewingPreviousReport && (
            <Button
              title="🚨 Report This Profile"
              onPress={() => handleReport()}
              style={styles.reportButton}
            />
          )}
          <Button
            title="Back"
            onPress={handleDone}
            style={styles.doneButton}
          />
        </View>
      </View>

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        scanData={getScanData()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8b0000',
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  overallCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallCardContent: {
    padding: 20,
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  riskIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskDetails: {
    flex: 1,
  },
  riskLevelText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskLevel: {
    fontWeight: 'bold',
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultCardContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIcon: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#8b0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationsCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  recommendationsContent: {
    padding: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  recommendationsList: {
    gap: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 12,
    paddingBottom: 24,
    paddingTop: 12,
    width: '100%',
  },
  reportButton: {
    backgroundColor: '#8b0000',
    minHeight: 48,
    width: '100%',
  },
  doneButton: {
    backgroundColor: '#8b0000',
    minHeight: 48,
    width: '100%',
  },
  previousReportContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 12,
  },
  previousReportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  previousReportDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  previousReportDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 