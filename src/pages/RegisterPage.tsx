import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser } from '../lib/api';
import '../styles/auth.css';

const rules = [
  { id: 'len',    label: 'At least 8 characters',   test: (p: string) => p.length >= 8 },
  { id: 'upper',  label: 'One uppercase letter',     test: (p: string) => /[A-Z]/.test(p) },
  { id: 'num',    label: 'One number',               test: (p: string) => /[0-9]/.test(p) },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);

  const allPassed = rules.every(r => r.test(password));
  const match     = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) { setError('Password does not meet requirements'); return; }
    if (!match)     { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await registerUser(email, password);
      localStorage.setItem('pg_verify_email', email);
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-mark">PG</div>
          <span className="auth-logo-name">PinGuru</span>
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start automating your Instagram DMs today</p>

        {error && (
          <div className="auth-alert error mb-4">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-input" placeholder="you@example.com"
              required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input pr-10"
                placeholder="Min. 8 characters" required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength checklist */}
            {focused && password.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {rules.map(r => (
                  <div key={r.id} className={`flex items-center gap-1.5 text-xs ${r.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle size={12} className={r.test(password) ? 'opacity-100' : 'opacity-30'} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className={`form-input ${confirm.length > 0 ? (match ? 'border-emerald-400' : 'border-rose-400') : ''}`}
              placeholder="Repeat your password" required
              value={confirm} onChange={e => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full mt-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account...</>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
