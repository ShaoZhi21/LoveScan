import { supabase } from './supabase';

export class AuthService {
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        // If it's a network error, still try to use cached session
        if (error.message.includes('fetch')) {
          console.warn('Network error getting session, using cached session');
          return session; // Return whatever we got, might be cached
        }
        throw error;
      }
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  static async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? {
          data: {
            full_name: fullName,
          }
        } : undefined
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
} 