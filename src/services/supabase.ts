import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { useFormStore } from '../store/formStore';
import { usePackageStore } from '../store/packageStore';

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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Session refresh failed:', refreshError);
      }
    }

    const { error } = await supabase
      .from('analyses')
      .select('count')
      .limit(1)
      .single();
    
    if (error?.code === 'PGRST116') {
      return true;
    }
    
    if (error?.code === 'PGRST301') {
      return true;
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
    const { data: analysis, error: checkError } = await supabase
      .from('analyses')
      .select('id, user_id, is_public, share_id')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Error checking analysis:', checkError);
      throw new Error('Analysis not found');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user && analysis.user_id !== '00000000-0000-0000-0000-000000000000') {
      throw new Error('You do not have permission to share this analysis');
    }
    
    if (user && analysis.user_id !== user.id && analysis.user_id !== '00000000-0000-0000-0000-000000000000') {
      throw new Error('You do not have permission to share this analysis');
    }

    if (!analysis.is_public) {
      const { error: updateError } = await supabase
        .from('analyses')
        .update({ is_public: true })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating analysis:', updateError);
        throw updateError;
      }
    }

    return analysis.share_id;
  } catch (error) {
    console.error('Share analysis error:', error);
    throw error;
  }
}

export async function getSharedAnalysis(shareId: string) {
  console.log('Getting shared analysis with ID:', shareId);
  
  // First, check if the analysis exists
  const { data: checkData, error: checkError } = await supabase
    .from('analyses')
    .select('id, is_public, share_id')
    .eq('share_id', shareId)
    .maybeSingle();
    
  console.log('Analysis check result:', { 
    exists: !!checkData, 
    isPublic: checkData?.is_public,
    error: checkError
  });
  
  if (checkError) {
    console.error('Error checking analysis:', checkError);
    throw checkError;
  }
  
  if (!checkData) {
    console.error('No analysis found with this share ID');
    throw new Error('Analysis not found');
  }
  
  if (!checkData.is_public) {
    console.error('Analysis exists but is not public');
    throw new Error('This analysis is not available for viewing');
  }
  
  // Get full analysis data
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single();

  if (error) {
    console.error('Error fetching shared analysis data:', error);
    throw error;
  }
  
  console.log('Shared analysis data loaded successfully', {
    hasData: !!data,
    hasProductDesc: !!data?.product_description,
    hasResults: !!data?.analysis_results,
    hasPricingStrategy: !!data?.pricing_strategy,
    hasFeatures: Array.isArray(data?.features) && data.features.length > 0
  });

  return data;
}

export async function debugSharedAnalysis(shareId: string) {
  console.log('Debugging shared analysis with ID:', shareId);
  
  // Check if analysis exists without filters
  const { data: allAnalyses } = await supabase
    .from('analyses')
    .select('id, share_id, is_public, user_id, created_at')
    .eq('share_id', shareId);
    
  console.log('All analyses with this share_id:', allAnalyses);
  
  // Check with is_public filter
  const { data: publicAnalyses } = await supabase
    .from('analyses')
    .select('id, share_id, is_public, user_id')
    .eq('share_id', shareId)
    .eq('is_public', true);
    
  console.log('Public analyses with this share_id:', publicAnalyses);
  
  // Check current user
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user?.id || 'Not authenticated');
  
  // Check RLS policies
  const { data: rlsPolicies } = await supabase
    .rpc('check_rls_policies', { table_name: 'analyses' });
    
  console.log('RLS policies:', rlsPolicies);
  
  return {
    allAnalyses,
    publicAnalyses,
    userId: user?.id || null
  };
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

export async function loadAnalysis(id: string) {
  try {
    const analysis = await getAnalysis(id);
    
    // Update form store with loaded data
    const formStore = useFormStore.getState();
    const packageStore = usePackageStore.getState();
    
    formStore.setTitle(analysis.title || 'Untitled Analysis');
    formStore.setProductDescription(analysis.product_description || '');
    if (analysis.ideal_user) formStore.setIdealUser(analysis.ideal_user);
    if (analysis.outcomes) {
      analysis.outcomes.forEach((outcome: any) => {
        formStore.updateOutcome(outcome.level, outcome.text);
      });
    }
    if (analysis.challenges) {
      analysis.challenges.forEach((challenge: any) => {
        formStore.addChallenge(challenge);
      });
    }
    if (analysis.solutions) {
      analysis.solutions.forEach((solution: any) => {
        formStore.addSolution(solution);
      });
    }
    if (analysis.selected_model) formStore.setSelectedModel(analysis.selected_model);
    if (analysis.features) {
      packageStore.reset(); // Clear existing features
      analysis.features.forEach((feature: any) => {
        packageStore.addFeature(feature);
      });
    }
    if (analysis.user_journey) formStore.setUserJourney(analysis.user_journey);
    if (analysis.analysis_results) formStore.setAnalysis(analysis.analysis_results);
    if (analysis.pricing_strategy) packageStore.setPricingStrategy(analysis.pricing_strategy);
    
  } catch (error) {
    console.error('Error loading analysis:', error);
    throw error;
  }
}

export async function createAnalysis(title?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      share_id: crypto.randomUUID(),
      title: title || 'Untitled Analysis',
      product_description: '',
      ideal_user: null,
      outcomes: [],
      challenges: [],
      solutions: [],
      selected_model: null,
      features: [],
      user_journey: null,
      analysis_results: null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating analysis:', error);
    throw error;
  }
  return data;
}

export async function saveAnalysis(analysis: {
  title?: string;
  productDescription: string;
  idealUser?: any;
  outcomes?: any;
  challenges?: any;
  solutions?: any;
  selectedModel?: string;
  features?: any;
  userJourney?: any;
  analysisResults?: any;
  pricingStrategy?: any;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      title: analysis.title || 'Untitled Analysis',
      product_description: analysis.productDescription,
      ideal_user: analysis.idealUser,
      outcomes: analysis.outcomes,
      challenges: analysis.challenges,
      solutions: analysis.solutions,
      selected_model: analysis.selectedModel,
      features: analysis.features,
      user_journey: analysis.userJourney,
      analysis_results: analysis.analysisResults,
      pricing_strategy: analysis.pricingStrategy,
      share_id: crypto.randomUUID()
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
  title?: string;
  productDescription?: string;
  idealUser?: any;
  outcomes?: any;
  challenges?: any;
  solutions?: any;
  selectedModel?: string;
  features?: any;
  userJourney?: any;
  analysisResults?: any;
  pricingStrategy?: any;
}) {
  const { data, error } = await supabase
    .from('analyses')
    .update({
      title: analysis.title,
      product_description: analysis.productDescription,
      ideal_user: analysis.idealUser,
      outcomes: analysis.outcomes,
      challenges: analysis.challenges,
      solutions: analysis.solutions,
      selected_model: analysis.selectedModel,
      features: analysis.features,
      user_journey: analysis.userJourney,
      analysis_results: analysis.analysisResults,
      pricing_strategy: analysis.pricingStrategy
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

export async function deleteAnalysis(id: string) {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}