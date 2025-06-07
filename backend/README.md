# DSTA LoveScan Backend API

Secure Node.js/Express backend for the DSTA LoveScan mobile app that handles Google Vision API calls.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Google Vision API key

# Start development server
npm run dev

# Start production server
npm start
```

## 🔑 Environment Variables

Create a `.env` file with:

```bash
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
PORT=3000
NODE_ENV=development
```

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Image Analysis
```
POST /api/vision/analyze
Content-Type: application/json

{
  "imageBase64": "base64_encoded_image_string"
}
```

Returns Google Vision API analysis including:
- Web detection (similar images found online)
- Label detection (objects/content identified)
- Safe search detection

## 🛡️ Security Features

- ✅ **API key server-side only** - Never exposed to client
- ✅ **CORS protection** - Configurable allowed origins
- ✅ **Helmet security headers** - Protection against common attacks
- ✅ **Request logging** - Morgan middleware for monitoring
- ✅ **Input validation** - Validates image data before processing
- ✅ **Error handling** - Comprehensive error responses
- ✅ **Request size limits** - Prevents abuse

## 🏗️ Architecture

```
[Mobile App] → [Backend API] → [Google Vision API]
```

The backend acts as a secure proxy, keeping API credentials server-side while providing a clean interface for the mobile app.

## 📝 Logs

The server logs all requests and API calls for monitoring and debugging.

## 🚀 Deployment

For production deployment:

1. Set environment variables in your hosting platform
2. Update CORS settings for your domain
3. Set `NODE_ENV=production`
4. Use a process manager like PM2 