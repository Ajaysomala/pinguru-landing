import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { loginUser } from '../lib/api';
import { recordLoginAttempt, isLockedOut, resetLoginAttempts, formatLockoutTime } from '../lib/utils';
import '../styles/auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [lockoutMsg, setLockoutMsg] = useState('');
  const [remaining, setRemaining]   = useState<number | null>(null);

  useEffect(() => {
    const { locked, remainingMs } = isLockedOut();
    if (locked) {
      setLockoutMsg(`Too many attempts. Try again in ${formatLockoutTime(remainingMs)}.`);
      const timer = setInterval(() => {
        const { locked: still, remainingMs: ms } = isLockedOut();
        if (!still) { setLockoutMsg(''); clearInterval(timer); }
        else setLockoutMsg(`Too many attempts. Try again in ${formatLockoutTime(ms)}.`);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { locked, remainingMs } = isLockedOut();
    if (locked) { setLockoutMsg(`Try again in ${formatLockoutTime(remainingMs)}.`); return; }

    setLoading(true); setError('');
    try {
      const data = await loginUser(email, password);
      resetLoginAttempts();
      localStorage.setItem('pg_user', JSON.stringify({ plan: data.plan, instagram_connected: data.instagram_connected }));
      if (data.instagram_connected) {
        navigate('/dashboard');
      } else {
        navigate('/connect?autostart=1');
      }
    } catch (err: any) {
      const result = recordLoginAttempt();
      if (result.locked) {
        setLockoutMsg(`Too many attempts. Locked for 15 minutes.`);
      } else {
        setRemaining(result.remaining);
        const msg = err.message || 'Invalid email or password';
        setError(msg);
        if (msg.toLowerCase().includes('not verified')) {
          localStorage.setItem('pg_verify_email', email);
          setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email)}`), 1500);
        }
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark">PG</div>
          <span className="auth-logo-name">PinGuru</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {lockoutMsg && (
          <div className="auth-alert error mb-4">
            <Lock size={15} className="flex-shrink-0 mt-0.5" />
            <span>{lockoutMsg}</span>
          </div>
        )}

        {error && !lockoutMsg && (
          <div className="auth-alert error mb-4">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {remaining !== null && remaining <= 3 && (
                <p className="text-xs mt-0.5 opacity-80">{remaining} attempt{remaining !== 1 ? 's' : ''} remaining before lockout</p>
              )}
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" type="email" className="form-input"
              placeholder="you@example.com" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password" type={showPwd ? 'text' : 'password'}
                className="form-input pr-10"
                placeholder="Min. 8 characters" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!lockoutMsg}
            className="w-full mt-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
