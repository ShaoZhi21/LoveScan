-- Create reports table for storing user reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Reporter information
  reporter_id UUID REFERENCES profiles(id),
  reporter_ip INET,
  
  -- Reported profile information
  reported_name TEXT,
  reported_image_url TEXT,
  reported_social_media JSONB, -- Store social media URLs/handles
  
  -- Scan data
  scan_type TEXT NOT NULL, -- 'social_media', 'reverse_image', 'chat_analysis', etc.
  scan_data JSONB, -- Store the complete scan results
  risk_score INTEGER,
  risk_level TEXT, -- 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'
  
  -- Report details
  report_reason TEXT NOT NULL, -- Primary reason for reporting
  additional_reasons TEXT[], -- Array of additional reasons
  description TEXT, -- User's description of why they're reporting
  evidence_urls TEXT[], -- URLs to additional evidence
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'verified', 'false_positive', 'closed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT, -- Admin notes
  
  -- Metadata
  platform TEXT, -- 'mobile', 'web'
  app_version TEXT,
  metadata JSONB -- Additional flexible data
); 