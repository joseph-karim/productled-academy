import React, { useState } from 'react';
import { supabase } from '@/core/services/supabase'; // Assuming supabase client is exported
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app"; // Redirect destination after login

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        setError('Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
        onLoginSuccess?.();
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Auth error:", err);
      const message = (err instanceof Error) ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setIsSignUp(false)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            !isSignUp 
              ? 'bg-[#FFD23F] text-[#1C1C1C]' 
              : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isSignUp 
              ? 'bg-[#FFD23F] text-[#1C1C1C]' 
              : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <p className={`text-sm text-center ${
            error.toLowerCase().includes('check your email')
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {error}
          </p>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-[#2A2A2A] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent outline-none"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-[#2A2A2A] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Log In'
          )}
        </button>

        {!isSignUp && (
          <p className="text-sm text-center">
            <Link 
              to="/forgot-password" 
              className="text-[#FFD23F] hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        )}
      </form>
    </div>
  );
} 