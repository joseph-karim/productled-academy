import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-[#FFD23F] mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-8">Oops! Page not found.</p>
      <Link 
        to="/app" 
        className="px-6 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg font-medium hover:bg-opacity-90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
} 