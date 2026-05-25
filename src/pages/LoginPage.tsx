import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { loginUser } from '../lib/api';
import { recordLoginAttempt, isLockedOut, resetLoginAttempts, formatLockoutTime } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
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
      void data; // session managed via HTTP-only cookie
      await refresh();
      resetLoginAttempts();
      navigate('/dashboard');
    } catch (err: any) {
      const result = recordLoginAttempt();
      if (result.locked) {
        setLockoutMsg(`Too many attempts. Locked for 15 minutes.`);
      } else {
        setRemaining(result.remaining);
        const msg = err.message || 'Invalid credentials';
        setError(msg);
        if (msg.toLowerCase().includes('not verified')) {
          localStorage.setItem('pg_verify_email', email);
          setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email)}`), 1500);
        }
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen auth-screen-split">
      <section className="auth-showcase">
        <div className="auth-showcase-video-layer" aria-hidden="true">
          <video
            className="auth-showcase-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/auth-showcase.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="auth-showcase-orb auth-showcase-orb-a" />
        <div className="auth-showcase-orb auth-showcase-orb-b" />
        <div className="auth-showcase-inner">
          <div className="auth-showcase-brand-mark">PG</div>
          <h2 className="auth-showcase-brand">PinGuru</h2>
          <p className="auth-showcase-copy">Turn every comment &amp; DM into a conversion. Automate your Instagram on autopilot.</p>

          <div className="auth-feature-stack">
            <div className="auth-feature-item"><span>⚡</span><p>Auto-reply to DMs &amp; comments instantly</p></div>
            <div className="auth-feature-item"><span>📊</span><p>Analytics dashboard to track performance</p></div>
            <div className="auth-feature-item"><span>🎯</span><p>Smart keyword matching with Hinglish support</p></div>
          </div>
        </div>
      </section>

      <section className="auth-pane">
        <div className="auth-panel">
          <Link to="/" className="auth-panel-brand">
            <div className="auth-panel-brand-mark">PG</div>
            <span>PinGuru</span>
          </Link>

          <h1 className="auth-panel-title">Welcome back 👋</h1>
          <p className="auth-panel-subtitle">Sign in to your account to continue</p>

          <button type="button" className="auth-google-btn">Continue with Google</button>

          <div className="auth-divider-row">
            <div className="line" />
            <span>or sign in with email</span>
            <div className="line" />
          </div>

          {lockoutMsg && (
            <div className="auth-alert error" style={{ marginBottom: 12 }}>
              <Lock size={15} className="flex-shrink-0" />
              <span>{lockoutMsg}</span>
            </div>
          )}

          {error && !lockoutMsg && (
            <div className="auth-alert error" style={{ marginBottom: 12 }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              <div>
                <span>{error}</span>
                {remaining !== null && remaining <= 3 && (
                  <p style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.8 }}>{remaining} attempt{remaining !== 1 ? 's' : ''} remaining before lockout</p>
                )}
              </div>
            </div>
          )}

          <form className="auth-panel-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="auth-field-row">
                <label className="form-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-link-inline">Forgot password?</Link>
              </div>
              <div className="auth-input-wrap">
                <KeyRound size={16} className="auth-input-icon" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="auth-input-action" onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !!lockoutMsg} className="auth-gradient-btn">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-panel-footer">Don't have an account? <Link to="/register">Create one free</Link></p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;