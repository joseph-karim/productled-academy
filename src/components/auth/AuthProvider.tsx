import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkConnection } from '../../services/supabase';
import type { User } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        // Check Supabase connection
        const isConnected = await checkConnection();
        
        if (!isConnected) {
          if (retryCount < maxRetries) {
            console.log(`Connection failed, retrying (${retryCount + 1}/${maxRetries})...`);
            if (mounted) {
              setRetryCount(prev => prev + 1);
              retryTimeout = setTimeout(initAuth, retryDelay);
            }
            return;
          }
          throw new Error('Unable to connect to Supabase after multiple attempts');
        }

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (mounted) {
          setUser(session?.user ?? null);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });

        if (mounted) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Authentication failed'));
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryCount]);

  if (loading && retryCount > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Connecting to service...</p>
          <p className="text-sm text-gray-500">
            Retrying connection ({retryCount}/{maxRetries})...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-[#2A2A2A] rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <h2 className="text-xl font-bold text-white">Connection Error</h2>
          <p className="text-gray-400">{error.message}</p>
          <p className="text-sm text-gray-500">
            Please check your Supabase configuration and ensure the service is accessible.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}