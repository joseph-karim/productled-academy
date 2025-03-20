import React, { useState } from 'react';
import { LogIn, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from './AuthModal';

export function AuthButton() {
  const { user, signOut, error } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Authentication error</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">{user.email}</span>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="flex items-center px-3 py-1 text-sm bg-[#2A2A2A] text-[#FFD23F] border border-[#FFD23F] rounded-lg hover:bg-[#FFD23F] hover:text-[#1C1C1C] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-1" />
          )}
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center px-3 py-1 text-sm bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90"
      >
        <LogIn className="w-4 h-4 mr-1" />
        Sign In
      </button>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}