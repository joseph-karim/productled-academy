import React from 'react';
import { AppRouter } from '@/core/router/AppRouter';
import './index.css'; // Main CSS
import { ErrorBoundary } from 'react-error-boundary'; // Optional: Wrap everything

function App() {
  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] text-white">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-400">Please refresh the page to try again</p>
          </div>
        </div>
      }
    >
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;