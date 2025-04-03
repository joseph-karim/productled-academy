import React from 'react';
import { MultiStepForm } from './components/MultiStepForm';

export function ModelModulePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Optional: Add a module-specific header or context here */}
      <MultiStepForm />
    </div>
  );
} 