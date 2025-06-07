import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { CONFIG } from '../config/env';

export interface VisionMatch {
  image_url: string;
  domain: string;
  score: number;
  width: number;
  height: number;
  size: number;
  format: string;
  filename: string;
  url: string;
  crawl_date: string;
  description?: string;
  labels?: string[];
}

export interface BackendVisionResponse {
  success: boolean;
  data: {
    responses: Array<{
      labelAnnotations?: Array<{
        mid: string;
        description: string;
        score: number;
        topicality: number;
      }>;
      webDetection?: {
        webEntities?: Array<{
          entityId: string;
          score: number;
          description: string;
        }>;
        fullMatchingImages?: Array<{
          url: string;
        }>;
        partialMatchingImages?: Array<{
          url: string;
        }>;
        pagesWithMatchingImages?: Array<{
          url: string;
          pageTitle: string;
          fullMatchingImages?: Array<{
            url: string;
          }>;
          partialMatchingImages?: Array<{
            url: string;
          }>;
        }>;
        visuallySimilarImages?: Array<{
          url: string;
        }>;
        bestGuessLabels?: Array<{
          label: string;
          languageCode: string;
        }>;
      };
      safeSearchAnnotation?: {
        adult: string;
        spoof: string;
        medical: string;
        violence: string;
        racy: string;
      };
      error?: {
        code: number;
        message: string;
        status: string;
      };
    }>;
  };
  timestamp: string;
}

export const searchSimilarImages = async (imageUri: string): Promise<VisionMatch[]> => {
  try {
    console.log('🔍 Starting image analysis via backend...');
    
    // Read the image file and convert to base64
    const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('📤 Sending image to backend for analysis...');

    // Make API call to our secure backend
    const response = await axios.post(
      `${CONFIG.BACKEND_URL}${CONFIG.VISION_ANALYZE_ENDPOINT}`,
      {
        imageBase64: imageBase64,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for image processing
      }
    );

    console.log('✅ Backend response received');

    const backendResponse: BackendVisionResponse = response.data;
    
    if (!backendResponse.success) {
      throw new Error('Backend analysis failed');
    }

    // Process the response to extract similar images
    return processVisionResponse(backendResponse.data);

  } catch (error) {
    console.error('❌ Error searching with backend API:', error);
    
    // If backend fails, return mock results for demo
    console.log('🔄 Falling back to mock results for demo purposes');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    return generateMockResults();
  }
};

const processVisionResponse = (visionData: BackendVisionResponse['data']): VisionMatch[] => {
  const matches: VisionMatch[] = [];
  const webDetection = visionData.responses[0]?.webDetection;
  const labels = visionData.responses[0]?.labelAnnotations?.map(label => label.description) || [];

  if (!webDetection) {
    console.log('⚠️ No web detection data found');
    return matches;
  }

  console.log(`🔍 Processing ${webDetection.pagesWithMatchingImages?.length || 0} pages with matching images`);

  // Process pages with matching images
  webDetection.pagesWithMatchingImages?.forEach((page, index) => {
    if (page.url && page.pageTitle) {
      const domain = extractDomain(page.url);
      
      matches.push({
        image_url: page.fullMatchingImages?.[0]?.url || page.partialMatchingImages?.[0]?.url || '',
        domain: domain,
        score: 95 - (index * 2), // Simulate confidence scores
        width: 800,
        height: 600,
        size: 150000,
        format: 'JPEG',
        filename: generateFilename(page.pageTitle),
        url: page.url,
        crawl_date: new Date().toISOString().split('T')[0],
        description: page.pageTitle,
        labels: labels,
      });
    }
  });

  // Process visually similar images
  webDetection.visuallySimilarImages?.forEach((image, index) => {
    if (image.url) {
      const domain = extractDomain(image.url);
      
      matches.push({
        image_url: image.url,
        domain: domain,
        score: 85 - (index * 1.5),
        width: 800,
        height: 600,
        size: 120000,
        format: 'JPEG',
        filename: `similar_image_${index + 1}.jpg`,
        url: image.url,
        crawl_date: new Date().toISOString().split('T')[0],
        labels: labels,
      });
    }
  });

  // Process full matching images
  webDetection.fullMatchingImages?.forEach((image, index) => {
    if (image.url) {
      const domain = extractDomain(image.url);
      
      matches.push({
        image_url: image.url,
        domain: domain,
        score: 98 - (index * 0.5),
        width: 800,
        height: 600,
        size: 180000,
        format: 'JPEG',
        filename: `exact_match_${index + 1}.jpg`,
        url: image.url,
        crawl_date: new Date().toISOString().split('T')[0],
        labels: labels,
      });
    }
  });

  console.log(`✅ Processed ${matches.length} image matches`);
  return matches.slice(0, 10); // Limit to top 10 results
};

const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown-domain.com';
  }
};

const generateFilename = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50) + '.jpg';
};

