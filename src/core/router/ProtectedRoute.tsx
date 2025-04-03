import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { Loader2 } from 'lucide-react'; // For loading state

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while checking auth state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-10 h-10 text-[#FFD23F] animate-spin" />
      </div>
    );
  }

  if (!user && !session) {
    // User not logged in, redirect to login page
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in, render the requested component
  return <>{children}</>;
} 