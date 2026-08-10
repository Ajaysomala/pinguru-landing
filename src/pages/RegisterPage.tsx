import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle, Mail, KeyRound, ArrowRight,
  Sparkles, UserRound, Briefcase, ShieldCheck, Rocket, Stars,
} from 'lucide-react';
import { registerUser } from '../lib/api';
import { BUSINESS_CATEGORIES } from '../lib/types';
import '../styles/auth.css';

const rules = [
  { id: 'len', label: '8+ characters', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'num', label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const allPassed = rules.every((r) => r.test(password));
  const match = password === confirm && confirm.length > 0;

  const handlePointer = (event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      if (tilt.x !== 0 || tilt.y !== 0) setTilt({ x: 0, y: 0 });
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: x * 8, y: y * -6 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      setError('Password does not meet requirements');
      return;
    }
    if (!match) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptedLegal) {
      setError('Please accept the Terms, Privacy Policy, and Cookie Policy');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser(email, password, firstName.trim(), lastName.trim(), businessCategory);
      localStorage.setItem('pg_verify_email', email);
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pg-auth-stage register" onMouseMove={handlePointer} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
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
        <Rocket size={14} /> Live in minutes
      </div>
      <div className="pg-auth-float pg-auth-float-b auth-float-in delay-1">
        <Stars size={14} /> Free forever plan
      </div>
      <div className="pg-auth-float pg-auth-float-c auth-float-in delay-2">
        <ShieldCheck size={14} /> Compliance-first DMs
      </div>

      <div
        className="pg-auth-shell wide auth-rise-in"
        style={{ transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      >
        <Link to="/" className="pg-auth-brand">
          <span className="pg-auth-brand-mark">PG</span>
          <span className="pg-auth-brand-text">PinGuru</span>
        </Link>

        <div className="pg-auth-kicker">
          <Sparkles size={13} /> Create account
        </div>
        <h1 className="pg-auth-title">Start converting Instagram into revenue</h1>
        <p className="pg-auth-subtitle">
          No credit card. Premium automation workspace with the PinGuru brand energy from day one.
        </p>

        {error && (
          <div className="pg-auth-alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form className="pg-auth-form" onSubmit={handleSubmit}>
          <div className="pg-auth-grid auth-field-in delay-1">
            <label className="pg-auth-field">
              <span>First name</span>
              <div className="pg-auth-input">
                <UserRound size={16} />
                <input
                  type="text"
                  placeholder="Ravi"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </label>
            <label className="pg-auth-field">
              <span>Last name</span>
              <div className="pg-auth-input">
                <UserRound size={16} />
                <input
                  type="text"
                  placeholder="Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </label>
          </div>

          <label className="pg-auth-field auth-field-in delay-2">
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
            <span>Password</span>
            <div className="pg-auth-input">
              <KeyRound size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {focused && password.length > 0 && (
              <div className="pg-auth-rules">
                {rules.map((r) => (
                  <span key={r.id} className={r.test(password) ? 'ok' : ''}>
                    <CheckCircle size={12} /> {r.label}
                  </span>
                ))}
              </div>
            )}
          </label>

          <label className="pg-auth-field auth-field-in delay-3">
            <span>Confirm password</span>
            <div className={`pg-auth-input ${confirm ? (match ? 'valid' : 'invalid') : ''}`}>
              <KeyRound size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </label>

          <label className="pg-auth-field auth-field-in delay-3">
            <span>Business category <em>(optional)</em></span>
            <div className="pg-auth-input">
              <Briefcase size={16} />
              <select value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)}>
                <option value="">Select a category</option>
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </label>

          <label className="pg-auth-check auth-field-in delay-3">
            <input
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => setAcceptedLegal(e.target.checked)}
              required
            />
            <span>
              I agree to the <Link to="/terms">Terms</Link>, <Link to="/privacy">Privacy Policy</Link>, and{' '}
              <Link to="/cookies">Cookie Policy</Link>.
            </span>
          </label>

          <button type="submit" className="pg-auth-cta auth-field-in delay-3" disabled={loading}>
            {loading ? (
              <span className="pg-auth-spinner" />
            ) : (
              <>
                Create free account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="pg-auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
