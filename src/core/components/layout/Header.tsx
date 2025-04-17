import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthProvider';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, signOut, isLoading } = useAuth();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#1c1c1c] border-b border-[#333333] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / App Name */}
        <Link to="/" className="text-xl font-bold text-[#FFD23F] hover:text-opacity-90 transition-colors">
          ProductLed Academy
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/tools" className="text-gray-300 hover:text-[#FFD23F] transition-colors">
            Academy Tools
          </Link>
          {isAppRoute && (
            <>
              <Link to="/app/dashboard" className="text-gray-300 hover:text-[#FFD23F] transition-colors">
                Dashboard
              </Link>
              <Link to="/app/tools" className="text-gray-300 hover:text-[#FFD23F] transition-colors">
                All Tools
              </Link>
            </>
          )}
        </div>

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
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-[#FFD23F] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}