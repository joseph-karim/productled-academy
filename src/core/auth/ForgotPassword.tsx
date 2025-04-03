import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/core/services/supabase';
import { Loader2 } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C]">
      <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Reset Password
        </h2>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-400">
              Check your email for a password reset link.
            </p>
            <p className="text-gray-400 text-sm">
              If you don't see it, check your spam folder.
            </p>
            <Link
              to="/login"
              className="block mt-4 text-[#FFD23F] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>

            <p className="text-sm text-center">
              <Link 
                to="/login" 
                className="text-[#FFD23F] hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
} 