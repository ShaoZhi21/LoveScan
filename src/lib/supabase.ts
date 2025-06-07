import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://your-project.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'your-anon-key';

// Validate configuration
if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseUrl.includes('your-project')) {
  console.warn('⚠️ Supabase URL not configured. Please set up your environment variables.');
}

if (supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY') || supabaseAnonKey.includes('your-anon-key')) {
  console.warn('⚠️ Supabase ANON KEY not configured. Please set up your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 