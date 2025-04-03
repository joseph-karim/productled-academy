import React from 'react';
import { AppRouter } from '@/core/router/AppRouter';
import { AuthProvider } from '@/core/auth/AuthProvider'; // Assuming AuthProvider exists
import './index.css'; // Main CSS
import { ErrorBoundary } from 'react-error-boundary'; // Optional: Wrap everything

function AppFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
        <p className="text-gray-300 mb-4">Something went wrong. Please refresh the page.</p>
        <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded hover:bg-opacity-90"
        >
            Refresh
        </button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={AppFallback}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;