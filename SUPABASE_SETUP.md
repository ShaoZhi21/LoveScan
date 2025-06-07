# Supabase Configuration Setup

## Issues Fixed:
1. ✅ Added missing `splash.png` image
2. ✅ Created `app.config.js` for proper environment variable handling
3. ✅ Updated Supabase client with better error handling

## Required Setup:

### 1. Create Environment File
Create a `.env` file in your project root with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Get Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

### 3. Update Your .env File
Replace the placeholders with your actual values:
- `https://your-project-id.supabase.co` → Your actual Supabase URL
- `your-anon-key-here` → Your actual Supabase anon key

### 4. Create the Reports Table
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

### 5. Restart Your Development Server
After creating the `.env` file, restart your Expo development server:

```bash
npx expo start
```

## Security Notes:
- Never commit your `.env` file to version control
- The `.env` file should be added to your `.gitignore`
- Use `EXPO_PUBLIC_` prefix for environment variables that need to be available in the client

## Troubleshooting:
- If you still see "Invalid URL" errors, double-check your `.env` file format
- Make sure there are no extra spaces or quotes around the values
- Ensure your Supabase project is active and accessible 