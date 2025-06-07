import { supabase } from './supabase';
import { ReportSubmissionData, ReportData } from '../types/report';

export class ReportService {
  static async submitReport(reportData: ReportSubmissionData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if Supabase is properly configured
      if (!supabase || !supabase.auth) {
        console.error('Supabase client not properly initialized');
        return { success: false, error: 'Database connection not configured. Please check your environment variables.' };
      }

      // Get current user if available (allow anonymous reports)
      let user = null;
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!authError) {
          user = authUser;
        } else {
          console.log('No authenticated user - submitting anonymous report');
        }
      } catch (authError) {
        console.log('Auth check failed - submitting anonymous report:', authError);
      }
      
      // Prepare the report data for insertion
      const insertData: Partial<ReportData> = {
        // Reporter info
        reporter_id: user?.id,
        
        // Reported profile info
        reported_name: reportData.reported_name,
        reported_image_url: reportData.reported_image_url,
        reported_social_media: reportData.reported_social_media,
        
        // Scan data
        scan_type: reportData.scan_type,
        scan_data: reportData.scan_data,
        risk_score: reportData.risk_score,
        risk_level: reportData.risk_level,
        
        // Report details
        report_reason: reportData.report_reason,
        additional_reasons: reportData.additional_reasons,
        description: reportData.description,
        evidence_urls: reportData.evidence_urls,
        
        // Metadata
        platform: 'mobile',
        app_version: '1.0.0', // TODO: Get from app config
        metadata: {
          submitted_at: new Date().toISOString(),
          user_agent: 'LoveScan Mobile App',
        }
      };

      const { data, error } = await supabase
        .from('reports')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting report:', error);
        return { success: false, error: error.message };
      }

      console.log('Report submitted successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('Unexpected error submitting report:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return { success: false, error: 'Network connection failed. Please check your internet connection and Supabase configuration.' };
      }
      
      return { success: false, error: `Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing Supabase connection...');
      
      // Simple health check - try to query the auth status
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error: `Connection test failed: ${error.message}` };
      }
      
      console.log('Supabase connection test successful');
      return { success: true };
    } catch (error) {
      console.error('Supabase connection test error:', error);
      return { success: false, error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async getReportsByUser(userId: string): Promise<{ reports: ReportData[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user reports:', error);
        return { reports: [], error: error.message };
      }

      return { reports: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching reports:', error);
      return { reports: [], error: 'An unexpected error occurred' };
    }
  }

  static async getReportStats(): Promise<{ 
    totalReports: number; 
    pendingReports: number; 
    verifiedReports: number; 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('status')
        .not('status', 'is', null);

      if (error) {
        console.error('Error fetching report stats:', error);
        return { totalReports: 0, pendingReports: 0, verifiedReports: 0, error: error.message };
      }

      const stats = data.reduce((acc, report) => {
        acc.totalReports++;
        if (report.status === 'pending') acc.pendingReports++;
        if (report.status === 'verified') acc.verifiedReports++;
        return acc;
      }, { totalReports: 0, pendingReports: 0, verifiedReports: 0 });

      return stats;
    } catch (error) {
      console.error('Unexpected error fetching report stats:', error);
      return { totalReports: 0, pendingReports: 0, verifiedReports: 0, error: 'An unexpected error occurred' };
    }
  }
} 