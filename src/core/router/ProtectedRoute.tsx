import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react'; // For loading state

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Destructure session and isLoading (user is implicitly included in session)
  const { session, isLoading } = useAuth(); 
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while checking auth state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-10 h-10 text-[#FFD23F] animate-spin" />
      </div>
    );
  }

  // If there's no active session, redirect to login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is logged in (session exists), render the requested component
  return <>{children}</>;
} 