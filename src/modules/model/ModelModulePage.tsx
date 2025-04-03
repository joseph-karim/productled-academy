import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MultiStepForm } from './components/MultiStepForm';
import { useAuth } from '@/core/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

export function ModelModulePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  // If we're on an /app route but have no ID, redirect to dashboard
  if (isAppRoute && !id && user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {!user && !id && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Free Model Analyzer
          </h1>
          <p className="text-gray-300">
            Analyze your product's business model and get actionable insights. 
            <span className="text-[#FFD23F]">
              {' '}Create an account to save and share your results.
            </span>
          </p>
        </div>
      )}
      
      <MultiStepForm 
        analysisId={id} 
        readOnly={Boolean(id && !user)} 
      />
    </div>
  );
} 