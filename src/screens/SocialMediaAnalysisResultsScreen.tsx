import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SocialMediaAnalysisResult, getRiskColor, formatRiskScore } from '../lib/socialMediaAnalysis';

interface SocialMediaAnalysisResultsScreenProps {
  navigation?: any;
  route?: {
    params?: {
      analysisResult: SocialMediaAnalysisResult;
      profileUrl: string;
    };
  };
}

export function SocialMediaAnalysisResultsScreen({ navigation, route }: SocialMediaAnalysisResultsScreenProps) {
  const { analysisResult, profileUrl } = route?.params || {};

  // Debug logging to understand the data structure
  console.log('SocialMediaAnalysisResultsScreen - Full route params:', route?.params);
  console.log('SocialMediaAnalysisResultsScreen - analysisResult:', analysisResult);

  if (!analysisResult) {
    console.log('SocialMediaAnalysisResultsScreen - No analysisResult found');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No social media analysis results found</Text>
          <Button title="Back" onPress={() => navigation?.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleOpenProfile = async () => {
    const url = profileUrl || analysisResult.metadata?.profileUrl;
    if (url) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open profile URL');
      }
    } else {
      Alert.alert('Error', 'No profile URL available');
    }
  };

  const getSuspiciousIndicatorIcon = (indicator: boolean) => {
    return indicator ? '⚠️' : '✅';
  };

  const getSuspiciousIndicatorText = (key: string, value: boolean) => {
    const labels = {
      lowEngagement: value ? 'Low engagement detected' : 'Normal engagement',
      newAccount: value ? 'Appears to be new account' : 'Established account',
      stockPhotos: value ? 'May contain stock photos' : 'Original content detected',
      inconsistentPosting: value ? 'Inconsistent posting patterns' : 'Consistent posting',
      fakeLooking: value ? 'Profile appears suspicious' : 'Profile appears authentic',
      unverified: value ? 'Unverified account' : 'Verified account'
    };
    return labels[key as keyof typeof labels] || `${key}: ${value ? 'Yes' : 'No'}`;
  };

  // Helper function to format analysis text with bold numbers and metrics
  const formatAnalysisText = (text: string) => {
    if (!text) return [{ text: 'No analysis available', bold: false }];
    
    // Split text and identify parts to make bold
    const parts: Array<{ text: string; bold: boolean }> = [];
    const numberPatterns = [
      // Large numbers with commas: 14,500,000
      /\b\d{1,3}(?:,\d{3})+\b/g,
      // Numbers with K/M/B: 14.5M, 82K, 1.2B
      /\b\d+(?:\.\d+)?[KMB]\b/g,
      // Follower/following counts in context
      /\b\d+(?:,\d+)*\s*(?:followers?|following)\b/gi,
      // Like/comment counts
      /\b\d+(?:,\d+)*\s*(?:likes?|comments?)\b/gi,
      // Post counts
      /\b\d+(?:,\d+)*\s*posts?\b/gi,
      // Engagement rates
      /\b\d+(?:\.\d+)?%\s*engagement\b/gi,
      // Verification status
      /\b(?:verified|unverified)\s*account\b/gi,
      // Business/Creator indicators
      /\b(?:business|creator)\s*(?:profile|account)\b/gi,
      // Platform names when extracted
      /\bplatform:\s*\w+/gi
    ];
    
    let lastIndex = 0;
    
    // Find all matches and their positions
    const matches: Array<{ start: number; end: number; text: string }> = [];
    numberPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    });
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Remove overlapping matches (keep the longest)
    const uniqueMatches: Array<{ start: number; end: number; text: string }> = [];
    matches.forEach(match => {
      const overlapping = uniqueMatches.find(existing => 
        (match.start >= existing.start && match.start < existing.end) ||
        (match.end > existing.start && match.end <= existing.end)
      );
      if (!overlapping || match.text.length > overlapping.text.length) {
        if (overlapping) {
          const index = uniqueMatches.indexOf(overlapping);
          uniqueMatches.splice(index, 1);
        }
        uniqueMatches.push(match);
      }
    });
    
    // Build formatted parts
    uniqueMatches.sort((a, b) => a.start - b.start);
    
    uniqueMatches.forEach(match => {
      // Add text before the match
      if (match.start > lastIndex) {
        const beforeText = text.substring(lastIndex, match.start);
        if (beforeText.trim()) {
          parts.push({ text: beforeText, bold: false });
        }
      }
      
      // Add the bold match
      parts.push({ text: match.text, bold: true });
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push({ text: remainingText, bold: false });
      }
    }
    
    // If no matches found, return the original text
    if (parts.length === 0) {
      parts.push({ text: text, bold: false });
    }
    
    return parts;
  };

  // Component to render formatted text with bold parts
  const FormattedAnalysisText = ({ text }: { text: string }) => {
    const parts = formatAnalysisText(text);
    
    return (
      <Text style={styles.analysisValue}>
        {parts.map((part, index) => (
          <Text 
            key={index} 
            style={part.bold ? styles.boldExtractedData : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Media Analysis</Text>
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

        {/* Profile Information */}
        <Card style={styles.profileCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.profileInfo}>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Platform:</Text>
                <Text style={styles.profileValue}>{analysisResult.metadata?.platform || 'Unknown'}</Text>
              </View>
              
              {/* Screenshot Upload Status */}
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Profile Screenshot:</Text>
                <View style={styles.screenshotStatus}>
                  <Text style={[
                    styles.screenshotStatusText,
                    { 
                      color: analysisResult.screenshotAnalysis?.profileData?.analysisComplete ? '#44aa44' : '#ff6b6b' 
                    }
                  ]}>
                    {analysisResult.screenshotAnalysis?.profileData?.analysisComplete ? '✅ Uploaded' : '❌ Not provided'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Post Screenshot:</Text>
                <View style={styles.screenshotStatus}>
                  <Text style={[
                    styles.screenshotStatusText,
                    { 
                      color: analysisResult.screenshotAnalysis?.postData?.analysisComplete ? '#44aa44' : '#ff6b6b' 
                    }
                  ]}>
                    {analysisResult.screenshotAnalysis?.postData?.analysisComplete ? '✅ Uploaded' : '❌ Not provided'}
                  </Text>
                </View>
              </View>
              
              {/* Data Source Indicator */}
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Analysis Source:</Text>
                <Text style={[
                  styles.profileValue,
                  { 
                    color: analysisResult.metadata?.hasScreenshots ? '#44aa44' : '#ff8800' 
                  }
                ]}>
                  {analysisResult.metadata?.hasScreenshots ? 'Screenshot Data' : 'URL Only'}
                </Text>
              </View>
              
              <View style={styles.profileUrlSection}>
                <Text style={styles.profileLabel}>Profile URL:</Text>
                <TouchableOpacity onPress={handleOpenProfile} style={styles.profileLinkContainer}>
                  <Text style={styles.profileLink} numberOfLines={3} ellipsizeMode="middle">
                    {analysisResult.metadata?.profileUrl || 'Not provided'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Analysis Date:</Text>
                <Text style={styles.profileValue}>
                  {analysisResult.metadata?.analysisTimestamp 
                    ? new Date(analysisResult.metadata.analysisTimestamp).toLocaleDateString()
                    : 'Unknown'
                  }
                </Text>
              </View>
              <View style={styles.profileInfoRow}>
                <Text style={styles.profileLabel}>Confidence:</Text>
                <Text style={styles.profileValue}>{analysisResult.confidence || 'Unknown'}</Text>
              </View>
            </View>
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

        {/* Suspicious Indicators */}
        {analysisResult.suspiciousIndicators && (
          <Card style={styles.indicatorsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>Suspicious Indicators</Text>
              <View style={styles.indicatorsList}>
                {Object.entries(analysisResult.suspiciousIndicators).map(([key, value]) => (
                  <View key={key} style={styles.indicatorItem}>
                    <Text style={styles.indicatorIcon}>{getSuspiciousIndicatorIcon(value)}</Text>
                    <Text style={[
                      styles.indicatorText,
                      { color: value ? '#ff4444' : '#44aa44' }
                    ]}>
                      {getSuspiciousIndicatorText(key, value)}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis */}
        {analysisResult.detailedAnalysis && (
          <Card style={styles.detailsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>Detailed Analysis</Text>
              
              {Object.entries(analysisResult.detailedAnalysis).map(([key, value]) => (
                <View key={key} style={styles.analysisSection}>
                  <Text style={styles.analysisLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <FormattedAnalysisText text={value || 'No analysis available'} />
                </View>
              ))}
            </CardContent>
          </Card>
        )}

        {/* AI Model Information */}
        <Card style={styles.metadataCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Analysis Details</Text>
            <View style={styles.metadataInfo}>
              <Text style={styles.metadataText}>
                AI Model: {analysisResult.metadata?.aiModel || 'Unknown'}
              </Text>
              <Text style={styles.metadataText}>
                Analysis powered by advanced AI pattern recognition
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Extracted Screenshot Data */}
        {(analysisResult.screenshotAnalysis?.profileData?.metrics || analysisResult.screenshotAnalysis?.postData?.metrics) && (
          <Card style={styles.extractedDataCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>📸 Extracted Screenshot Data</Text>
              
              {analysisResult.screenshotAnalysis?.profileData?.metrics && (
                <View style={styles.extractedSection}>
                  <Text style={styles.extractedSectionTitle}>Profile Data:</Text>
                  <View style={styles.extractedMetrics}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Followers:</Text>
                      <Text style={styles.metricValue}>
                        {analysisResult.screenshotAnalysis.profileData.metrics.followerCount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Following:</Text>
                      <Text style={styles.metricValue}>
                        {analysisResult.screenshotAnalysis.profileData.metrics.followingCount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Posts:</Text>
                      <Text style={styles.metricValue}>
                        {analysisResult.screenshotAnalysis.profileData.metrics.postCount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Verification:</Text>
                      <Text style={[
                        styles.metricValue,
                        { color: analysisResult.screenshotAnalysis.profileData.metrics.isVerified ? '#44aa44' : '#ff6b6b' }
                      ]}>
                        {analysisResult.screenshotAnalysis.profileData.metrics.isVerified ? '✅ Verified' : '❌ Not verified'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              {analysisResult.screenshotAnalysis?.postData?.metrics && (
                <View style={styles.extractedSection}>
                  <Text style={styles.extractedSectionTitle}>Post Data:</Text>
                  <View style={styles.extractedMetrics}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Likes:</Text>
                      <Text style={styles.metricValue}>
                        {analysisResult.screenshotAnalysis.postData.metrics.likesCount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Comments:</Text>
                      <Text style={styles.metricValue}>
                        {analysisResult.screenshotAnalysis.postData.metrics.commentsCount.toLocaleString()}
                      </Text>
                    </View>
                    {analysisResult.screenshotAnalysis?.profileData?.metrics && (
                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Engagement Rate:</Text>
                        <Text style={styles.metricValue}>
                          {((analysisResult.screenshotAnalysis.postData.metrics.likesCount / analysisResult.screenshotAnalysis.profileData.metrics.followerCount) * 100).toFixed(2)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="View Profile"
            onPress={handleOpenProfile}
            style={styles.primaryButton}
          />
          <Button
            title="Analyze Another Profile"
            onPress={() => navigation?.navigate('SocialMediaScan')}
            variant="secondary"
          />
          <Button
            title="Back to Results"
            onPress={() => navigation?.goBack()}
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
  profileCard: {
    marginBottom: 16,
  },
  profileInfo: {
    gap: 8,
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  profileUrlSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    paddingVertical: 4,
  },
  profileLinkContainer: {
    alignSelf: 'stretch',
  },
  profileLink: {
    fontSize: 14,
    color: '#8b0000',
    fontWeight: '500',
    textAlign: 'left',
    textDecorationLine: 'underline',
    lineHeight: 18,
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
  indicatorsCard: {
    marginBottom: 16,
  },
  indicatorsList: {
    gap: 8,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorIcon: {
    fontSize: 16,
  },
  indicatorText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
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
  metadataCard: {
    marginBottom: 16,
  },
  metadataInfo: {
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    gap: 12,
    paddingVertical: 24,
  },
  primaryButton: {
    backgroundColor: '#8b0000',
  },
  boldExtractedData: {
    fontWeight: 'bold',
    color: '#8b0000',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  screenshotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  screenshotStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  extractedDataCard: {
    marginBottom: 16,
  },
  extractedSection: {
    marginBottom: 16,
  },
  extractedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  extractedMetrics: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
}); 