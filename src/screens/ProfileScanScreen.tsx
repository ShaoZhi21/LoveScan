import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/ui/Button';

interface ProfileScanScreenProps {
  navigation?: any;
  route?: {
    params?: {
      existingData?: any;
      returnTo?: string;
    };
  };
}

export function ProfileScanScreen({ navigation, route }: ProfileScanScreenProps) {
  const existingData = route?.params?.existingData;
  
  const [imageUri, setImageUri] = useState<string | null>(existingData?.imageUri || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(existingData?.isUploaded || false);

  const handleClearImage = () => {
    setImageUri(null);
    setIsUploaded(false);
  };

  const handleImageUpload = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      setIsUploading(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setIsUploaded(true);
        Alert.alert('Success', 'Profile image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request permission to access camera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      setIsUploading(true);

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setIsUploaded(true);
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDone = () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please upload or take a photo first');
      return;
    }
    
    // Save the uploaded data and mark as uploaded in the main screen
    const profileData = {
      imageUri,
      isUploaded: true
    };

    // Determine which screen to return to based on route params or default to CheckMain
    const returnScreen = route?.params?.returnTo || 'CheckMain';
    
    // Pass the data back to the appropriate screen
    navigation?.navigate(returnScreen, { 
      uploadedProfile: profileData 
    });
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Upload Profile Image</Text>
        <Text style={styles.subtitle}>
          Upload or take a photo of the profile picture for analysis
        </Text>

        {/* Upload Status */}
        {isUploaded && (
          <View style={styles.uploadedContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successText}>✓</Text>
            </View>
            <Text style={styles.uploadedText}>Profile image uploaded successfully!</Text>
            <TouchableOpacity onPress={handleClearImage} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <Text style={styles.imagePreviewText}>✓ Image ready for analysis</Text>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>🖼️</Text>
            <Text style={styles.uploadText}>
              {isUploading ? 'Processing...' : 'No image selected'}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button 
            title={isUploading ? 'Processing...' : 'Choose from Gallery'} 
            onPress={handleImageUpload}
            disabled={isUploading}
            style={styles.uploadButton}
          />
          
          <Button 
            title={isUploading ? 'Processing...' : 'Take Photo'} 
            onPress={handleTakePhoto}
            disabled={isUploading}
            variant="secondary"
            style={styles.uploadButton}
          />

          <Button 
            title={isUploading ? 'Uploading...' : imageUri ? 'Done' : 'Upload Image'}
            onPress={handleDone}
            disabled={isUploading || !imageUri}
            style={imageUri ? styles.doneButtonActive : styles.doneButton}
          />
          <Button 
            title="Back" 
            onPress={handleBack} 
            variant="outline" 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#8b0000' 
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
    padding: 24, 
    gap: 20 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center',
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
  uploadArea: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: '#ccc', 
    borderRadius: 12, 
    padding: 40, 
    alignItems: 'center', 
    gap: 12,
    minHeight: 200,
    justifyContent: 'center',
  },
  uploadIcon: { 
    fontSize: 48 
  },
  uploadText: { 
    fontSize: 16, 
    color: '#666' 
  },
  imagePreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  imagePreviewText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  uploadButton: {
    marginVertical: 4,
  },
  doneButton: {
    backgroundColor: '#ccc',
  },
  doneButtonActive: {
    backgroundColor: '#4CAF50',
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