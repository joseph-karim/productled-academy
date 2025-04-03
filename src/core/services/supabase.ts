import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(
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

export async function getModuleData(moduleKey: string): Promise<any | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('getModuleData called without logged-in user');
    return null;
  }

  const { data, error } = await supabase
    .from('user_module_data')
    .select('data')
    .eq('user_id', user.id)
    .eq('module_key', moduleKey)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching data for module ${moduleKey}:`, error);
    throw error;
  }

  return data ? data.data : null;
}

export async function saveModuleData(moduleKey: string, dataToSave: any): Promise<any | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Cannot save module data: user not logged in.');
  }

  const recordToUpsert = {
    user_id: user.id,
    module_key: moduleKey,
    data: dataToSave,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_module_data')
    .upsert(recordToUpsert)
    .select()
    .single();

  if (error) {
    console.error(`Error saving data for module ${moduleKey}:`, error);
    throw error;
  }
  console.log(`Saved data for module: ${moduleKey}`);
  return data;
}

// --- OLD/REMOVED Analysis Functions ---
// All old functions related to the 'analyses' table should be removed here.

// --- Potentially Keep/Refactor User Profile Functions ---
/*
export async function getUserProfile() { ... }
*/

// Remove debug function if not needed
// export async function debugSharedAnalysis(shareId: string) { ... }