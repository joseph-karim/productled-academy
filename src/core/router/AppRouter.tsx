import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AcademyLayout } from '../components/layout/AcademyLayout';
import { LoginPage } from '@/pages/LoginPage.tsx';
import { SignupPage } from '@/pages/SignupPage.tsx';
import { NewLandingPage as LandingPage } from '@/components/landing/NewLandingPage.tsx';
import { AcademyDashboard } from '@/pages/AcademyDashboard.tsx';
import { NotFoundPage } from '@/pages/NotFoundPage.tsx';
import { ProtectedRoute } from './ProtectedRoute';
import { ModelModulePage } from '@/modules/model/ModelModulePage.tsx'; // Placeholder - needs creation
import { AuthCallback } from '../auth/AuthCallback';
import { ResetPassword } from '../auth/ResetPassword';
import { ForgotPassword } from '../auth/ForgotPassword';
import { AuthProvider } from '../auth/AuthProvider';
import { ToolsPage } from '@/pages/ToolsPage';
import { Header } from '../components/layout/Header';
// Import other module pages here later
// import { OfferModulePage } from '../../modules/offer/OfferModulePage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Public Routes - No Auth Required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/model" element={<ModelModulePage />} /> {/* Free access */}
        <Route path="/tools" element={<ToolsPage />} />
        
        {/* Auth Routes - Wrapped in AuthProvider */}
        <Route element={<AuthProvider><Outlet /></AuthProvider>}>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes - Require Authentication */}
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
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<AcademyDashboard />} />
          <Route path="model/:id" element={<ModelModulePage />} /> {/* Protected route for saved analyses */}
          <Route path="tools" element={<ToolsPage />} />
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