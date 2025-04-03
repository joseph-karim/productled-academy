import React, { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void; // Called after successful login/signup
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>('login');

  // Simple handler for now, just closes modal on success
  // More complex logic could pass user data up
  const handleAuthSuccess = () => {
      onSuccess(); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-xl w-full max-w-md relative border border-[#333333]">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-white text-center mb-6">
          {view === 'login' ? 'Log In to Save' : 'Sign Up to Save'}
        </h2>

        {view === 'login' ? (
          <Login onLoginSuccess={handleAuthSuccess} /> // Assumes Login calls onLoginSuccess
        ) : (
          <Signup onSignupSuccess={handleAuthSuccess} /> // Assumes Signup calls onSignupSuccess
        )}

        <div className="mt-4 text-center">
          {view === 'login' ? (
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => setView('signup')} className="font-medium text-[#FFD23F] hover:underline">
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="font-medium text-[#FFD23F] hover:underline">
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// We need to update Login and Signup to accept and call the onSuccess props
// Example modification for Login.tsx:
/*
interface LoginProps {
  onLoginSuccess?: () => void;
}
export function Login({ onLoginSuccess }: LoginProps) {
  // ... existing code ...
  const handleLogin = async (e: React.FormEvent) => {
    // ... existing try block ...
      if (error) throw error;
      // Call the success handler if provided
      onLoginSuccess?.(); 
      navigate(from, { replace: true });
    // ... existing catch/finally ...
  };
  // ... rest of component ...
}
*/ 