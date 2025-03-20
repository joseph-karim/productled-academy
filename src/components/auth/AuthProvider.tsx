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
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check Supabase connection first
        console.log('Attempting connection check...');
        const isConnected = await checkConnection();
        
        if (!isConnected) {
          if (retryCount < maxRetries) {
            console.log(`Connection failed, retrying (${retryCount + 1}/${maxRetries})...`);
            setRetryCount(prev => prev + 1);
            setTimeout(initAuth, 2000); // Retry after 2 seconds
            return;
          }
          throw new Error('Unable to connect to Supabase after multiple attempts. Please check your configuration.');
        }

        console.log('Connection successful, proceeding with auth initialization');
        setConnectionChecked(true);

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        console.log('Session retrieved:', !!session);
        setUser(session?.user ?? null);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Auth state changed:', !!session);
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Authentication failed'));
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [retryCount]);

  if (!connectionChecked && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD23F]" />
          <p className="text-gray-400">Connecting to service...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500">
              Retrying connection ({retryCount}/{maxRetries})...
            </p>
          )}
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