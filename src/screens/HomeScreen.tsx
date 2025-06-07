import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { AuthService } from '../lib/authService';

interface HomeScreenProps {
  navigation?: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const handleCheckScams = () => {
    navigation?.navigate('CheckPreview');
  };

  const handleReportScam = () => {
    console.log('HomeScreen: Attempting to navigate to SubmitScamReportMain');
    console.log('Navigation object:', navigation);
    if (navigation) {
      navigation.navigate('SubmitScamReportMain');
    } else {
      console.error('Navigation object is not available');
    }
  };

  const handleViewReports = () => {
    navigation?.navigate('PreviousReports');
  };

  const handleLogout = async () => {
    const result = await AuthService.signOut();
    
    if (result.error) {
      Alert.alert('Error', 'Failed to sign out');
    } else {
      console.log('User signed out successfully');
      navigation?.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Love Scan</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.profileImage}>
          <Text style={styles.logoutText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.primaryCard} onPress={handleCheckScams}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>🔍</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.badgeText}>AI Powered</Text>
            </View>
          </View>
          <Text style={styles.primaryCardTitle}>Check for Love Scams</Text>
          <Text style={styles.primaryCardDescription}>
            Use our dedicated AI agent to analyze conversations and detect potential romance fraud patterns
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.actionText}>Start Analysis →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCard} onPress={handleReportScam}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerSecondary}>
              <Text style={styles.cardIcon}>📝</Text>
            </View>
            <View style={styles.cardBadgeSecondary}>
              <Text style={styles.badgeTextSecondary}>Community</Text>
            </View>
          </View>
          <Text style={styles.secondaryCardTitle}>Submit Scam Report</Text>
          <Text style={styles.secondaryCardDescription}>
            Help protect others by reporting suspicious profiles and contributing to our scam database
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.actionTextSecondary}>Submit Report →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryCard} onPress={handleViewReports}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerTertiary}>
              <Text style={styles.cardIcon}>📋</Text>
            </View>
            <View style={styles.cardBadgeTertiary}>
              <Text style={styles.badgeTextTertiary}>History</Text>
            </View>
          </View>
          <Text style={styles.tertiaryCardTitle}>Previous Reports</Text>
          <Text style={styles.tertiaryCardDescription}>
            View and manage your submitted scam reports and track their status
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.actionTextTertiary}>View Reports →</Text>
          </View>
        </TouchableOpacity>
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
  logoutText: {
    fontSize: 20,
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 20,
    gap: 12,
  },
  primaryCard: {
    backgroundColor: '#8b0000',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#8b0000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSecondary: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 18,
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBadgeSecondary: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextSecondary: {
    color: '#8b0000',
    fontSize: 10,
    fontWeight: '600',
  },
  primaryCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  secondaryCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#8b0000',
  },
  primaryCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 8,
  },
  secondaryCardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  actionTextSecondary: {
    color: '#8b0000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  tertiaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#6c757d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  iconContainerTertiary: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeTertiary: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTextTertiary: {
    color: '#6c757d',
    fontSize: 10,
    fontWeight: '600',
  },
  tertiaryCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#495057',
  },
  tertiaryCardDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 8,
  },
  actionTextTertiary: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
}); 