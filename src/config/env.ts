// Environment configuration for DSTA LoveScan
// Now uses secure backend API instead of direct Google Vision calls

export const CONFIG = {
  // Backend API configuration
  BACKEND_URL: __DEV__ ? 'http://localhost:3000' : 'https://your-production-backend.com',
  
  // API endpoints
  VISION_ANALYZE_ENDPOINT: '/api/vision/analyze',
  HEALTH_CHECK_ENDPOINT: '/health',
}; 