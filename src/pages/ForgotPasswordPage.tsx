import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowLeft, KeyRound, Mail } from 'lucide-react';
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
    <div className="auth-screen auth-screen-centered">
      <div className="auth-showcase-orb auth-showcase-orb-a" />
      <div className="auth-showcase-orb auth-showcase-orb-b" />
      <div className="auth-panel auth-reset-panel">
        <Link to="/" className="auth-panel-brand auth-card-brand">
          <div className="auth-panel-brand-mark">PG</div>
          <span>PinGuru</span>
        </Link>

        <div className="auth-icon-tile">
          <KeyRound size={22} />
        </div>

        <h1 className="auth-panel-title auth-centered-title">{isResetMode ? 'Set a new password' : 'Reset your password'}</h1>
        <p className="auth-panel-subtitle auth-centered-subtitle">
          {isResetMode ? 'Choose a new password to regain access to your PinGuru workspace.' : 'Enter your account email and we will send a secure reset link.'}
        </p>

        {error && (
          <div className="auth-alert error auth-alert-spaced">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && !error && (
          <div className="auth-alert success auth-alert-spaced">
            <CheckCircle size={15} className="flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {isResetMode ? (
          <form className="auth-panel-form" onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
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
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New password</label>
              <div className="auth-input-wrap">
                <KeyRound size={16} className="auth-input-icon" />
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
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
              <div className="auth-input-wrap">
                <KeyRound size={16} className="auth-input-icon" />
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-gradient-btn"
            >
              {loading ? 'Updating...' : 'Reset password'}
            </button>
          </form>
        ) : (
          <form className="auth-panel-form" onSubmit={handleRequest}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-gradient-btn"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>

            {requested && (
              <p className="auth-request-note">If the email exists, you will receive a reset link shortly.</p>
            )}
          </form>
        )}

        <p className="auth-panel-footer">
          <Link to="/login" className="inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;