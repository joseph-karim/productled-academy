import React from 'react';
import { MultiStepForm } from './components/MultiStepForm';

function App() {
  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      <header className="bg-[#1C1C1C] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">ProductLed</span>
              <div className="w-1.5 h-1.5 ml-0.5 mb-1 bg-[#FFD23F] rounded-full" />
            </div>
            <span className="ml-3 text-gray-400">Free Model Analyzer</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MultiStepForm />
      </main>
    </div>
  );
}

export default App;