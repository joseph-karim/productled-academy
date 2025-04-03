import React from 'react';
import { AppRouter } from '@/core/router/AppRouter';
import './index.css'; // Main CSS
import { ErrorBoundary } from 'react-error-boundary'; // Optional: Wrap everything

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;