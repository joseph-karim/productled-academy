import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthProvider';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, signOut, isLoading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1c1c1c] border-b border-[#333333] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / App Name */}
        <Link to="/app" className="text-xl font-bold text-[#FFD23F]">
          ProductLed Academy
        </Link>

        {/* User Menu / Auth Actions */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative flex items-center space-x-2">
              <span className="text-sm text-gray-300 hidden sm:block">{user.email}</span>
              <button
                onClick={signOut}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-medium text-gray-300 hover:text-[#FFD23F]"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 