export interface ReportData {
  id?: string;
  created_at?: string;
  
  // Reporter information
  reporter_id?: string;
  reporter_ip?: string;
  
  // Reported profile information
  reported_name?: string;
  reported_image_url?: string;
  reported_social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    other?: Record<string, string>;
  };
  
  // Scan data
  scan_type: 'social_media' | 'reverse_image' | 'chat_analysis' | 'manual';
  scan_data?: any; // The complete scan results object
  risk_score?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  
  // Report details
  report_reason: string;
  additional_reasons?: string[];
  description?: string;
  evidence_urls?: string[];
  
  // Status tracking
  status?: 'pending' | 'reviewed' | 'verified' | 'false_positive' | 'closed';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  
  // Metadata
  platform?: 'mobile' | 'web';
  app_version?: string;
  metadata?: Record<string, any>;
}

export interface ReportSubmissionData {
  reported_name?: string;
  reported_image_url?: string;
  reported_social_media?: ReportData['reported_social_media'];
  scan_type: ReportData['scan_type'];
  scan_data?: any;
  risk_score?: number;
  risk_level?: ReportData['risk_level'];
  report_reason: string;
  additional_reasons?: string[];
  description?: string;
  evidence_urls?: string[];
}

export const REPORT_REASONS = [
  'Money Request',
  'Emergency Story',
  'Stolen Photos',
  'Fake Identity',
  'Too Fast Romance',
  'Avoids Video Calls',
  'Grammar Issues',
  'Investment Scam',
  'Gift Card Request',
  'Unverified Profile',
  'Limited Photos',
  'Other Romance Scam'
] as const;

export type ReportReason = typeof REPORT_REASONS[number]; 