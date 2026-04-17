import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { requireAuth } from './lib/api';
import { AppShell } from './components/layout/AppShell';

const LandingPage    = React.lazy(() => import('./pages/LandingPage'));
const LoginPage      = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage   = React.lazy(() => import('./pages/RegisterPage'));
const VerifyPage     = React.lazy(() => import('./pages/VerifyEmailPage'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
const DashboardPage  = React.lazy(() => import('./pages/DashboardPage'));
const ConnectPage    = React.lazy(() => import('./pages/ConnectPage'));
const RulesPage      = React.lazy(() => import('./pages/RulesPage'));
const ContactsPage   = React.lazy(() => import('./pages/ContactsPage'));
const AnalyticsPage  = React.lazy(() => import('./pages/AnalyticsPage'));
const BillingPage    = React.lazy(() => import('./pages/BillingPage'));
const SettingsPage   = React.lazy(() => import('./pages/SettingsPage'));
const PrivacyPage    = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage      = React.lazy(() => import('./pages/TermsPage'));

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    requireAuth().then(ok => setStatus(ok ? 'ok' : 'fail'));
  }, []);

  if (status === 'checking') return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );

  if (status === 'fail') return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
};

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'checking' | 'authed' | 'guest'>('checking');

  useEffect(() => {
    requireAuth().then(ok => setStatus(ok ? 'authed' : 'guest'));
  }, []);

  if (status === 'checking') return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );

  if (status === 'authed') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  }>
    {children}
  </React.Suspense>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/"         element={<PublicOnly><Page><LandingPage /></Page></PublicOnly>} />
      <Route path="/login"    element={<PublicOnly><Page><LoginPage /></Page></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Page><RegisterPage /></Page></PublicOnly>} />
      <Route path="/verify"   element={<PublicOnly><Page><VerifyPage /></Page></PublicOnly>} />
      <Route path="/privacy"  element={<Page><PrivacyPage /></Page>} />
      <Route path="/terms"    element={<Page><TermsPage /></Page>} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <React.Suspense fallback={null}>
          <OnboardingPage />
        </React.Suspense>
      } />

      {/* Protected */}
      <Route path="/dashboard"   element={<RequireAuth><Page><DashboardPage /></Page></RequireAuth>} />
      <Route path="/connect"     element={<RequireAuth><Page><ConnectPage /></Page></RequireAuth>} />
      <Route path="/connect.html" element={<RequireAuth><Page><ConnectPage /></Page></RequireAuth>} />
      <Route path="/rules"       element={<RequireAuth><Page><RulesPage /></Page></RequireAuth>} />
      <Route path="/contacts"    element={<RequireAuth><Page><ContactsPage /></Page></RequireAuth>} />
      <Route path="/analytics"   element={<RequireAuth><Page><AnalyticsPage /></Page></RequireAuth>} />
      <Route path="/billing"     element={<RequireAuth><Page><BillingPage /></Page></RequireAuth>} />
      <Route path="/settings"    element={<RequireAuth><Page><SettingsPage /></Page></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
