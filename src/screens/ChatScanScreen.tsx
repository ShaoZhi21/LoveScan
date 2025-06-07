import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button } from '../components/ui/Button';

interface ChatScanScreenProps {
  navigation?: any;
  route?: {
    params?: {
      existingData?: any;
      returnTo?: string;
    };
  };
}

export function ChatScanScreen({ navigation, route }: ChatScanScreenProps) {
  const existingData = route?.params?.existingData;
  
  const [messageText, setMessageText] = useState(existingData?.messageText || '');
  const [chatlogFile, setChatlogFile] = useState<{name: string, uri: string} | null>(existingData?.chatlogFile || null);
  const [screenshotFile, setScreenshotFile] = useState<{name: string, uri: string} | null>(existingData?.screenshotFile || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(existingData?.isUploaded || false);

  const handleClearAll = () => {
    setMessageText('');
    setChatlogFile(null);
    setScreenshotFile(null);
    setIsUploaded(false);
  };

  const handleChatlogUpload = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setChatlogFile({
          name: file.name,
          uri: file.uri
        });
        
        // If it's a text file, read it and populate the text input
        if (file.mimeType === 'text/plain') {
          try {
            const content = await FileSystem.readAsStringAsync(file.uri);
            setMessageText(content);
          } catch (error) {
            console.log('Could not read text file content');
          }
        }
        
        setIsUploaded(true);
        Alert.alert('Success', 'Chatlog uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload chatlog. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleScreenshotUpload = async () => {
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setScreenshotFile({
          name: asset.fileName || 'screenshot.jpg',
          uri: asset.uri
        });
        setIsUploaded(true);
        Alert.alert('Success', 'Screenshot uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload screenshot. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDone = () => {
    if (!messageText.trim() && !chatlogFile && !screenshotFile) {
      Alert.alert('Error', 'Please provide at least one input (text, chatlog, or screenshot)');
      return;
    }

    // Save the uploaded data and mark as uploaded in the main screen
    const chatData = {
      messageText: messageText.trim(),
      chatlogFile,
      screenshotFile,
      isUploaded: true
    };

    console.log('ChatScanScreen: Navigating back with data:', chatData);

    // Determine which screen to return to based on route params or default to CheckMain
    const returnScreen = route?.params?.returnTo || 'CheckMain';
    
    // Pass the data back to the appropriate screen
    navigation?.navigate(returnScreen, { 
      uploadedChat: chatData 
    });
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const hasAnyContent = messageText.trim() || chatlogFile || screenshotFile;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Chat</Text>
        <View style={styles.profileImage}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Upload your chat content</Text>
            <Text style={styles.subtitle}>
              Upload your chatlog file, screenshot, or paste the text directly.
            </Text>
          </View>

          {/* Upload Status */}
          {isUploaded && (
            <View style={styles.uploadedContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successText}>✓</Text>
              </View>
              <Text style={styles.uploadedText}>Chat content uploaded successfully!</Text>
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.uploadSection}>
            {/* Chatlog Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, chatlogFile && styles.uploadButtonSelected]}
              onPress={handleChatlogUpload}
              disabled={isUploading}
            >
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={[styles.uploadText, chatlogFile && styles.uploadTextSelected]}>
                {chatlogFile ? `✓ ${chatlogFile.name}` : 'Upload chatlog file'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>OR</Text>

            {/* Screenshot Upload */}
            <TouchableOpacity
              style={[styles.uploadButton, screenshotFile && styles.uploadButtonSelected]}
              onPress={handleScreenshotUpload}
              disabled={isUploading}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={[styles.uploadText, screenshotFile && styles.uploadTextSelected]}>
                {screenshotFile ? `✓ ${screenshotFile.name}` : 'Upload message screenshot'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>OR</Text>

            {/* Text Input */}
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Paste message text here..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!isUploading}
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={
              isUploading 
                ? "Uploading..." 
                : (hasAnyContent || isUploaded) 
                  ? "Done" 
                  : "Back"
            }
            onPress={() => {
              if (isUploading) return;
              if (hasAnyContent || isUploaded) {
                handleDone();
              } else {
                handleBack();
              }
            }}
            style={
              isUploading 
                ? styles.uploadingButton
                : (hasAnyContent || isUploaded) 
                  ? styles.doneButtonActive 
                  : styles.actionBackButton
            }
            disabled={isUploading}
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
  uploadSection: {
    gap: 16,
    marginBottom: 32,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  uploadTextSelected: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  textInputContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 4,
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  doneButton: {
    backgroundColor: '#ccc',
  },
  doneButtonActive: {
    backgroundColor: '#4CAF50',
  },
  actionBackButton: {
    borderColor: '#8b0000',
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
  uploadingButton: {
    backgroundColor: '#ccc',
  },
  backButtonAlt: {
    backgroundColor: '#8b0000',
  },
}); 