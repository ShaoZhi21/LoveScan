import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from '../components/ui/Button';

interface CheckPreviewScreenProps {
  navigation?: any;
}

export function CheckPreviewScreen({ navigation }: CheckPreviewScreenProps) {
  const handleContinue = () => {
    navigation?.navigate('CheckMain');
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Love Scan</Text>
        <View style={styles.profileImage}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.introSection}>
          <Text style={styles.title}>Check for Love Scams</Text>
          <Text style={styles.description}>
            Our AI-powered system analyzes various aspects of your conversations and interactions to detect potential romance scams.
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureText}>Chat Analysis - Detect manipulative language patterns</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🖼️</Text>
              <Text style={styles.featureText}>Profile Verification - Reverse image search for fake profiles</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>Social Media Check - Analyze social media presence</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Full Scan - Comprehensive risk assessment</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Start Checking"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
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
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    paddingTop: 32,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  introSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
    paddingBottom: 24,
  },
  continueButton: {
    backgroundColor: '#8b0000',
  },
  backButton: {
    borderColor: '#8b0000',
  },
}); 