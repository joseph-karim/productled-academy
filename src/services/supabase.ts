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

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage
    }
  }
);

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  if (error) throw error;
}

export async function checkConnection(): Promise<boolean> {
  try {
    // Get current session first
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, try to refresh it
    if (session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Session refresh failed:', refreshError);
        // Continue with health check even if refresh fails
      }
    }

    // Simple health check query
    const { error } = await supabase
      .from('analyses')
      .select('count')
      .limit(1)
      .single();
    
    // RLS policies might prevent reading any rows, which is fine
    // We only care about being able to connect to the database
    if (error?.code === 'PGRST116') {
      return true; // No rows found is okay
    }
    
    if (error?.code === 'PGRST301') {
      return true; // Row-level security prevented access, which is okay
    }
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

export async function shareAnalysis(id: string) {
  try {
    // First check if the analysis exists and is accessible
    const { data: analysis, error: checkError } = await supabase
      .from('analyses')
      .select('id, user_id, is_public')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error checking analysis:', checkError);
      throw new Error('Analysis not found');
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check ownership - allow both authenticated user's analyses and anonymous analyses
    if (!user && analysis.user_id !== '00000000-0000-0000-0000-000000000000') {
      throw new Error('You do not have permission to share this analysis');
    }
    
    if (user && analysis.user_id !== user.id && analysis.user_id !== '00000000-0000-0000-0000-000000000000') {
      throw new Error('You do not have permission to share this analysis');
    }

    // Update the analysis to be public
    const { data, error } = await supabase
      .from('analyses')
      .update({
        is_public: true
      })
      .eq('id', id)
      .select('share_id')
      .single();

    if (error) {
      console.error('Error sharing analysis:', error);
      throw error;
    }

    if (!data?.share_id) {
      throw new Error('Failed to generate share link');
    }

    return data.share_id;
  } catch (error) {
    console.error('Share analysis error:', error);
    throw error;
  }
}

export async function getSharedAnalysis(shareId: string) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single();

  if (error) {
    console.error('Error getting shared analysis:', error);
    throw error;
  }

  return data;
}

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

  const { data, error } = await supabase
    .from('analyses')
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
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
  const { data, error } = await supabase
    .from('analyses')
    .update({
      product_description: analysis.productDescription,
      ideal_user: analysis.idealUser,
      outcomes: analysis.outcomes,
      challenges: analysis.challenges,
      solutions: analysis.solutions,
      selected_model: analysis.selectedModel,
      features: analysis.features,
      user_journey: analysis.userJourney,
      analysis_results: analysis.analysisResults
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating analysis:', error);
    throw error;
  }
  return data;
}