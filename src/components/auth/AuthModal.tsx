import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { sendPasswordResetEmail, sendMagicLink } from '../../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'magic-link';

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp, error } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      switch (mode) {
        case 'signin':
          await signIn(email, password);
          onSuccess?.();
          onClose();
          break;
        case 'signup':
          await signUp(email, password);
          setSuccessMessage('Please check your email to verify your account.');
          break;
        case 'forgot-password':
          await sendPasswordResetEmail(email);
          setSuccessMessage('Password reset instructions have been sent to your email.');
          break;
        case 'magic-link':
          await sendMagicLink(email);
          setSuccessMessage('Magic link has been sent to your email.');
          break;
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'magic-link': return 'Magic Link Sign In';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2A2A2A] rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-[#333333]">
          <div className="flex items-center space-x-2">
            {mode !== 'signin' && (
              <button
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                  setSuccessMessage(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-white">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || localError) && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error || localError}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/20 border border-green-500 text-green-400 p-4 rounded">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {(mode === 'signin' || mode === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#1C1C1C] border border-[#333333] rounded-lg text-white focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'signin' ? 'Signing In...' : 
                 mode === 'signup' ? 'Creating Account...' :
                 mode === 'forgot-password' ? 'Sending Reset Link...' :
                 'Sending Magic Link...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Create Account' :
              mode === 'forgot-password' ? 'Send Reset Link' :
              'Send Magic Link'
            )}
          </button>

          {mode === 'signin' && (
            <div className="space-y-4">
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLocalError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80"
                >
                  Don't have an account? Sign up
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot-password');
                    setLocalError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('magic-link');
                    setLocalError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[#FFD23F] hover:text-[#FFD23F]/80"
                >
                  Sign in with magic link
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}