import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing required Supabase environment variables');
}

// Get the current site URL for redirects
const siteUrl = window.location.origin;

// Initialize Supabase client with additional options
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      flowType: 'pkce',
      // Set site URL for auth redirects
      redirectTo: `${siteUrl}/auth/callback`,
      // Global redirect options
      defaultOptions: {
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    }
  }
);

// Function to check Supabase connection
export async function checkConnection(): Promise<boolean> {
  try {
    console.log('Checking Supabase connection...');
    
    // Try a simple query first
    const { data, error } = await supabase
      .from('analyses')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST301') {
        console.log('Database empty but connection successful');
        return true;
      }
      console.error('Database connection error:', error);
      return false;
    }

    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

// Authentication functions
export async function signInWithGoogle() {
  try {
    console.log('Starting Google sign in...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        redirectTo: `${siteUrl}/auth/callback`
      }
    });

    if (error) {
      console.error('Google sign in error:', error);
      throw error;
    }

    console.log('Google sign in initiated:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error during Google sign in:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  try {
    console.log('Starting sign up...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    console.log('Sign up successful:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error during sign up:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('Starting sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('Successfully signed out');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
}

// Password reset and magic link functions
export async function sendPasswordResetEmail(email: string) {
  try {
    console.log('Sending password reset email to:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`
    });

    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }

    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function sendMagicLink(email: string) {
  try {
    console.log('Sending magic link to:', email);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?type=magiclink`
      }
    });

    if (error) {
      console.error('Magic link error:', error);
      throw error;
    }

    console.log('Magic link sent successfully');
  } catch (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }
}

// Analysis functions
export async function saveAnalysis(analysis: {
  productDescription: string;
  idealUser?: any;
  outcomes?: any;
  challenges?: any;
  solutions?: any;
  selectedModel?: string;
  features?: any;
  userJourney?: any;
  analysisResults?: any;
}) {
  // Get current user if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  // Use actual user ID if authenticated, otherwise use anonymous ID
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  // Convert properties to match database column names
  const dbAnalysis = {
    user_id: userId,
    product_description: analysis.productDescription,
    ideal_user: analysis.idealUser,
    outcomes: analysis.outcomes,
    challenges: analysis.challenges,
    solutions: analysis.solutions,
    selected_model: analysis.selectedModel,
    features: analysis.features,
    user_journey: analysis.userJourney,
    analysis_results: analysis.analysisResults
  };

  const { data, error } = await supabase
    .from('analyses')
    .insert(dbAnalysis)
    .select()
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
  return data;
}

export async function getAnalyses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAnalysis(id: string) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSharedAnalysis(shareId: string) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAnalysis(id: string, analysis: {
  productDescription?: string;
  idealUser?: any;
  outcomes?: any;
  challenges?: any;
  solutions?: any;
  selectedModel?: string;
  features?: any;
  userJourney?: any;
  analysisResults?: any;
}) {
  // Convert properties to match database column names
  const dbAnalysis: any = {};

  if (analysis.productDescription) dbAnalysis.product_description = analysis.productDescription;
  if (analysis.idealUser) dbAnalysis.ideal_user = analysis.idealUser;
  if (analysis.outcomes) dbAnalysis.outcomes = analysis.outcomes;
  if (analysis.challenges) dbAnalysis.challenges = analysis.challenges;
  if (analysis.solutions) dbAnalysis.solutions = analysis.solutions;
  if (analysis.selectedModel) dbAnalysis.selected_model = analysis.selectedModel;
  if (analysis.features) dbAnalysis.features = analysis.features;
  if (analysis.userJourney) dbAnalysis.user_journey = analysis.userJourney;
  if (analysis.analysisResults) dbAnalysis.analysis_results = analysis.analysisResults;

  const { data, error } = await supabase
    .from('analyses')
    .update(dbAnalysis)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function shareAnalysis(id: string) {
  const { data, error } = await supabase
    .from('analyses')
    .update({
      is_public: true
    })
    .eq('id', id)
    .select('share_id')
    .single();

  if (error) throw error;
  return data.share_id;
}

export async function unshareAnalysis(id: string) {
  const { error } = await supabase
    .from('analyses')
    .update({
      is_public: false
    })
    .eq('id', id);

  if (error) throw error;
}