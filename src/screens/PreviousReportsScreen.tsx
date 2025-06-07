import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { AuthService } from '../lib/authService';
import { ReportService } from '../lib/reportService';
import type { ReportData } from '../types/report';

interface NavigationProp {
  navigate: (screenName: any, params?: any) => void;
  goBack: () => void;
}

interface PreviousReportsScreenProps {
  navigation?: NavigationProp;
}

function PreviousReportsScreen({ navigation }: PreviousReportsScreenProps) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const user = await AuthService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to view reports');
        navigation?.navigate('Login');
        return;
      }

      const result = await ReportService.getReportsByUser(user.id);
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      setReports(result.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load your reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = () => {
    loadReports(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#fd7e14';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const handleReportPress = (report: ReportData) => {
    // Navigate to ScanSummaryResultsScreen with the report data
    navigation?.navigate('ScanSummaryResults', {
      analysisResults: report.scan_data || {},
      uploadStatus: {
        chat: report.scan_type?.includes('chat') || false,
        profile: report.scan_type?.includes('reverse_image') || false,
        socialMedia: report.scan_type?.includes('social_media') || false,
      },
      uploadedData: report.metadata || {},
      // Mark this as a previously reported profile
      isViewingPreviousReport: true,
      previousReportData: {
        reportId: report.id,
        reportedName: report.reported_name,
        reportReason: report.report_reason,
        submittedAt: report.created_at,
        status: report.status || 'Submitted'
      },
      // Track the source screen for proper back navigation
      sourceScreen: 'PreviousReports'
    });
  };

  const renderReportItem = ({ item }: { item: ReportData }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => handleReportPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportedPersonName}>
            {item.reported_name || 'Unknown'}
          </Text>
          <View style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(item.risk_level) }
          ]}>
            <Text style={styles.riskBadgeText}>
              {item.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
            </Text>
          </View>
        </View>
        <Text style={styles.reportDate}>
          {formatDate(item.created_at || '')}
        </Text>
      </View>

      <Text style={styles.reportReason}>
        Primary: {item.report_reason || 'Not specified'}
      </Text>
      
{/* Additional concerns removed - no longer needed */}

      {item.scan_type && (
        <Text style={styles.scanTypes}>
          Evidence: {item.scan_type.replace(/\+/g, ', ').replace(/_/g, ' ')}
        </Text>
      )}

      <View style={styles.reportFooter}>
        <View style={styles.reportStatusContainer}>
          <Text style={styles.reportStatus}>
            Status: {item.status || 'Submitted'}
          </Text>
          <Text style={styles.reportId}>
            ID: {item.id?.slice(0, 8)}...
          </Text>
        </View>
        <Text style={styles.viewDetailsText}>
          Tap to view details →
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Previous Reports</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc143c" />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Previous Reports</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/LoveScanLogoName.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyDescription}>
              You haven't submitted any scam reports yet. Start by analyzing a profile or chat to identify potential love scams.
            </Text>
            <TouchableOpacity 
              style={styles.newReportButton}
              onPress={() => navigation?.navigate('HomeScreen')}
            >
              <Text style={styles.newReportButtonText}>Start New Analysis</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#dc143c']}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#dc143c',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  newReportButton: {
    backgroundColor: '#dc143c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newReportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportedPersonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  reportReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reportConcerns: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scanTypes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reportStatusContainer: {
    flex: 1,
  },
  reportStatus: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  reportId: {
    fontSize: 12,
    color: '#999',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#dc143c',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default PreviousReportsScreen; 