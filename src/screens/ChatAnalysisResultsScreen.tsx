import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChatAnalysisResult, getRiskColor, formatRiskScore } from '../lib/chatAnalysis';

interface ChatAnalysisResultsScreenProps {
  navigation?: any;
  route?: {
    params?: {
      analysisResult: ChatAnalysisResult;
      originalText: string;
      hasScreenshot: boolean;
      hasChatlog: boolean;
    };
  };
}

export function ChatAnalysisResultsScreen({ navigation, route }: ChatAnalysisResultsScreenProps) {
  const { analysisResult, originalText, hasScreenshot, hasChatlog } = route?.params || {};

  // Debug logging to understand the data structure
  console.log('ChatAnalysisResultsScreen - Full route params:', route?.params);
  console.log('ChatAnalysisResultsScreen - analysisResult:', analysisResult);
  console.log('ChatAnalysisResultsScreen - analysisResult type:', typeof analysisResult);

  if (!analysisResult) {
    console.log('ChatAnalysisResultsScreen - No analysisResult found');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analysis results found</Text>
          <Button title="Back" onPress={() => navigation?.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleGenerateReport = () => {
    navigation?.navigate('RiskReport', { 
      chatAnalysis: analysisResult,
      originalText 
    });
  };

  const handleScanAnother = () => {
    navigation?.navigate('ChatScan');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Analysis Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Risk Assessment Summary */}
        <Card style={styles.summaryCard}>
          <CardContent>
            <View style={styles.riskHeader}>
              <Text style={styles.sectionTitle}>Risk Assessment</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(analysisResult.riskLevel || 'LOW') }]}>
                <Text style={styles.riskBadgeText}>{(analysisResult.riskLevel || 'LOW')} RISK</Text>
              </View>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Risk Score</Text>
              <Text style={[styles.scoreValue, { color: getRiskColor(analysisResult.riskLevel || 'LOW') }]}>
                {analysisResult.riskScore || 0}/100
              </Text>
            </View>
            
            <Text style={styles.scoreDescription}>
              {formatRiskScore(analysisResult.riskScore || 0)}
            </Text>
            
            <Text style={styles.recommendation}>
              {analysisResult.recommendation || 'No recommendation available'}
            </Text>
          </CardContent>
        </Card>

        {/* Primary Concerns */}
        {analysisResult.primaryConcerns && analysisResult.primaryConcerns.length > 0 && (
          <Card style={styles.concernsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>Primary Concerns</Text>
              <View style={styles.concernsList}>
                {analysisResult.primaryConcerns.map((concern, index) => (
                  <View key={index} style={styles.concernItem}>
                    <Text style={styles.concernBullet}>⚠️</Text>
                    <Text style={styles.concernText}>{concern}</Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        <Card style={styles.detailsCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            
            {analysisResult.detailedAnalysis && Object.entries(analysisResult.detailedAnalysis).map(([key, value]) => (
              <View key={key} style={styles.analysisSection}>
                <Text style={styles.analysisLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.analysisValue}>{value || 'No analysis available'}</Text>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Pattern Analysis */}
        <Card style={styles.patternCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Pattern Analysis</Text>
            
            <View style={styles.patternStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisResult.patternAnalysis?.highRiskIndicators || 0}</Text>
                <Text style={styles.statLabel}>High Risk</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisResult.patternAnalysis?.mediumRiskIndicators || 0}</Text>
                <Text style={styles.statLabel}>Medium Risk</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analysisResult.patternAnalysis?.grammarIssues || 0}</Text>
                <Text style={styles.statLabel}>Grammar</Text>
              </View>
            </View>

            {analysisResult.patternAnalysis?.foundPatterns?.length > 0 && (
              <View style={styles.patternsContainer}>
                <Text style={styles.patternsTitle}>Found Patterns:</Text>
                {analysisResult.patternAnalysis.foundPatterns.map((pattern, index) => (
                  <Text key={index} style={styles.patternItem}>• {pattern}</Text>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Analysis Metadata */}
        <Card style={styles.metadataCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Analysis Details</Text>
            <View style={styles.metadataGrid}>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Text Length</Text>
                <Text style={styles.metadataValue}>{(analysisResult.metadata?.chatLength || 0).toLocaleString()} characters</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Word Count</Text>
                <Text style={styles.metadataValue}>{(analysisResult.metadata?.wordCount || 0).toLocaleString()} words</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>AI Model</Text>
                <Text style={styles.metadataValue}>{analysisResult.metadata?.aiModel || 'Unknown'}</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Confidence</Text>
                <Text style={styles.metadataValue}>{analysisResult.confidence || 'Unknown'}</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Analysis Date</Text>
                <Text style={styles.metadataValue}>
                  {analysisResult.metadata?.analysisTimestamp 
                    ? new Date(analysisResult.metadata.analysisTimestamp).toLocaleDateString()
                    : 'Unknown'
                  }
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Input Method</Text>
                <Text style={styles.metadataValue}>
                  {hasChatlog ? 'File Upload' : hasScreenshot ? 'Screenshot' : 'Manual Text'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Analyze Another Chat"
            onPress={handleScanAnother}
            variant="secondary"
          />
          <Button
            title="Back to Home"
            onPress={() => navigation?.navigate('Home')}
            variant="outline"
          />
        </View>
      </ScrollView>
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
    fontSize: 18,
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
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  recommendation: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  concernsCard: {
    marginBottom: 16,
  },
  concernsList: {
    gap: 8,
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  concernBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  concernText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: 16,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  patternCard: {
    marginBottom: 16,
  },
  patternStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b0000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  patternsContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  patternsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  patternItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 2,
  },
  metadataCard: {
    marginBottom: 16,
  },
  metadataGrid: {
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  actionButtons: {
    gap: 12,
    paddingVertical: 24,
  },
  primaryButton: {
    backgroundColor: '#8b0000',
  },
}); 