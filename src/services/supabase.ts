import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage
    }
  }
);

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error during Google sign-in:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
  analysis_results?: any;
}) {
  // Get current user if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  // Use actual user ID if authenticated, otherwise use anonymous ID
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  // Convert properties to match database column names
  const dbAnalysis: any = {
    user_id: userId,
    product_description: analysis.productDescription
  };

  if (analysis.idealUser) dbAnalysis.ideal_user = analysis.idealUser;
  if (analysis.outcomes) dbAnalysis.outcomes = analysis.outcomes;
  if (analysis.challenges) dbAnalysis.challenges = analysis.challenges;
  if (analysis.solutions) dbAnalysis.solutions = analysis.solutions;
  if (analysis.selectedModel) dbAnalysis.selected_model = analysis.selectedModel;
  if (analysis.features) dbAnalysis.features = analysis.features;
  if (analysis.userJourney) dbAnalysis.user_journey = analysis.userJourney;

  // Handle either naming convention for analysis results
  if (analysis.analysisResults) dbAnalysis.analysis_results = analysis.analysisResults;
  else if (analysis.analysis_results) dbAnalysis.analysis_results = analysis.analysis_results;

  const { data, error } = await supabase
    .from('analyses')
    .insert(dbAnalysis)
    .select()
    .single();

  if (error) throw error;
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
  analysis_results?: any;
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

  // Handle either naming convention for analysis results
  if (analysis.analysisResults) dbAnalysis.analysis_results = analysis.analysisResults;
  else if (analysis.analysis_results) dbAnalysis.analysis_results = analysis.analysis_results;

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