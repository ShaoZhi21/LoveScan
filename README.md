# DSTA LoveScan Mobile App

A React Native app built with Expo for detecting romance scams through AI-powered image analysis, chat scanning, and social media profile verification.

## 🏗️ Architecture

```
[Mobile App (Expo)] ↔ [Backend API (Node.js)] → [Google Vision API]
                   ↕
            [Supabase Database]
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Google Cloud Account** (for Vision API)
- **Supabase Account** (for database)

## 📱 Frontend Setup (Expo React Native)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd dsta-lovescan-mobile

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Backend API Configuration
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

### 3. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 4. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create reports table for storing user reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Reporter information
  reporter_id UUID REFERENCES auth.users(id),
  reporter_ip INET,
  
  -- Reported profile information
  reported_name TEXT,
  reported_image_url TEXT,
  reported_social_media JSONB,
  
  -- Scan data
  scan_type TEXT NOT NULL,
  scan_data JSONB,
  risk_score INTEGER,
  risk_level TEXT,
  
  -- Report details
  report_reason TEXT NOT NULL,
  additional_reasons TEXT[],
  description TEXT,
  evidence_urls TEXT[],
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'verified', 'false_positive', 'closed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Metadata
  platform TEXT,
  app_version TEXT,
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);
```

### 5. Start the Frontend

```bash
# Start Expo development server
npx expo start

# Or start with specific platform
npx expo start --android    # For Android
npx expo start --ios        # For iOS
npx expo start --web        # For Web

# Clear cache if needed
npx expo start --clear
```

## 🖥️ Backend Setup (Node.js API)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Backend Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Google Vision API
GOOGLE_VISION_API_KEY=your-google-vision-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (add your frontend URLs)
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
```

### 4. Get Google Vision API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. **Enable the Vision API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Vision API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key → `GOOGLE_VISION_API_KEY`
5. **Restrict API Key** (Recommended):
   - Click on your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Save

### 5. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:3000`

## 🔑 Complete API Keys Checklist

### Required API Keys:

- [ ] **Google Vision API Key** - For image analysis and reverse image search
- [ ] **Supabase URL** - For database connection
- [ ] **Supabase Anon Key** - For database authentication

### Optional Configurations:

- [ ] **Backend URL** - Points to your backend API (default: localhost:3000)
- [ ] **CORS Origins** - Allowed frontend URLs for backend access

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "DSTA LoveScan Backend is running"
}
```

### 2. Test Frontend Connection

1. Start both backend and frontend
2. Open the app in Expo
3. Try uploading an image for scanning
4. Check that the analysis works

## 📱 Features

- **📸 Profile Image Analysis**: Upload photos to check if they're used elsewhere online
- **💬 Chat Scanning**: Analyze conversations for scam patterns and red flags
- **📱 Social Media Verification**: Check social media profiles for authenticity
- **⚡ Risk Assessment**: AI-powered risk evaluation with detailed recommendations
- **📊 Scam Reporting**: Report and track scam attempts with evidence submission
- **🏛️ Database Integration**: Secure report storage and retrieval

## 🛡️ Security Features

- ✅ **Secure API Key Management** - Keys stored server-side only
- ✅ **Real-time Image Analysis** - Google Vision AI integration
- ✅ **Privacy-focused Design** - No personal data stored unnecessarily
- ✅ **CORS Protection** - Configurable allowed origins
- ✅ **Request Validation** - Input sanitization and validation
- ✅ **Row Level Security** - Database access control

## 📁 Project Structure

```
dsta-lovescan-mobile/
├── src/                          # Frontend source code
│   ├── components/ui/           # Reusable UI components
│   ├── config/                  # Configuration and environment
│   ├── lib/                     # API services and utilities
│   ├── navigation/              # Navigation configuration
│   ├── screens/                 # App screens and pages
│   └── types/                   # TypeScript type definitions
├── backend/                      # Backend API server
│   ├── server.js               # Main server file
│   ├── package.json            # Backend dependencies
│   └── .env                    # Backend environment variables
├── assets/                       # App assets (images, fonts)
├── .env                         # Frontend environment variables
├── app.config.js               # Expo configuration
└── package.json                # Frontend dependencies
```

## 🔧 Tech Stack

### Frontend:
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Supabase Client** for database
- **Expo Image Picker** for camera functionality
- **Axios** for API requests

### Backend:
- **Node.js** with Express.js
- **Google Vision API** for image analysis
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging

### Database:
- **Supabase** (PostgreSQL) for data storage
- **Row Level Security** for access control

## 🚀 Development Scripts

### Frontend:
```bash
npm start                    # Start Expo dev server
npm run android             # Start Android development
npm run ios                 # Start iOS development
npm run web                 # Start web development
```

### Backend:
```bash
npm start                   # Start production server
npm run dev                 # Start development server with auto-reload
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid URL" errors**: Check your `.env` file format, ensure no extra spaces
2. **API connection failed**: Verify backend is running on correct port
3. **Vision API errors**: Check API key is valid and Vision API is enabled
4. **Supabase connection issues**: Verify URL and anon key are correct
5. **Metro bundler issues**: Try `npx expo start --clear` to clear cache

### Debug Mode:

Enable debug logging by setting:
```bash
# Frontend .env
EXPO_PUBLIC_DEBUG_MODE=true

# Backend .env
NODE_ENV=development
```

## 📄 License

DSTA LoveScan - Romance Scam Detection Application

---

## 💡 Need Help?

- Check the troubleshooting section above
- Verify all environment variables are set correctly
- Ensure both frontend and backend servers are running
- Check console logs for detailed error messages 