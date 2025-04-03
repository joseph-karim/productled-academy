import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getModuleData, saveModuleData } from '@/core/services/supabase';

// Define types for the data functions (using any for now, refine later if possible)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetModuleDataFunc = (moduleKey: string, options?: any) => Promise<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SaveModuleDataFunc = (moduleKey: string, data: any) => Promise<any>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  getModuleData: GetModuleDataFunc;
  saveModuleData: SaveModuleDataFunc;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Supabase auth event: ${event}`, session);
        setSession(session);
        setUser(session?.user ?? null);
        // No need to set loading false here, initial load handled above
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    // State updates handled by onAuthStateChange listener
  };

  const value = {
    session,
    user,
    isLoading,
    signOut,
    getModuleData,
    saveModuleData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 