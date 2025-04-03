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
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app"; // Redirect destination after login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Call the success handler if provided
      onLoginSuccess?.(); 
      
      navigate(from, { replace: true }); // Redirect to intended destination
    } catch (err) { // Catch specific Supabase errors if needed
      console.error("Login error:", err);
      // Check if err is an instance of AuthError or has a message property
      const message = (err instanceof Error) ? err.message : 'Invalid login credentials';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
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
        {/* Add forgot password link here later */}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
      </button>
      <p className="text-sm text-center text-gray-400">
        Don't have an account?
        <Link to="/signup" className="font-medium text-[#FFD23F] hover:underline ml-1">
          Sign Up
        </Link>
      </p>
    </form>
  );
} 