import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { MultiStepForm } from './components/MultiStepForm';
import { AuthProvider } from '@/core/auth/AuthProvider';

export function OfferModulePage() {
  const { id } = useParams();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  // For app routes, wrap in AuthProvider
  if (isAppRoute) {
    return (
      <AuthProvider>
        <OfferModuleContent id={id} />
      </AuthProvider>
    );
  }

  // For public routes, render without auth
  return <OfferModuleContent id={id} />;
}

function OfferModuleContent({ id }: { id?: string }) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {!isAppRoute && !id && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Irresistible Offer Builder
          </h1>
          <p className="text-gray-300">
            Create an offer that converts users and drives growth through the ProductLed System.
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