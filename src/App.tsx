import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getProfile } from './lib/api';
import { AppShell } from './components/layout/AppShell';
import type { User } from './lib/types';

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected client error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    console.error('AppErrorBoundary caught error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <h1 className="text-lg font-semibold text-slate-800">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2">{this.state.message || 'The app failed to render. Please reload once.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
) {
  return React.lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const key = 'pg_lazy_retry_done';
      const retried = sessionStorage.getItem(key) === '1';
      if (!retried) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      throw error;
    }
  });
}

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
    setStatus('checking');
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

const LandingPage    = lazyWithRetry(() => import('./pages/LandingPage'));
const BlogPage       = lazyWithRetry(() => import('./pages/BlogPage'));
const LoginPage      = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage   = lazyWithRetry(() => import('./pages/RegisterPage'));
const VerifyPage     = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const OnboardingPage = lazyWithRetry(() => import('./pages/OnboardingPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const DashboardPage  = lazyWithRetry(() => import('./pages/DashboardPage'));
const ConnectPage    = lazyWithRetry(() => import('./pages/ConnectPage'));
const RulesPage      = lazyWithRetry(() => import('./pages/RulesPage'));
const ContactsPage   = lazyWithRetry(() => import('./pages/ContactsPage'));
const AnalyticsPage  = lazyWithRetry(() => import('./pages/AnalyticsPage'));
const BillingPage    = lazyWithRetry(() => import('./pages/BillingPage'));
const SettingsPage   = lazyWithRetry(() => import('./pages/SettingsPage.tsx'));
const SettingsProfileEditPage = lazyWithRetry(() => import('./pages/SettingsProfileEditPage.tsx'));
const RefundPage     = lazyWithRetry(() => import('./pages/RefundPage'));
const PrivacyPage    = lazyWithRetry(() => import('./pages/PrivacyPage'));
const TermsPage      = lazyWithRetry(() => import('./pages/TermsPage'));
const SupportPage    = lazyWithRetry(() => import('./pages/SupportPage'));

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
    <AppErrorBoundary>
      <AuthProvider>
        <Routes>
        {/* Public */}
        <Route path="/"         element={<PublicOnly><Page><LandingPage /></Page></PublicOnly>} />
        <Route path="/login"    element={<PublicOnly><Page><LoginPage /></Page></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Page><RegisterPage /></Page></PublicOnly>} />
        <Route path="/verify"   element={<PublicOnly><Page><VerifyPage /></Page></PublicOnly>} />
        <Route path="/forgot-password" element={<Page><ForgotPasswordPage /></Page>} />
        <Route path="/privacy"  element={<Page><PrivacyPage /></Page>} />
        <Route path="/terms"    element={<Page><TermsPage /></Page>} />
        <Route path="/support"  element={<Page><SupportPage /></Page>} />
        <Route path="/blog"     element={<Page><BlogPage /></Page>} />
        <Route path="/blog/:slug" element={<Page><BlogPage /></Page>} />

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
        <Route path="/settings/profile" element={<RequireAuth><Page><SettingsProfileEditPage /></Page></RequireAuth>} />
        <Route path="/refund"       element={<RequireAuth><Page><RefundPage /></Page></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </AppErrorBoundary>
  </BrowserRouter>
);

export default App;