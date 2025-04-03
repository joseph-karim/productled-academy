import React from 'react';
// Import the refactored MultiStepForm
import { MultiStepForm } from './components/MultiStepForm';

export function ModelModulePage() {
  // This page will likely just render the main component for the module
  // It might fetch initial data or context if needed, but MultiStepForm handles loading/saving
  return (
    <div>
      {/* Optional: Add a module-specific header or context here */}
      <MultiStepForm />
    </div>
  );
} 