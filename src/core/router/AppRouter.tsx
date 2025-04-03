import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AcademyLayout } from '../components/layout/AcademyLayout';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { AcademyDashboard } from '../../pages/AcademyDashboard';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ModelModulePage } from '../../modules/model/ModelModulePage'; // Placeholder - needs creation
// Import other module pages here later
// import { OfferModulePage } from '../../modules/offer/OfferModulePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Add route for auth callback if needed by Supabase */}
        {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}

        {/* Protected Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AcademyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AcademyDashboard />} />
          <Route path="model" element={<ModelModulePage />} />
          <Route path="model/:id" element={<ModelModulePage />} /> {/* Route for existing analysis */}
          {/* <Route path="offer" element={<OfferModulePage />} /> */}
          {/* Add other module routes here */}
          <Route path="*" element={<Navigate to="/app" replace />} /> {/* Redirect invalid /app routes */}
        </Route>

        {/* Redirect root path */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
} 