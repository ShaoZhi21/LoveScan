import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Button } from '../components/ui/Button';
import * as ImagePicker from 'expo-image-picker';

interface SocialMediaScanScreenProps {
  navigation?: any;
  route?: {
    params?: {
      existingData?: any;
      returnTo?: string;
    };
  };
}

export function SocialMediaScanScreen({ navigation, route }: SocialMediaScanScreenProps) {
  const existingData = route?.params?.existingData;
  
  const [socialMediaUrls, setSocialMediaUrls] = useState({
    facebook: existingData?.urls?.facebook || '',
    instagram: existingData?.urls?.instagram || '',
    linkedin: existingData?.urls?.linkedin || '',
    twitter: existingData?.urls?.twitter || '',
    other: existingData?.urls?.other || '',
  });
  const [screenshots, setScreenshots] = useState({
    profileScreenshot: existingData?.screenshots?.profileScreenshot || null,
    postScreenshot: existingData?.screenshots?.postScreenshot || null,
  });
  const [isUploaded, setIsUploaded] = useState(existingData?.isUploaded || false);

  const handleClearAll = () => {
    setSocialMediaUrls({
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      other: '',
    });
    setScreenshots({
      profileScreenshot: null,
      postScreenshot: null,
    });
    setIsUploaded(false);
  };

  const handleUrlChange = (platform: string, url: string) => {
    setSocialMediaUrls(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  const handleImagePicker = async (type: 'profile' | 'post') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [9, 16] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'profile') {
        setScreenshots(prev => ({ ...prev, profileScreenshot: result.assets[0].uri }));
      } else {
        setScreenshots(prev => ({ ...prev, postScreenshot: result.assets[0].uri }));
      }
    }
  };

  const handleDone = () => {
    const hasAnyUrl = Object.values(socialMediaUrls).some(url => url.trim() !== '');
    const hasAnyScreenshot = Object.values(screenshots).some(screenshot => screenshot !== null);
    
    if (!hasAnyUrl && !hasAnyScreenshot) {
      Alert.alert('Error', 'Please provide at least one social media profile URL or upload a screenshot');
      return;
    }

    // Save the uploaded data and mark as uploaded in the main screen
    const socialMediaData = {
      urls: socialMediaUrls,
      screenshots: screenshots,
      isUploaded: true,
      hasScreenshots: hasAnyScreenshot,
      hasUrls: hasAnyUrl
    };

    setIsUploaded(true);

    // Determine which screen to return to based on route params or default to CheckMain
    const returnScreen = route?.params?.returnTo || 'CheckMain';
    
    // Pass the data back to the appropriate screen
    navigation?.navigate(returnScreen, { 
      uploadedSocialMedia: socialMediaData 
    });
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const hasAnyContent = Object.values(socialMediaUrls).some(url => url.trim() !== '') || 
                       Object.values(screenshots).some(screenshot => screenshot !== null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Social Media</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Social Media Analysis</Text>
            <Text style={styles.subtitle}>
              Upload screenshots for accurate analysis of follower counts, engagement, and authenticity
            </Text>
          </View>

          {/* Upload Status */}
          {isUploaded && (
            <View style={styles.uploadedContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successText}>✓</Text>
              </View>
              <Text style={styles.uploadedText}>Social media content uploaded successfully!</Text>
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Screenshot Upload Section - Recommended */}
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Text style={styles.recommendedTitle}>📱 Screenshot Upload </Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>More Accurate</Text>
              </View>
            </View>
            <Text style={styles.recommendedDescription}>
              Screenshots provide real data like follower counts, verification badges, and engagement rates for accurate analysis.
            </Text>

            <View style={styles.screenshotSection}>
              {/* Profile Screenshot */}
              <View style={styles.screenshotCard}>
                <Text style={styles.screenshotLabel}>Profile Screenshot</Text>
                <Text style={styles.screenshotSubtext}>Upload a screenshot of the profile page</Text>
                
                {screenshots.profileScreenshot ? (
                  <View style={styles.screenshotPreview}>
                    <Image source={{ uri: screenshots.profileScreenshot }} style={styles.previewImage} />
                    <TouchableOpacity 
                      onPress={() => setScreenshots(prev => ({ ...prev, profileScreenshot: null }))}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleImagePicker('profile')}
                    style={styles.uploadButton}
                  >
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadButtonText}>Upload Profile Screenshot</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Post Screenshot */}
              <View style={styles.screenshotCard}>
                <Text style={styles.screenshotLabel}>Post Screenshot</Text>
                <Text style={styles.screenshotSubtext}>Upload a screenshot of any recent post</Text>
                
                {screenshots.postScreenshot ? (
                  <View style={styles.screenshotPreview}>
                    <Image source={{ uri: screenshots.postScreenshot }} style={styles.previewImage} />
                    <TouchableOpacity 
                      onPress={() => setScreenshots(prev => ({ ...prev, postScreenshot: null }))}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleImagePicker('post')}
                    style={styles.uploadButton}
                  >
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadButtonText}>Upload Post Screenshot</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* URL Section - Alternative */}
          <View style={styles.urlSection}>
            <Text style={styles.urlSectionTitle}>🔗 Profile URLs (Alternative)</Text>
            <Text style={styles.urlSectionDescription}>
              URLs provide limited analysis compared to screenshots
            </Text>

            <View style={styles.inputSection}>
              {/* Facebook */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📘 Facebook</Text>
                <TextInput
                  style={styles.textInput}
                  value={socialMediaUrls.facebook}
                  onChangeText={(text) => handleUrlChange('facebook', text)}
                  placeholder="https://facebook.com/username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Instagram */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📸 Instagram</Text>
                <TextInput
                  style={styles.textInput}
                  value={socialMediaUrls.instagram}
                  onChangeText={(text) => handleUrlChange('instagram', text)}
                  placeholder="https://instagram.com/username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* LinkedIn */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>💼 LinkedIn</Text>
                <TextInput
                  style={styles.textInput}
                  value={socialMediaUrls.linkedin}
                  onChangeText={(text) => handleUrlChange('linkedin', text)}
                  placeholder="https://linkedin.com/in/username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Twitter */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🐦 Twitter/X</Text>
                <TextInput
                  style={styles.textInput}
                  value={socialMediaUrls.twitter}
                  onChangeText={(text) => handleUrlChange('twitter', text)}
                  placeholder="https://twitter.com/username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Other */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🌐 Other Platform</Text>
                <TextInput
                  style={styles.textInput}
                  value={socialMediaUrls.other}
                  onChangeText={(text) => handleUrlChange('other', text)}
                  placeholder="https://other-platform.com/username"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={hasAnyContent ? "Done" : "Back"}
            onPress={hasAnyContent ? handleDone : handleBack}
            style={hasAnyContent ? styles.doneButtonActive : styles.backButtonAlt}
            disabled={false}
          />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 12,
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    flex: 1,
  },
  recommendedSection: {
    marginBottom: 32,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  recommendedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendedDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  screenshotSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  screenshotCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  screenshotLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  screenshotSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  screenshotPreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b0000',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#8b0000',
  },
  uploadButtonText: {
    color: '#8b0000',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  urlSection: {
    marginBottom: 32,
  },
  urlSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#666',
  },
  urlSectionDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    marginBottom: 16,
  },
  inputSection: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  doneButtonActive: {
    backgroundColor: '#4CAF50',
  },
  backButtonAlt: {
    backgroundColor: '#8b0000',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 