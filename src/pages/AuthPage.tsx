import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { loginUser, registerUser } from '../lib/api';
import { recordLoginAttempt, isLockedOut, resetLoginAttempts, formatLockoutTime } from '../lib/utils';
import { Card3D } from '../components/ui/Card3D';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state - clean defaults
  const [loginEmail, setLoginEmail] = useState(() => {
    const saved = localStorage.getItem('pg_verified_email');
    if (saved) {
      localStorage.removeItem('pg_verified_email');
      return saved;
    }
    return '';
  });
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCategory, setRegCategory] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const { locked, remainingMs } = isLockedOut();
    if (locked) {
      setErrorMsg(`Too many attempts. Try again in ${formatLockoutTime(remainingMs)}.`);
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(loginEmail, loginPassword);
      await refresh();
      resetLoginAttempts();
      navigate('/dashboard');
    } catch (err: unknown) {
      const result = recordLoginAttempt();
      if (result.locked) {
        setErrorMsg('Too many attempts. Locked for 15 minutes.');
      } else {
        setRemainingAttempts(result.remaining);
        const msg = err instanceof Error ? err.message : 'Invalid credentials';
        setErrorMsg(msg);
        if (msg.toLowerCase().includes('not verified')) {
          localStorage.setItem('pg_verify_email', loginEmail);
          setTimeout(() => navigate(`/verify?email=${encodeURIComponent(loginEmail)}`), 1500);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regEmail.trim() || !regPassword.trim() || !regFirstName.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(regEmail, regPassword, regFirstName.trim(), regLastName.trim(), regCategory);
      localStorage.setItem('pg_verify_email', regEmail);
      navigate(`/verify?email=${encodeURIComponent(regEmail)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = calculatePasswordStrength(mode === 'login' ? loginPassword : regPassword);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-violet-500/20 selection:text-violet-700">
      {/* 3D Ambient Glowing Mesh Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-[450px] h-[450px] rounded-full bg-[#C084FC] opacity-25 blur-[140px] transform-gpu" />
        <div className="absolute top-1/4 -right-24 w-[400px] h-[400px] rounded-full bg-[#F472B6] opacity-20 blur-[130px] transform-gpu" />
        <div className="absolute -bottom-24 left-1/3 w-[450px] h-[450px] rounded-full bg-[#38BDF8] opacity-15 blur-[150px] transform-gpu" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 shadow-lg shadow-violet-500/25 p-[2px] mb-1 group hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-violet-600 shadow-inner">
              <Sparkles className="w-7 h-7 text-violet-600 group-hover:rotate-12 transition-transform" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            PinGuru{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Automation
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Instagram Direct Message & Comment automation for creators, brands, and agencies.
          </p>
        </div>

        {/* 3D Auth Card */}
        <Card3D intensity={6} glowColor="rgba(124, 58, 237, 0.08)">
          <div className="bg-white/90 border border-slate-200/80 rounded-[32px] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_16px_40px_-6px_rgba(0,0,0,0.06)] space-y-6 backdrop-blur-xl">
            {/* Segmented Auth Mode Switcher */}
            <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-semibold">{errorMsg}</div>
                  {remainingAttempts !== null && remainingAttempts <= 3 && (
                    <div className="text-[11px] text-rose-600/80 mt-1">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-violet-600 hover:text-violet-700 font-semibold min-h-[30px] flex items-center"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[48px] bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-[0_8px_20px_-4px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Password Security</span>
                    <span className="font-sans text-violet-600 font-bold">
                      {strength <= 1 ? 'Weak' : strength <= 3 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          strength >= step
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Business / Industry (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      placeholder="e.g. Creator / E-commerce / Fitness"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 min-h-[44px] transition-all"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed">
                  By creating an account, you agree to the{' '}
                  <Link to="/terms" className="text-violet-600 hover:underline font-medium">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-violet-600 hover:underline font-medium">Privacy Policy</Link>.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[48px] bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-[0_8px_20px_-4px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <span>Creating Account...</span> : <span>Create Account</span>}
                </button>
              </form>
            )}
          </div>
        </Card3D>

        {/* Security & Meta Compliance Marker */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Meta Graph API v20.0 Compliant & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
