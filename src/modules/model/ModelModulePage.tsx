import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { MultiStepForm } from './components/MultiStepForm';
import { AuthProvider } from '@/core/auth/AuthProvider';

export function ModelModulePage() {
  const { id } = useParams();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  // For app routes, wrap in AuthProvider
  if (isAppRoute) {
    return (
      <AuthProvider>
        <ModelModuleContent id={id} />
      </AuthProvider>
    );
  }

  // For public routes, render without auth
  return <ModelModuleContent id={id} />;
}

function ModelModuleContent({ id }: { id?: string }) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {!isAppRoute && !id && (
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
        readOnly={Boolean(id && !isAppRoute)} 
      />
    </div>
  );
} 