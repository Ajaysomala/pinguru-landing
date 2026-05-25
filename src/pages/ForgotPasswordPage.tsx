import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../lib/api';
import '../styles/auth.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const tokenParam = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [email, setEmail] = useState(emailParam);
  const [resetToken, setResetToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setResetToken(tokenParam);
  }, [emailParam, tokenParam]);

  const isResetMode = Boolean(resetToken);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await requestPasswordReset(email.trim());
      setRequested(true);
      setMessage(response.message);
      // Token arrives only via the email link — never extract from response body
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resetPassword(email.trim(), resetToken.trim(), newPassword);
      setMessage(response.message);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/login" className="auth-logo">
          <div className="auth-logo-mark">PG</div>
          <span className="auth-logo-name">PinGuru</span>
        </Link>

        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <KeyRound size={22} className="text-primary" />
          </div>
        </div>

        <h1 className="auth-title">{isResetMode ? 'Set a new password' : 'Forgot your password?'}</h1>
        <p className="auth-subtitle">
          {isResetMode ? 'Choose a new password to regain access to your account.' : 'We’ll email you a secure reset link.'}
        </p>

        {error && (
          <div className="auth-alert error mb-4">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && !error && (
          <div className="auth-alert success mb-4">
            <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {isResetMode ? (
          <form className="auth-form" onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Reset password'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRequest}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>

            {requested && (
              <p className="text-xs text-slate-500 text-center">
                If the email exists, you’ll receive a reset link shortly.
              </p>
            )}
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;