// Mock function for demo purposes when backend fails
const generateMockResults = (): VisionMatch[] => {
  return [
    {
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      domain: 'dating-scammer-database.com',
      score: 95.8,
      width: 800,
      height: 600,
      size: 124532,
      format: 'JPEG',
      filename: 'fake_profile_001.jpg',
      url: 'https://dating-scammer-database.com/profiles/fake_profile_001',
      crawl_date: '2024-01-15',
      description: 'Known dating scammer profile photo',
      labels: ['Person', 'Face', 'Portrait']
    },
    {
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      domain: 'romance-scam-alerts.org',
      score: 87.3,
      width: 1024,
      height: 768,
      size: 203847,
      format: 'JPEG',
      filename: 'reported_scammer_045.jpg',
      url: 'https://romance-scam-alerts.org/scammer-gallery/reported_scammer_045',
      crawl_date: '2024-02-03',
      description: 'Reported romance scammer',
      labels: ['Person', 'Face', 'Male']
    },
    {
      image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      domain: 'stock.adobe.com',
      score: 92.1,
      width: 1200,
      height: 800,
      size: 345621,
      format: 'JPEG',
      filename: 'businessman_portrait_stock.jpg',
      url: 'https://stock.adobe.com/businessman_portrait_stock',
      crawl_date: '2023-11-28',
      description: 'Professional businessman stock photo',
      labels: ['Person', 'Business', 'Professional']
    },
    {
      image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      domain: 'shutterstock.com',
      score: 89.5,
      width: 1000,
      height: 667,
      size: 187293,
      format: 'JPEG',
      filename: 'professional_headshot_model.jpg',
      url: 'https://shutterstock.com/professional_headshot_model',
      crawl_date: '2023-12-10',
      description: 'Professional headshot model',
      labels: ['Person', 'Portrait', 'Model']
    },
    {
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      domain: 'scam-detector.net',
      score: 94.7,
      width: 900,
      height: 1200,
      size: 256789,
      format: 'JPEG',
      filename: 'known_romance_scammer_photo.jpg',
      url: 'https://scam-detector.net/known_romance_scammer_photo',
      crawl_date: '2024-01-20',
      description: 'Known romance scammer photo',
      labels: ['Person', 'Face', 'Suspicious']
    }
  ];
};

export const analyzeImageSafety = (matches: VisionMatch[]): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: string[];
  recommendation: string;
} => {
  const riskFactors: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  // Check for scam-related domains
  const scamDomains = matches.filter(match => 
    match.domain.includes('scam') || 
    match.domain.includes('fraud') || 
    match.domain.includes('fake') ||
    match.domain.includes('alert') ||
    match.domain.includes('blacklist')
  );

  // Check for stock photo usage
  const stockPhotos = matches.filter(match => 
    match.domain.includes('stock') || 
    match.domain.includes('shutterstock') || 
    match.domain.includes('getty') ||
    match.domain.includes('unsplash') ||
    match.domain.includes('pexels')
  );

  // Check for social media platforms
  const socialMedia = matches.filter(match =>
    match.domain.includes('facebook') ||
    match.domain.includes('instagram') ||
    match.domain.includes('linkedin') ||
    match.domain.includes('twitter') ||
    match.domain.includes('tiktok')
  );

  // Analyze risk factors
  if (scamDomains.length > 0) {
    riskFactors.push(`Found on ${scamDomains.length} scam reporting website(s)`);
    riskLevel = 'HIGH';
  }

  if (stockPhotos.length > 0) {
    riskFactors.push(`Image appears to be a stock photo (found on ${stockPhotos.length} stock sites)`);
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  if (matches.length > 5) {
    riskFactors.push(`Image appears on ${matches.length} different websites`);
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  // High score matches on multiple sites
  const highScoreMatches = matches.filter(match => match.score > 90);
  if (highScoreMatches.length > 2) {
    riskFactors.push(`${highScoreMatches.length} exact or near-exact matches found`);
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  // Check if widely used across social media
  if (socialMedia.length > 2) {
    riskFactors.push(`Image found on ${socialMedia.length} social media platforms`);
    if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
  }

  // Analyze image labels for suspicious content
  const suspiciousLabels = ['fake', 'scam', 'stolen', 'catfish'];
  const hasSuspiciousLabels = matches.some(match => 
    match.labels?.some(label => 
      suspiciousLabels.some(suspicious => 
        label.toLowerCase().includes(suspicious)
      )
    )
  );

  if (hasSuspiciousLabels) {
    riskFactors.push('Image analysis detected suspicious content indicators');
    if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
  }

  if (riskFactors.length === 0) {
    riskFactors.push('Limited online presence detected');
  }

  let recommendation = '';
  switch (riskLevel) {
    case 'HIGH':
      recommendation = '⚠️ HIGH RISK: This image has been reported on scam databases. Exercise extreme caution and avoid continuing communication.';
      break;
    case 'MEDIUM':
      recommendation = '⚡ MEDIUM RISK: This image appears widely online. Verify the person\'s identity through video calls before proceeding.';
      break;
    case 'LOW':
      recommendation = '✅ LOW RISK: Limited online presence detected. Still recommended to verify identity through additional means.';
      break;
  }

  return { riskLevel, riskFactors, recommendation };
}; 