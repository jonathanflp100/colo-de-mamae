import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { I18nProvider } from './i18n';
import { Layout } from './components/Layout';
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccessControlPage } from './pages/AccessControlPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { TurmaPage } from './pages/TurmaPage';
import { JourneyPage } from './pages/JourneyPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { MorePage } from './pages/MorePage';
import { AdminPage } from './pages/AdminPage';
import { Loader2 } from 'lucide-react';
import { AppLogo } from './components/AppLogo';

// Protected App Layout Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { user, loading, isAccessValid, needsOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col items-center justify-center p-6 text-[#8C4A3C]">
        <AppLogo size="md" showText={false} className="mb-4 animate-pulse" />
        <Loader2 className="w-6 h-6 animate-spin text-[#8C4A3C]" />
      </div>
    );
  }

  // Not logged in -> send to splash
  if (!user) {
    return <Navigate to="/splash" state={{ from: location }} replace />;
  }

  // Logged in but access expired or not yet granted -> send to access control
  if (!isAccessValid) {
    return <Navigate to="/access-pending" replace />;
  }

  // Access valid but onboarding not completed -> send to onboarding
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Layout title={title}>{children}</Layout>;
};

// Onboarding Guard
const OnboardingRoute: React.FC = () => {
  const { user, loading, isAccessValid, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-[#8C4A3C]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAccessValid) {
    return <Navigate to="/access-pending" replace />;
  }

  return <OnboardingPage />;
};

// Public Only Route (for login/register/splash when already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAccessValid, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF3EF] dark:bg-[#1A1514] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-[#8C4A3C]" />
      </div>
    );
  }

  if (user) {
    if (!isAccessValid) return <Navigate to="/access-pending" replace />;
    if (needsOnboarding) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry */}
            <Route
              path="/splash"
              element={
                <PublicRoute>
                  <SplashPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Access Control Screen */}
            <Route path="/access-pending" element={<AccessControlPage />} />

            {/* Onboarding Wizard */}
            <Route path="/onboarding" element={<OnboardingRoute />} />

            {/* 5 Main Tab Pages */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/turma"
              element={
                <ProtectedRoute title="Sua Turma">
                  <TurmaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornada"
              element={
                <ProtectedRoute>
                  <JourneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/memorias"
              element={
                <ProtectedRoute title="Diário e Memórias">
                  <MemoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mais"
              element={
                <ProtectedRoute title="Mais Opções">
                  <MorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute title="Painel de Administração">
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
