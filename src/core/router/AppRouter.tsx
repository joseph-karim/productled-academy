import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AcademyLayout } from '../components/layout/AcademyLayout';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { LandingPage } from '@/pages/LandingPage';
import { AcademyDashboard } from '@/pages/AcademyDashboard';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ModelModulePage } from '@/modules/model/ModelModulePage'; // Placeholder - needs creation
import { AuthCallback } from '../auth/AuthCallback';
import { ResetPassword } from '../auth/ResetPassword';
import { ForgotPassword } from '../auth/ForgotPassword';
import { AuthProvider } from '../auth/AuthProvider';
// Import other module pages here later
// import { OfferModulePage } from '../../modules/offer/OfferModulePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Auth Required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/model" element={<ModelModulePage />} /> {/* Free access */}
        
        {/* Auth Routes - Wrapped in AuthProvider */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Auth Routes - Wrapped in AuthProvider */}
        <Route element={<AuthProvider><AuthCallback /></AuthProvider>}>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes - Wrapped in AuthProvider */}
        <Route
          path="/app"
          element={
            <AuthProvider>
              <ProtectedRoute>
                <AcademyLayout />
              </ProtectedRoute>
            </AuthProvider>
          }
        >
          <Route index element={<AcademyDashboard />} />
          <Route path="model/:id" element={<ModelModulePage />} /> {/* Protected route for saved analyses */}
          {/* <Route path="offer" element={<OfferModulePage />} /> */}
          {/* Add other module routes here */}
          <Route path="*" element={<Navigate to="/app" replace />} /> {/* Redirect invalid /app routes */}
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
} 