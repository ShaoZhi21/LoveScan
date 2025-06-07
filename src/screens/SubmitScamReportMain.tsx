import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { analyzeChatText } from '../lib/chatAnalysis';
import { searchSimilarImages, analyzeImageSafety } from '../lib/googleVision';
import { analyzeSocialMediaProfile } from '../lib/socialMediaAnalysis';
import { ReportService } from '../lib/reportService';
import { ReportSubmissionData, REPORT_REASONS, ReportReason } from '../types/report';

interface SubmitScamReportMainProps {
  navigation?: any;
  route?: {
    params?: {
      uploadedChat?: any;
      uploadedProfile?: any;
      uploadedSocialMedia?: any;
    };
  };
}

export function SubmitScamReportMain({ navigation, route }: SubmitScamReportMainProps) {
  const [uploadStatus, setUploadStatus] = useState({
    chat: false,
    profile: false,
    socialMedia: false,
  });

  const [uploadedData, setUploadedData] = useState({
    chat: null,
    profile: null,
    socialMedia: null,
  });

  // Report reason states
  const [customReason, setCustomReason] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<ReportReason[]>([]);

  // Handle data coming back from upload screens
  useEffect(() => {
    console.log('SubmitScamReportMain: Route params changed:', route?.params);
    console.log('Current upload status before processing:', uploadStatus);
    
    if (route?.params?.uploadedChat) {
      console.log('Processing uploaded chat data:', route.params.uploadedChat);
      setUploadStatus(prev => ({ ...prev, chat: true }));
      setUploadedData(prev => ({ ...prev, chat: route.params!.uploadedChat }));
    }
    if (route?.params?.uploadedProfile) {
      console.log('Processing uploaded profile data:', route.params.uploadedProfile);
      setUploadStatus(prev => ({ ...prev, profile: true }));
      setUploadedData(prev => ({ ...prev, profile: route.params!.uploadedProfile }));
    }
    if (route?.params?.uploadedSocialMedia) {
      console.log('Processing uploaded social media data:', route.params.uploadedSocialMedia);
      console.log('Social media URLs:', route.params.uploadedSocialMedia.urls);
      console.log('Instagram URL specifically:', route.params.uploadedSocialMedia.urls?.instagram);
      setUploadStatus(prev => ({ ...prev, socialMedia: true }));
      setUploadedData(prev => ({ ...prev, socialMedia: route.params!.uploadedSocialMedia }));
    }
  }, [route?.params]);

  // Debug effect to log upload status changes
  useEffect(() => {
    console.log('Upload status state changed to:', uploadStatus);
  }, [uploadStatus]);

  // Debug effect to log uploaded data changes  
  useEffect(() => {
    console.log('Uploaded data state changed to:', uploadedData);
  }, [uploadedData]);

  const handleChatScan = () => {
    navigation?.navigate('ChatScan', {
      existingData: uploadedData.chat,
      returnTo: 'SubmitScamReportMain'
    });
  };

  const handleProfileScan = () => {
    navigation?.navigate('ReverseImageSearch', {
      existingData: uploadedData.profile,
      returnTo: 'SubmitScamReportMain'
    });
  };

  const handleSocialMediaScan = () => {
    navigation?.navigate('SocialMediaScan', {
      existingData: uploadedData.socialMedia,
      returnTo: 'SubmitScamReportMain'
    });
  };

  const handleReasonToggle = (reason: ReportReason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleFullScan = async () => {
    // Check if at least one item is uploaded
    const hasAnyUploads = uploadStatus.chat || uploadStatus.profile || uploadStatus.socialMedia;
    
    if (!hasAnyUploads) {
      Alert.alert(
        'No Evidence Uploaded',
        'Please upload at least one piece of evidence (chat, profile image, or social media content) before submitting the report.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Check if at least one reason is provided
    const hasReason = customReason.trim() || selectedReasons.length > 0;
    
    if (!hasReason) {
      Alert.alert(
        'No Reason Provided',
        'Please provide a custom reason or select at least one predefined reason for reporting.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to success screen immediately (analysis happens in background)
    navigation?.navigate('ScamReportSuccess');

    // Perform analysis and report submission in background
    performAnalysisAndSubmitReport();
  };

  const performAnalysisAndSubmitReport = async () => {
    try {
      console.log('=== BACKGROUND ANALYSIS & REPORT SUBMISSION ===');
      console.log('Upload Status:', uploadStatus);
      console.log('Uploaded Data:', uploadedData);

      const analysisResults: any = {};

      // Analyze Chat if uploaded
      if (uploadStatus.chat && uploadedData.chat) {
        console.log('Analyzing chat content...');
        try {
          const chatData = uploadedData.chat as any;
          const chatText = chatData.messageText || 
                          (chatData.chatlogFile ? 'Chatlog file uploaded' : '') ||
                          (chatData.screenshotFile ? 'Screenshot uploaded' : '');
          
          if (chatText) {
            analysisResults.chatAnalysis = await analyzeChatText(chatText);
            console.log('Chat analysis completed');
          }
        } catch (error) {
          console.error('Chat analysis failed:', error);
        }
      }

      // Analyze Profile Image if uploaded
      if (uploadStatus.profile && uploadedData.profile) {
        console.log('Analyzing profile image...');
        try {
          const profileData = uploadedData.profile as any;
          if (profileData.imageUri) {
            const imageMatches = await searchSimilarImages(profileData.imageUri);
            const riskAnalysis = analyzeImageSafety(imageMatches);
            analysisResults.profileAnalysis = {
              matches: imageMatches,
              riskAnalysis: riskAnalysis
            };
            console.log('Profile analysis completed');
          }
        } catch (error) {
          console.error('Profile analysis failed:', error);
        }
      }

      // Analyze Social Media if uploaded
      if (uploadStatus.socialMedia && uploadedData.socialMedia) {
        console.log('Analyzing social media content...');
        try {
          const socialMediaData = uploadedData.socialMedia as any;
          const socialMediaUrls = socialMediaData.urls || {};
          
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
          
          if (profileUrl || (socialMediaData.screenshots && 
              (socialMediaData.screenshots.profileScreenshot || socialMediaData.screenshots.postScreenshot))) {
            const profileData = {
              urls: socialMediaUrls,
              platform: platform,
              primaryUrl: profileUrl,
              hasScreenshots: !!(socialMediaData.screenshots && 
                (socialMediaData.screenshots.profileScreenshot || socialMediaData.screenshots.postScreenshot))
            };
            
            const socialMediaResult = await analyzeSocialMediaProfile(
              profileUrl, 
              profileData, 
              platform,
              socialMediaData.screenshots
            );
            analysisResults.socialMediaAnalysis = socialMediaResult;
            console.log('Social media analysis completed');
          }
        } catch (error) {
          console.error('Social media analysis failed:', error);
        }
      }

      // Extract scan data and calculate overall risk
      const scanData = getScanData();
      
      // Prepare the report reason and description
      const primaryReason = customReason.trim() || selectedReasons[0] || 'Suspected Romance Scam';
      const allReasons = selectedReasons.length > 0 ? selectedReasons : undefined;
      
      let reportDescription = '';
      if (customReason.trim()) {
        reportDescription = customReason.trim();
      }
      if (selectedReasons.length > 0) {
        if (reportDescription) reportDescription += '\n\n';
        reportDescription += `Selected reasons: ${selectedReasons.join(', ')}`;
      }
      if (reportDescription) reportDescription += '\n\n';
      reportDescription += `Automated analysis included: ${Object.keys(analysisResults).join(', ')}.`;

      // Create report submission data
      const reportData: ReportSubmissionData = {
        reported_name: scanData.name,
        reported_image_url: scanData.imageUrl,
        reported_social_media: scanData.socialMedia,
        scan_type: scanData.scanType,
        scan_data: {
          chatAnalysis: analysisResults.chatAnalysis,
          profileAnalysis: analysisResults.profileAnalysis,
          socialMediaAnalysis: analysisResults.socialMediaAnalysis,
          uploadStatus,
          uploadedData
        },
        risk_score: scanData.riskScore,
        risk_level: scanData.riskLevel,
        report_reason: primaryReason,
        additional_reasons: allReasons,
        description: reportDescription,
        evidence_urls: []
      };

      // Submit report to Supabase
      console.log('Submitting report to database...');
      const result = await ReportService.submitReport(reportData);
      
      if (result.success) {
        console.log('Report submitted successfully to database');
      } else {
        console.error('Failed to submit report:', result.error);
      }

    } catch (error) {
      console.error('Background analysis and report submission failed:', error);
    }
  };

  const getScanData = () => {
    console.log('🔍 Creating comprehensive report from all available evidence...');
    
    // Helper function to extract names from chat text
    const extractNamesFromChat = (chatText: string): string | null => {
      const names: string[] = [];
      
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
        /(?:^|\n)\s*(\w+):\s/gm,
        /(?:^|\n)\s*(\w+)\s+\[.*?\]:/gm,
        /(\w+)\s+\[.*?\]:/g,
      ];
      
      namePatterns.forEach((pattern) => {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(chatText)) !== null) {
          const extractedName = match[1];
          if (extractedName && extractedName.length > 1 && 
              !['hi', 'hey', 'hello', 'good', 'how', 'what', 'when', 'where', 'why', 'ok', 'yes', 'no'].includes(extractedName.toLowerCase())) {
            names.push(extractedName);
          }
        }
      });
      
      return names.length > 0 ? names[0] : null;
    };

    // Extract data from different sources
    let extractedName = 'Unknown Profile';
    let imageUrl = '';
    let socialMedia = {};
    let scanTypes: string[] = [];

    // From chat analysis
    if (uploadStatus.chat && uploadedData.chat) {
      scanTypes.push('chat_analysis');
      const chatData = uploadedData.chat as any;
      const chatText = chatData.messageText || '';
      const nameFromChat = extractNamesFromChat(chatText);
      if (nameFromChat) {
        extractedName = nameFromChat;
      }
    }

    // From profile analysis
    if (uploadStatus.profile && uploadedData.profile) {
      scanTypes.push('reverse_image');
      const profileData = uploadedData.profile as any;
      if (profileData.imageUri) {
        imageUrl = profileData.imageUri;
      }
    }

    // From social media analysis
    if (uploadStatus.socialMedia && uploadedData.socialMedia) {
      scanTypes.push('social_media');
      const socialMediaData = uploadedData.socialMedia as any;
      if (socialMediaData.urls) {
        socialMedia = socialMediaData.urls;
      }
    }

    // Calculate risk score based on available data
    let riskScore = 30; // Base risk for submitting evidence
    if (scanTypes.includes('chat_analysis')) riskScore += 20;
    if (scanTypes.includes('reverse_image')) riskScore += 25;
    if (scanTypes.includes('social_media')) riskScore += 15;

    const getRiskLevel = (score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' => {
      if (score >= 70) return 'HIGH';
      if (score >= 40) return 'MEDIUM';
      return 'LOW';
    };

    return {
      name: extractedName,
      imageUrl,
      socialMedia,
      scanType: scanTypes.join('+') as ReportSubmissionData['scan_type'],
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      fullScanData: { uploadedData, uploadStatus, scanTypes }
    };
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const StatusIndicator = ({ isUploaded, label }: { isUploaded: boolean; label: string }) => (
    <View style={styles.statusRow}>
      <View style={[styles.statusIcon, { backgroundColor: isUploaded ? '#4CAF50' : '#E0E0E0' }]}>
        <Text style={[styles.statusCheckmark, { color: isUploaded ? '#fff' : '#999' }]}>
          ✓
        </Text>
      </View>
      <Text style={[
        styles.statusLabel, 
        { 
          color: isUploaded ? '#000' : '#999',
          fontWeight: isUploaded ? 'bold' : 'normal'
        }
      ]}>
        {label}
      </Text>
    </View>
  );

  const getUploadCount = () => {
    return Object.values(uploadStatus).filter(Boolean).length;
  };

  const getChatCardStyle = () => {
    return uploadStatus.chat 
      ? { ...styles.scannerCard, ...styles.scannerCardUploaded }
      : styles.scannerCard;
  };

  const getProfileCardStyle = () => {
    return uploadStatus.profile 
      ? { ...styles.scannerCard, ...styles.scannerCardUploaded }
      : styles.scannerCard;
  };

  const getSocialMediaCardStyle = () => {
    return uploadStatus.socialMedia 
      ? { ...styles.scannerCard, ...styles.scannerCardUploaded }
      : styles.scannerCard;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Love Scan</Text>
        <View style={styles.profileImage}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload to Report</Text>
            <Text style={styles.sectionSubtitle}>
              Upload evidence of the scam to submit a report and help protect others
            </Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity onPress={handleChatScan} style={styles.modernCard}>
                <View style={[styles.modernCardContent, uploadStatus.chat && styles.modernCardUploaded]}>
                  <View style={styles.modernIconContainer}>
                    <View style={[styles.modernIconCircle, uploadStatus.chat && styles.modernIconCircleUploaded]}>
                      <Text style={[styles.modernIconText, uploadStatus.chat && styles.modernIconTextUploaded]}>💬</Text>
                    </View>
                    {uploadStatus.chat && (
                      <View style={styles.modernUploadBadge}>
                        <Text style={styles.modernUploadBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modernCardLabel, uploadStatus.chat && styles.modernCardLabelUploaded]}>
                    Chat
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleProfileScan} style={styles.modernCard}>
                <View style={[styles.modernCardContent, uploadStatus.profile && styles.modernCardUploaded]}>
                  <View style={styles.modernIconContainer}>
                    <View style={[styles.modernIconCircle, uploadStatus.profile && styles.modernIconCircleUploaded]}>
                      <Text style={[styles.modernIconText, uploadStatus.profile && styles.modernIconTextUploaded]}>🖼️</Text>
                    </View>
                    {uploadStatus.profile && (
                      <View style={styles.modernUploadBadge}>
                        <Text style={styles.modernUploadBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modernCardLabel, uploadStatus.profile && styles.modernCardLabelUploaded]}>
                    Picture
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSocialMediaScan} style={styles.modernCard}>
                <View style={[styles.modernCardContent, uploadStatus.socialMedia && styles.modernCardUploaded]}>
                  <View style={styles.modernIconContainer}>
                    <View style={[styles.modernIconCircle, uploadStatus.socialMedia && styles.modernIconCircleUploaded]}>
                      <Text style={[styles.modernIconText, uploadStatus.socialMedia && styles.modernIconTextUploaded]}>📱</Text>
                    </View>
                    {uploadStatus.socialMedia && (
                      <View style={styles.modernUploadBadge}>
                        <Text style={styles.modernUploadBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modernCardLabel, uploadStatus.socialMedia && styles.modernCardLabelUploaded]}>
                    Social{'\n'}Media
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upload Status */}
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>Report Status ({getUploadCount()}/3)</Text>
            <StatusIndicator isUploaded={uploadStatus.chat} label="Chat Evidence Uploaded" />
            <StatusIndicator isUploaded={uploadStatus.profile} label="Picture Evidence Uploaded" />
            <StatusIndicator isUploaded={uploadStatus.socialMedia} label="Social Media Evidence Uploaded" />
            
          </View>

          {/* Report Reasons */}
          <View style={[
            styles.reasonsSection,
            getUploadCount() === 0 && styles.reasonsSectionDisabled
          ]}>
            <Text style={[
              styles.reasonsSectionTitle,
              getUploadCount() === 0 && styles.disabledText
            ]}>
              Report Reasons
            </Text>
            <Text style={[
              styles.reasonsSectionSubtitle,
              getUploadCount() === 0 && styles.disabledText
            ]}>
              Write a custom reason or select from predefined options
            </Text>
            
            {/* Custom Reason Input */}
            <View style={styles.customReasonContainer}>
              <Text style={[
                styles.customReasonLabel,
                getUploadCount() === 0 && styles.disabledText
              ]}>
                Custom Reason
              </Text>
              <TextInput
                style={[
                  styles.customReasonInput,
                  getUploadCount() === 0 && styles.customReasonInputDisabled
                ]}
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Describe why you're reporting this profile..."
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                editable={getUploadCount() > 0}
              />
            </View>

            {/* Reasons */}
            <View style={styles.predefinedReasonsContainer}>
              <Text style={[
                styles.predefinedReasonsLabel,
                getUploadCount() === 0 && styles.disabledText
              ]}>
                Reasons
              </Text>
              <View style={styles.reasonsGrid}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    onPress={() => getUploadCount() > 0 && handleReasonToggle(reason)}
                    disabled={getUploadCount() === 0}
                    style={[
                      styles.reasonChip,
                      selectedReasons.includes(reason) && styles.reasonChipSelected,
                      getUploadCount() === 0 && styles.reasonChipDisabled
                    ]}
                  >
                    <Text style={[
                      styles.reasonChipText,
                      selectedReasons.includes(reason) && styles.reasonChipTextSelected,
                      getUploadCount() === 0 && styles.disabledText
                    ]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity 
              style={[
                styles.submitButton,
                getUploadCount() > 0 ? styles.submitButtonActive : styles.submitButtonDisabled
              ]} 
              onPress={handleFullScan}
              activeOpacity={0.8}
            >
              <View style={styles.submitButtonContent}>
                <View style={[
                  styles.submitIconContainer,
                  getUploadCount() > 0 ? styles.submitIconContainerActive : styles.submitIconContainerDisabled
                ]}>
                  <Text style={[
                    styles.submitIcon,
                    getUploadCount() === 0 && styles.submitIconDisabled
                  ]}>
                    {getUploadCount() > 0 ? '🚨' : '📤'}
                  </Text>
                </View>
                <View style={styles.submitTextContainer}>
                  <Text style={[
                    styles.submitButtonTitle,
                    getUploadCount() === 0 && styles.submitButtonTitleDisabled
                  ]}>
                    {getUploadCount() > 0 ? 'Submit Scam Report' : 'Upload Evidence First'}
                  </Text>
                  <Text style={[
                    styles.submitButtonSubtitle,
                    getUploadCount() === 0 && styles.submitButtonSubtitleDisabled
                  ]}>
                    {getUploadCount() > 0 
                      ? `Ready to report with ${getUploadCount()} evidence item${getUploadCount() > 1 ? 's' : ''}`
                      : 'Add chat, picture, or social media evidence to continue'
                    }
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ffd8df',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: '#8b0000',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 40,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  uploadCard: {
    flex: 1,
  },
  scannerCard: {
    backgroundColor: '#ffd8df',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    height: 120,
  },
  scannerCardUploaded: {
    backgroundColor: '#f0f9ff',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  uploadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: 36,
    gap: 14,
  },
  statusSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCheckmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Submit Button Styles
  submitContainer: {
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  submitButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e5e5e5',
    shadowOpacity: 0.05,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  submitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitIconContainerActive: {
    backgroundColor: '#dc2626',
  },
  submitIconContainerDisabled: {
    backgroundColor: '#f3f4f6',
  },
  submitIcon: {
    fontSize: 24,
  },
  submitIconDisabled: {
    opacity: 0.5,
  },
  submitTextContainer: {
    flex: 1,
  },
  submitButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  submitButtonTitleDisabled: {
    color: '#9ca3af',
  },
  submitButtonSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  submitButtonSubtitleDisabled: {
    color: '#d1d5db',
  },
  bottomNav: {
    height: 72,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 64,
  },
  navItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  // Modern Card Styles
  modernCard: {
    flex: 1,
    marginHorizontal: 2,
  },
  modernCardContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#dc2626',
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modernCardUploaded: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
    borderWidth: 2.5,
    shadowColor: '#dc2626',
    shadowOpacity: 0.25,
  },
  modernIconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernIconCircleUploaded: {
    backgroundColor: '#fecaca',
  },
  modernIconText: {
    fontSize: 28,
  },
  modernIconTextUploaded: {
    fontSize: 28,
  },
  modernUploadBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modernUploadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modernCardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
  modernCardLabelUploaded: {
    color: '#991b1b',
  },
  modernCardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  modernCardSubtitleUploaded: {
    color: '#dc2626',
  },
  // Report Reasons Styles
  reasonsSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reasonsSectionDisabled: {
    opacity: 0.5,
  },
  reasonsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reasonsSectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  customReasonContainer: {
    marginBottom: 12,
  },
  customReasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  customReasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  customReasonInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  predefinedReasonsContainer: {
    marginBottom: 4,
  },
  predefinedReasonsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  reasonChipSelected: {
    backgroundColor: '#8b0000',
    borderColor: '#8b0000',
  },
  reasonChipDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  reasonChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  reasonChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
}); 