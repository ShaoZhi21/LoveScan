import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { searchSimilarImages, analyzeImageSafety, VisionMatch } from '../lib/googleVision';

interface ReverseImageSearchScreenProps {
  navigation?: any;
  route?: {
    params: {
      imageUri: string;
      preloadedResults?: {
        matches: VisionMatch[];
        riskAnalysis: {
          riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
          riskFactors: string[];
          recommendation: string;
        };
      };
    };
  };
}

export function ReverseImageSearchScreen({ navigation, route }: ReverseImageSearchScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<VisionMatch[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    recommendation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  const imageUri = route?.params?.imageUri;
  const preloadedResults = route?.params?.preloadedResults;

  useEffect(() => {
    if (imageUri) {
      // Check if we have preloaded results to avoid re-scanning
      if (preloadedResults) {
        console.log('ReverseImageSearch: Using preloaded results');
        setSearchResults(preloadedResults.matches);
        setRiskAnalysis(preloadedResults.riskAnalysis);
        setIsLoading(false);
      } else {
        console.log('ReverseImageSearch: No preloaded results, performing new search');
        performReverseSearch();
      }
    } else {
      setError('No image provided for analysis');
      setIsLoading(false);
    }
  }, [imageUri, preloadedResults]);

  const performReverseSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setImageLoadErrors(new Set()); // Reset image load errors

      // Perform reverse image search using Google Vision API
      const results = await searchSimilarImages(imageUri!);
      setSearchResults(results);

      // Analyze safety based on results
      const analysis = analyzeImageSafety(results);
      setRiskAnalysis(analysis);

    } catch (err) {
      console.error('Reverse search error:', err);
      setError('Failed to perform reverse image search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoadError = (index: number) => {
    console.log(`Failed to load thumbnail for result ${index}`);
    setImageLoadErrors(prev => new Set(prev).add(index));
  };

  const handleOpenUrl = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL');
    }
  };

  const getRiskColor = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (level) {
      case 'HIGH': return '#ff4444';
      case 'MEDIUM': return '#ff8800';
      case 'LOW': return '#44aa44';
      default: return '#666';
    }
  };

  const formatDomain = (domain: string) => {
    // Remove common prefixes and clean up domain
    return domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Image Analysis</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b0000" />
          <Text style={styles.loadingText}>Analyzing image with Google Vision...</Text>
          <Text style={styles.loadingSubtext}>Searching for similar images across the web</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Error</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Button title="Try Again" onPress={performReverseSearch} />
          <Button title="Back" onPress={() => navigation?.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Google Vision Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Original Image */}
        <Card style={styles.originalImageCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>Analyzed Image</Text>
            <Image source={{ uri: imageUri }} style={styles.originalImage} />
            
            {/* Show detected labels if available */}
            {searchResults.length > 0 && searchResults[0].labels && (
              <View style={styles.labelsContainer}>
                <Text style={styles.labelsTitle}>Detected Content:</Text>
                <View style={styles.labelsWrapper}>
                  {searchResults[0].labels.slice(0, 5).map((label, index) => (
                    <View key={index} style={styles.labelBadge}>
                      <Text style={styles.labelText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        {riskAnalysis && (
          <Card style={styles.riskCard}>
            <CardContent>
              <View style={styles.riskHeader}>
                <Text style={styles.sectionTitle}>Risk Assessment</Text>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskAnalysis.riskLevel) }]}>
                  <Text style={styles.riskBadgeText}>{riskAnalysis.riskLevel} RISK</Text>
                </View>
              </View>
              
              <Text style={styles.recommendation}>{riskAnalysis.recommendation}</Text>
              
              {riskAnalysis.riskFactors.length > 0 && (
                <View style={styles.riskFactors}>
                  <Text style={styles.riskFactorsTitle}>Risk Factors:</Text>
                  {riskAnalysis.riskFactors.map((factor, index) => (
                    <Text key={index} style={styles.riskFactor}>• {factor}</Text>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        <Card style={styles.resultsCard}>
          <CardContent>
            <Text style={styles.sectionTitle}>
              Similar Images Found ({searchResults.length})
            </Text>
            <Text style={styles.poweredBy}>Powered by Google Vision AI</Text>
            
            {searchResults.length === 0 ? (
              <Text style={styles.noResultsText}>
                No similar images found. This could indicate the image is original or not widely used online.
              </Text>
            ) : (
              <View style={styles.resultsList}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleOpenUrl(result.url)}
                  >
                    <View style={styles.resultContent}>
                      {/* Thumbnail Image */}
                      <View style={styles.thumbnailContainer}>
                        {result.image_url && !imageLoadErrors.has(index) ? (
                          <Image 
                            source={{ uri: result.image_url }} 
                            style={styles.thumbnail}
                            resizeMode="cover"
                            onError={() => handleImageLoadError(index)}
                          />
                        ) : (
                          <View style={styles.placeholderThumbnail}>
                            <Text style={styles.placeholderText}>🖼️</Text>
                            <Text style={styles.placeholderLabel}>Image</Text>
                          </View>
                        )}
                        
                        {/* Match Score Badge */}
                        <View style={[
                          styles.scoreBadge,
                          { backgroundColor: result.score > 90 ? '#8b0000' : result.score > 70 ? '#ff8800' : '#666' }
                        ]}>
                          <Text style={styles.scoreText}>{result.score.toFixed(0)}%</Text>
                        </View>
                      </View>

                      {/* Result Info */}
                      <View style={styles.resultInfo}>
                        <View style={styles.resultHeader}>
                          <Text style={styles.resultDomain}>{formatDomain(result.domain)}</Text>
                          <Text style={styles.resultScore}>{result.score.toFixed(1)}% match</Text>
                        </View>
                        
                        {result.description && (
                          <Text style={styles.resultDescription} numberOfLines={2}>
                            {result.description}
                          </Text>
                        )}
                        <Text style={styles.resultFilename} numberOfLines={1}>
                          {result.filename}
                        </Text>
                        <Text style={styles.resultDetails}>
                          {result.width}×{result.height} • {result.format} • {Math.round(result.size / 1024)}KB
                        </Text>
                        <Text style={styles.resultDate}>Found: {result.crawl_date}</Text>
                        
                        <View style={styles.linkContainer}>
                          <Text style={styles.linkText}>🔗 Tap to view source</Text>
                          <Text style={styles.linkArrow}>→</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Scan Another Image"
            onPress={() => navigation?.goBack()}
            style={styles.scanButton}
          />
          <Button
            title="Generate Report"
            onPress={() => navigation?.navigate('RiskReport')}
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
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  originalImageCard: {
    marginBottom: 16,
  },
  originalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  labelsContainer: {
    marginTop: 8,
  },
  labelsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  labelBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  labelText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  poweredBy: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  riskCard: {
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  recommendation: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    color: '#333',
  },
  riskFactors: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  riskFactorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  riskFactor: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 4,
  },
  resultsCard: {
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    padding: 20,
  },
  resultsList: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultContent: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placeholderThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 24,
    color: '#999',
  },
  placeholderLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    marginTop: 4,
  },
  scoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#8b0000',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  resultInfo: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultDomain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8b0000',
  },
  resultDescription: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    fontWeight: '500',
  },
  resultFilename: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#8b0000',
    fontWeight: '500',
  },
  linkArrow: {
    fontSize: 16,
    color: '#8b0000',
  },
  actionButtons: {
    gap: 12,
    paddingVertical: 24,
  },
  scanButton: {
    backgroundColor: '#8b0000',
  },
}); 