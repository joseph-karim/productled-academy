import React, { useState } from 'react';
import { supabase } from '@/core/services/supabase'; // Assuming supabase client is exported
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SignupProps {
  onSignupSuccess?: () => void;
}

export function Signup({ onSignupSuccess }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Add options like emailRedirectTo if needed for confirmation
        options: {
           emailRedirectTo: `${window.location.origin}/app`, // Redirect to dashboard after confirmation
        },
      });

      if (error) throw error;
      
      // Call success handler regardless of confirmation status
      onSignupSuccess?.();

      // Show messages based on confirmation status
      if (data.user && data.user.identities?.length === 0) {
           setMessage("Signup successful, but email confirmation might be required (check Supabase settings).");
      } else if (data.session) {
        setMessage("Signup successful! Redirecting...");
        // setTimeout(() => navigate('/app'), 1500); // AuthProvider state change should handle redirect via ProtectedRoute
      } else {
         setMessage("Signup successful! Please check your email to confirm your account.");
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || 'Could not sign up user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {message && <p className="text-green-400 text-sm text-center">{message}</p>}
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
          Password (min. 6 characters)
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
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
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
      </button>
      <p className="text-sm text-center text-gray-400">
        Already have an account?
        <Link to="/login" className="font-medium text-[#FFD23F] hover:underline ml-1">
          Log In
        </Link>
      </p>
    </form>
  );
} 