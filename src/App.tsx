import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MultiStepForm } from './components/MultiStepForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthButton } from './components/auth/AuthButton';
import { AuthProvider } from './components/auth/AuthProvider';
import { AuthCallback } from './components/auth/AuthCallback';
import { ResetPassword } from './components/auth/ResetPassword';
import { SharedAnalysis } from './components/SharedAnalysis';
import { FloatingChat } from './components/FloatingChat';
import { useFormStore } from './store/formStore';

function App() {
  const { analysis } = useFormStore();

  // Check for required environment variables
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center p-4">
        <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-gray-300 mb-4">
            Missing required environment variables. Please ensure your .env file includes:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="text-sm text-gray-500">
            Contact the administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#1C1C1C]">
          <header className="bg-[#1C1C1C] border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">ProductLed</span>
                  <div className="w-1.5 h-1.5 ml-0.5 mb-1 bg-[#FFD23F] rounded-full" />
                  <span className="ml-3 text-gray-400">Free Model Analyzer</span>
                </div>
                <AuthButton />
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/share/:shareId" element={<SharedAnalysis />} />
                <Route path="/" element={<MultiStepForm />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {analysis && <FloatingChat analysis={analysis} />}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;