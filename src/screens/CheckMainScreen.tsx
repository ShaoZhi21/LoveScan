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
} from 'react-native';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface CheckMainScreenProps {
  navigation?: any;
  route?: {
    params?: {
      uploadedChat?: any;
      uploadedProfile?: any;
      uploadedSocialMedia?: any;
    };
  };
}

export function CheckMainScreen({ navigation, route }: CheckMainScreenProps) {
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

  // Handle data coming back from upload screens
  useEffect(() => {
    console.log('CheckMainScreen: Route params changed:', route?.params);
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
      returnTo: 'CheckMain'
    });
  };

  const handleProfileScan = () => {
    navigation?.navigate('ProfileScan', {
      existingData: uploadedData.profile,
      returnTo: 'CheckMain'
    });
  };

  const handleSocialMediaScan = () => {
    navigation?.navigate('SocialMediaScan', {
      existingData: uploadedData.socialMedia,
      returnTo: 'CheckMain'
    });
  };

  const handleFullScan = () => {
    // Check if at least one item is uploaded
    const hasAnyUploads = uploadStatus.chat || uploadStatus.profile || uploadStatus.socialMedia;
    
    if (!hasAnyUploads) {
      Alert.alert(
        'No Content Uploaded',
        'Please upload at least one item (chat, profile image, or social media content) before starting the scan.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Debug logging for social media data
    console.log('=== FULL SCAN DEBUG ===');
    console.log('Upload Status:', uploadStatus);
    console.log('Uploaded Data:', uploadedData);
    console.log('Social Media Data:', uploadedData.socialMedia);
    if (uploadedData.socialMedia && typeof uploadedData.socialMedia === 'object') {
      console.log('Social Media URLs:', (uploadedData.socialMedia as any).urls);
      console.log('Instagram URL:', (uploadedData.socialMedia as any).urls?.instagram);
    }
    console.log('======================');

    // Navigate to loading screen with all uploaded data
    navigation?.navigate('ScanningProgress', {
      uploadedData,
      uploadStatus
    });
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
            <Text style={styles.sectionTitle}>Upload</Text>
            <Text style={styles.sectionSubtitle}>
              Upload your content to analyze for romance scam indicators
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
            <Text style={styles.statusSectionTitle}>Upload Status ({getUploadCount()}/3)</Text>
            <StatusIndicator isUploaded={uploadStatus.chat} label="Chat Content Uploaded" />
            <StatusIndicator isUploaded={uploadStatus.profile} label="Picture Image Uploaded" />
            <StatusIndicator isUploaded={uploadStatus.socialMedia} label="Social Media Uploaded" />
            
          </View>

          {/* Scan Button */}
          <View style={styles.scanContainer}>
            <TouchableOpacity 
              style={[
                styles.scanButton,
                getUploadCount() > 0 ? styles.scanButtonActive : styles.scanButtonDisabled
              ]} 
              onPress={handleFullScan}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonContent}>
                <View style={[
                  styles.scanIconContainer,
                  getUploadCount() > 0 ? styles.scanIconContainerActive : styles.scanIconContainerDisabled
                ]}>
                  <Text style={[
                    styles.scanIcon,
                    getUploadCount() === 0 && styles.scanIconDisabled
                  ]}>
                    {getUploadCount() > 0 ? '🔍' : '📤'}
                  </Text>
                </View>
                <View style={styles.scanTextContainer}>
                  <Text style={[
                    styles.scanButtonTitle,
                    getUploadCount() === 0 && styles.scanButtonTitleDisabled
                  ]}>
                    {getUploadCount() > 0 ? 'Begin Analysis' : 'Upload Content First'}
                  </Text>
                  <Text style={[
                    styles.scanButtonSubtitle,
                    getUploadCount() === 0 && styles.scanButtonSubtitleDisabled
                  ]}>
                    {getUploadCount() > 0 
                      ? `Analyze ${getUploadCount()} uploaded item${getUploadCount() > 1 ? 's' : ''} for scam indicators`
                      : 'Add chat, picture, or social media content to scan'
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
  // Scan Button Styles
  scanContainer: {
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  scanButton: {
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
  scanButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e5e5e5',
    shadowOpacity: 0.05,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scanIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIconContainerActive: {
    backgroundColor: '#dc2626',
  },
  scanIconContainerDisabled: {
    backgroundColor: '#f3f4f6',
  },
  scanIcon: {
    fontSize: 24,
  },
  scanIconDisabled: {
    opacity: 0.5,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  scanButtonTitleDisabled: {
    color: '#9ca3af',
  },
  scanButtonSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  scanButtonSubtitleDisabled: {
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
}); 