import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

interface ScamReportSuccessScreenProps {
  navigation?: any;
}

export function ScamReportSuccessScreen({ navigation }: ScamReportSuccessScreenProps) {
  const handleClose = () => {
    navigation?.navigate('HomeScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/LoveScanLogoName.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>We have submitted a love scam report for you</Text>
        
        <View style={styles.steps}>
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.completedStep]}>
              <Text style={styles.stepIconText}>✓</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>You and others helped flag this suspicious profile</Text>
            </View>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.activeStep]}>
              <Text style={styles.stepIconText}>●</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Awaiting review by LoveScan</Text>
            </View>
          </View>
          
          <View style={styles.stepConnector} />
          
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.pendingStep]}>
              <Text style={styles.stepIconText}>🛡️</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>Others will be alerted to this suspicious profile</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={handleClose}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
    backgroundColor: '#8b0000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 36,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  steps: {
    paddingVertical: 20,
    flex: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  completedStep: {
    backgroundColor: '#d4edda',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  activeStep: {
    backgroundColor: '#8b0000',
  },
  pendingStep: {
    backgroundColor: '#e9ecef',
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  stepIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  stepConnector: {
    width: 3,
    height: 32,
    backgroundColor: '#dee2e6',
    marginLeft: 22,
    marginVertical: 8,
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  homeButton: {
    backgroundColor: '#8b0000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 