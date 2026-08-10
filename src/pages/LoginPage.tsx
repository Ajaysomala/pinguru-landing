import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, Lock, Mail, KeyRound, ArrowRight,
  Sparkles, Instagram, ShieldCheck, Zap,
} from 'lucide-react';
import { loginUser } from '../lib/api';
import { recordLoginAttempt, isLockedOut, resetLoginAttempts, formatLockoutTime } from '../lib/utils';
import { useAuth } from '../App';
import '../styles/auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutMsg, setLockoutMsg] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const { locked, remainingMs } = isLockedOut();
    if (locked) {
      setLockoutMsg(`Too many attempts. Try again in ${formatLockoutTime(remainingMs)}.`);
      const timer = setInterval(() => {
        const { locked: still, remainingMs: ms } = isLockedOut();
        if (!still) {
          setLockoutMsg('');
          clearInterval(timer);
        } else {
          setLockoutMsg(`Too many attempts. Try again in ${formatLockoutTime(ms)}.`);
        }
      }, 10000);
      return () => clearInterval(timer);
    }
  }, []);

  const handlePointer = (event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      if (tilt.x !== 0 || tilt.y !== 0) setTilt({ x: 0, y: 0 });
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: x * 10, y: y * -8 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { locked, remainingMs } = isLockedOut();
    if (locked) {
      setLockoutMsg(`Try again in ${formatLockoutTime(remainingMs)}.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      void data;
      await refresh();
      resetLoginAttempts();
      navigate('/dashboard');
    } catch (err: unknown) {
      const result = recordLoginAttempt();
      if (result.locked) {
        setLockoutMsg('Too many attempts. Locked for 15 minutes.');
      } else {
        setRemaining(result.remaining);
        const msg = err instanceof Error ? err.message : 'Invalid credentials';
        setError(msg);
        if (msg.toLowerCase().includes('not verified')) {
          localStorage.setItem('pg_verify_email', email);
          setTimeout(() => navigate(`/verify?email=${encodeURIComponent(email)}`), 1500);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg-auth-stage" onMouseMove={handlePointer} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="pg-auth-mesh" aria-hidden="true" />
      <div className="pg-auth-orb pg-auth-orb-a" aria-hidden="true" />
      <div className="pg-auth-orb pg-auth-orb-b" aria-hidden="true" />
      <div className="pg-auth-orb pg-auth-orb-c" aria-hidden="true" />
      <div className="pg-auth-ring pg-auth-ring-a" aria-hidden="true" />
      <div className="pg-auth-ring pg-auth-ring-b" aria-hidden="true" />
      <div className="pg-auth-sparkles" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>

      <div className="pg-auth-float pg-auth-float-a auth-float-in">
        <Instagram size={14} /> Live Instagram OAuth
      </div>
      <div className="pg-auth-float pg-auth-float-b auth-float-in delay-1">
        <Zap size={14} /> Instant DM rules
      </div>
      <div className="pg-auth-float pg-auth-float-c auth-float-in delay-2">
        <ShieldCheck size={14} /> Meta-policy ready
      </div>

      <div
        className="pg-auth-shell auth-rise-in"
        style={{ transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      >
        <Link to="/" className="pg-auth-brand">
          <span className="pg-auth-brand-mark">PG</span>
          <span className="pg-auth-brand-text">PinGuru</span>
        </Link>

        <div className="pg-auth-kicker">
          <Sparkles size={13} /> Welcome back
        </div>
        <h1 className="pg-auth-title">Sign in to your command center</h1>
        <p className="pg-auth-subtitle">
          Continue automating Instagram DMs with the same premium energy as your landing page.
        </p>

        {(lockoutMsg || error) && (
          <div className="pg-auth-alert">
            {lockoutMsg ? <Lock size={15} /> : <AlertCircle size={15} />}
            <div>
              <span>{lockoutMsg || error}</span>
              {!lockoutMsg && remaining !== null && remaining <= 3 && (
                <small>{remaining} attempt{remaining !== 1 ? 's' : ''} left before lockout</small>
              )}
            </div>
          </div>
        )}

        <form className="pg-auth-form" onSubmit={handleSubmit}>
          <label className="pg-auth-field auth-field-in delay-1">
            <span>Email</span>
            <div className="pg-auth-input">
              <Mail size={16} />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="pg-auth-field auth-field-in delay-2">
            <span className="pg-auth-field-top">
              Password
              <Link to="/forgot-password">Forgot?</Link>
            </span>
            <div className="pg-auth-input">
              <KeyRound size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="pg-auth-cta auth-field-in delay-3" disabled={loading || !!lockoutMsg}>
            {loading ? (
              <span className="pg-auth-spinner" />
            ) : (
              <>
                Enter PinGuru <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="pg-auth-switch">
          New here? <Link to="/register">Create a free account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
