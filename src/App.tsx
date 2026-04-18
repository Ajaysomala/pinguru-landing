import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getProfile } from './lib/api';
import { AppShell } from './components/layout/AppShell';
import type { User } from './lib/types';

// ── Auth context ──────────────────────────────────────────────────────────────
// One single /auth/me call at app boot. Every component reads from here —
// no component fetches /auth/me independently.

interface AuthContextValue {
  user: User | null;
  status: 'checking' | 'ok' | 'fail';
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: 'checking',
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  const load = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        setUser(profile);
        setStatus('ok');
      } else {
        setUser(null);
        setStatus('fail');
      }
    } catch {
      setUser(null);
      setStatus('fail');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AuthContext.Provider value={{ user, status, refresh: load }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Route guards ──────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
);

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth();
  if (status === 'checking') return <Spinner />;
  if (status === 'fail') return <Navigate to="/login" replace />;
  // Pass user down via AppShell — no extra fetch needed
  return <AppShell user={user}>{children}</AppShell>;
};

const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  if (status === 'checking') return <Spinner />;
  if (status === 'ok') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Lazy pages ────────────────────────────────────────────────────────────────

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
const BillingPage    = React.lazy(() => import('./pages/BillingPage.tsx'));
const SettingsPage   = React.lazy(() => import('./pages/SettingsPage'));
const RefundPage     = React.lazy(() => import('./pages/RefundPage.tsx'));
const PrivacyPage    = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage      = React.lazy(() => import('./pages/TermsPage'));
const SupportPage    = React.lazy(() => import('./pages/SupportPage'));

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  }>
    {children}
  </React.Suspense>
);

// ── App ───────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<PublicOnly><Page><LandingPage /></Page></PublicOnly>} />
        <Route path="/login"    element={<PublicOnly><Page><LoginPage /></Page></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Page><RegisterPage /></Page></PublicOnly>} />
        <Route path="/verify"   element={<PublicOnly><Page><VerifyPage /></Page></PublicOnly>} />
        <Route path="/privacy"  element={<Page><PrivacyPage /></Page>} />
        <Route path="/terms"    element={<Page><TermsPage /></Page>} />
        <Route path="/support"  element={<Page><SupportPage /></Page>} />

        {/* Onboarding */}
        <Route path="/onboarding" element={
          <React.Suspense fallback={null}>
            <OnboardingPage />
          </React.Suspense>
        } />

        {/* Protected — user prop flows from context through AppShell */}
        <Route path="/dashboard"    element={<RequireAuth><Page><DashboardPage /></Page></RequireAuth>} />
        <Route path="/connect"      element={<RequireAuth><Page><ConnectPage /></Page></RequireAuth>} />
        <Route path="/connect.html" element={<RequireAuth><Page><ConnectPage /></Page></RequireAuth>} />
        <Route path="/rules"        element={<RequireAuth><Page><RulesPage /></Page></RequireAuth>} />
        <Route path="/contacts"     element={<RequireAuth><Page><ContactsPage /></Page></RequireAuth>} />
        <Route path="/analytics"    element={<RequireAuth><Page><AnalyticsPage /></Page></RequireAuth>} />
        <Route path="/billing"      element={<RequireAuth><Page><BillingPage /></Page></RequireAuth>} />
        <Route path="/settings"     element={<RequireAuth><Page><SettingsPage /></Page></RequireAuth>} />
        <Route path="/refund"       element={<RequireAuth><Page><RefundPage /></Page></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;